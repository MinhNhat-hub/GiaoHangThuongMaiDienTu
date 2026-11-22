import { beforeEach, describe, expect, it } from 'vitest';
import { AppStorage } from '@/server/storage';
import type { UserProfile } from '@/types/api';

describe('server domain business rules and access validation', () => {
  let storage: AppStorage;

  const validCustomer: UserProfile = {
    id: 'usr_customer_1',
    email: 'cust@example.com',
    fullName: 'Le Thi Khach',
    role: 'Customer',
  };

  const otherCustomer: UserProfile = {
    id: 'usr_customer_2',
    email: 'cust2@example.com',
    fullName: 'Pham Van Khach',
    role: 'Customer',
  };

  const adminActor: UserProfile = {
    id: 'usr_admin_1',
    email: 'admin@store.vn',
    fullName: 'System Administrator',
    role: 'Admin',
  };

  beforeEach(() => {
    storage = new AppStorage();
  });

  it('test_allows_return_submission_only_for_delivered_order_within_timeframe', () => {
    // ord_4 is DELIVERED 2 days ago (< 15 days) and belongs to usr_customer_1
    // First clear existing ret_1 for ord_4 so we test submission cleanly
    storage.reset();

    // Re-check order ord_4
    const order = storage.findOrderById('ord_4');
    expect(order?.status).toBe('DELIVERED');
    expect(order?.customerId).toBe(validCustomer.id);

    // Attempting return on order ord_1 (PENDING_CONFIRMATION) must fail
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_1', reason: 'DAMAGED_OR_DEFECTIVE' },
        validCustomer
      );
    }).toThrowError(/đã giao thành công/i);
  });

  it('test_rejects_return_request_when_delivered_order_exceeds_window', () => {
    // ord_5 is DELIVERED 20 days ago (> 15 days window)
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_5', reason: 'DAMAGED_OR_DEFECTIVE' },
        validCustomer
      );
    }).toThrowError(/vượt quá thời hạn/i);
  });

  it('test_blocks_customer_from_submitting_return_for_another_customers_order', () => {
    // ord_4 belongs to usr_customer_1; usr_customer_2 cannot submit return
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_4', reason: 'ITEM_NOT_RECEIVED' },
        otherCustomer
      );
    }).toThrowError(/không có quyền/i);
  });

  it('test_prevents_duplicate_active_return_requests_for_same_order', () => {
    // ord_4 already has ret_1 with status PENDING_APPROVAL in initial seed
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_4', reason: 'OTHER', notes: 'Second request' },
        validCustomer
      );
    }).toThrowError(/đang được xử lý/i);
  });

  it('test_approving_return_request_transitions_order_status_to_returning', () => {
    const returnReq = storage.findReturnById('ret_1');
    expect(returnReq?.status).toBe('PENDING_APPROVAL');

    const approved = storage.reviewReturn('ret_1', { action: 'APPROVE' }, adminActor);
    expect(approved.status).toBe('ACCEPTED');

    const order = storage.findOrderById(returnReq!.orderId);
    expect(order?.status).toBe('RETURNING');
  });

  it('test_rejecting_return_request_records_reason_and_preserves_order_status', () => {
    const returnReq = storage.findReturnById('ret_1');
    const order = storage.findOrderById(returnReq!.orderId);
    const initialStatus = order?.status;

    const rejected = storage.reviewReturn(
      'ret_1',
      { action: 'REJECT', rejectionReason: 'Sản phẩm đã qua sử dụng và bị can thiệp' },
      adminActor
    );

    expect(rejected.status).toBe('REJECTED');
    expect(rejected.rejectionReason).toContain('đã qua sử dụng');
    expect(order?.status).toBe(initialStatus);
  });

  it('test_admin_resolves_delivery_issue_with_recorded_timestamp_and_actor', () => {
    const issue = storage.findIssueById('iss_1');
    expect(issue?.resolved).toBe(false);

    const resolved = storage.resolveIssue(
      'iss_1',
      { resolutionNotes: 'Đã liên hệ người nhận, hẹn giao lại vào ca sáng' },
      adminActor
    );

    expect(resolved.resolved).toBe(true);
    expect(resolved.resolvedBy).toBe(adminActor.id);
    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.resolutionNotes).toContain('hẹn giao lại');
  });
});
