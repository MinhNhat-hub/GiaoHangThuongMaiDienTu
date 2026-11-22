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

  const shipperActor: UserProfile = {
    id: 'shp_1',
    email: 'shipper1@store.vn',
    fullName: 'Nguyen Van Giao',
    role: 'Shipper',
  };

  beforeEach(() => {
    storage = new AppStorage();
  });

  it('test_allows_return_submission_only_for_delivered_order_within_timeframe', () => {
    storage.reset();
    const order = storage.findOrderById('ord_4');
    expect(order?.status).toBe('DELIVERED');
    expect(order?.customerId).toBe(validCustomer.id);

    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_1', reason: 'DAMAGED_OR_DEFECTIVE' },
        validCustomer
      );
    }).toThrowError(/đã giao thành công/i);
  });

  it('test_rejects_return_request_when_delivered_order_exceeds_window', () => {
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_5', reason: 'DAMAGED_OR_DEFECTIVE' },
        validCustomer
      );
    }).toThrowError(/vượt quá thời hạn/i);
  });

  it('test_blocks_customer_from_submitting_return_for_another_customers_order', () => {
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_4', reason: 'ITEM_NOT_RECEIVED' },
        otherCustomer
      );
    }).toThrowError(/không có quyền/i);
  });

  it('test_prevents_duplicate_active_return_requests_for_same_order', () => {
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_4', reason: 'OTHER', notes: 'Second request' },
        validCustomer
      );
    }).toThrowError(/đã từng tạo yêu cầu hoàn trả/i);
  });

  it('test_approving_return_request_transitions_order_status_to_damaged_for_defect_reason', () => {
    const returnReq = storage.findReturnById('ret_1');
    expect(returnReq?.status).toBe('PENDING_APPROVAL');
    expect(returnReq?.reason).toBe('DAMAGED_OR_DEFECTIVE');

    const approved = storage.reviewReturn('ret_1', { action: 'APPROVE' }, adminActor);
    expect(approved.status).toBe('ACCEPTED');

    const order = storage.findOrderById(returnReq!.orderId);
    expect(order?.status).toBe('DAMAGED');
  });

  it('test_rejecting_return_request_requires_non_empty_reason_and_preserves_order_status', () => {
    const returnReq = storage.findReturnById('ret_1');
    const order = storage.findOrderById(returnReq!.orderId);
    const initialStatus = order?.status;

    expect(() => {
      storage.reviewReturn('ret_1', { action: 'REJECT', rejectionReason: '   ' }, adminActor);
    }).toThrowError(/lý do từ chối/i);

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

  it('test_rejects_return_notes_and_rejection_reason_exceeding_max_length', () => {
    const longNotes = 'a'.repeat(501);
    expect(() => {
      storage.submitReturn(
        { orderId: 'ord_4', reason: 'OTHER', notes: longNotes },
        validCustomer
      );
    }).toThrowError(/vượt quá 500 ký tự/i);

    expect(() => {
      storage.reviewReturn(
        'ret_1',
        { action: 'REJECT', rejectionReason: longNotes },
        adminActor
      );
    }).toThrowError(/vượt quá 500 ký tự/i);
  });

  it('test_shipper_and_admin_reporting_lost_issue_rules', () => {
    const order3 = storage.findOrderById('ord_3');
    expect(order3?.status).toBe('DELIVERING');

    const lostIssue = storage.reportIssue(
      'ord_3',
      { issueType: 'LOST', notes: 'Parcel lost during transport' },
      shipperActor
    );
    expect(lostIssue.issueType).toBe('LOST');
    expect(order3?.status).toBe('LOST');

    const orderPending = storage.findOrderById('ord_1');
    expect(orderPending?.status).toBe('PENDING_CONFIRMATION');
    expect(() => {
      storage.reportIssue(
        'ord_1',
        { issueType: 'LOST', notes: 'Admin reports lost before delivery' },
        adminActor
      );
    }).toThrowError(/đang trên đường giao/i);

    expect(() => {
      storage.reportIssue(
        'ord_1',
        { issueType: 'LOST' },
        validCustomer
      );
    }).toThrowError(/không có quyền/i);
  });
});
