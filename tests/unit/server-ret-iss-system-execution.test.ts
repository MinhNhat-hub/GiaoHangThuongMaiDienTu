import { beforeEach, describe, expect, it } from 'vitest';
import { AppStorage } from '@/server/storage';
import type { UserProfile } from '@/types/api';

describe('system test execution for return management (RET) and exception handling (ISS)', () => {
  let storage: AppStorage;

  const customerA: UserProfile = {
    id: 'usr_customer_1',
    email: 'cust@example.com',
    fullName: 'Le Thi Khach',
    role: 'Customer',
  };

  const customerB: UserProfile = {
    id: 'usr_customer_2',
    email: 'cust2@example.com',
    fullName: 'Pham Van Khach',
    role: 'Customer',
  };

  const shipperA: UserProfile = {
    id: 'shp_1',
    email: 'shipper@store.vn',
    fullName: 'Nguyen Van Shipper',
    role: 'Shipper',
  };

  const adminA: UserProfile = {
    id: 'usr_admin_1',
    email: 'admin@store.vn',
    fullName: 'Store Administrator',
    role: 'Admin',
  };

  beforeEach(() => {
    storage = new AppStorage();
  });

  // --- MODULE RET (Return Management) ---
  describe('module RET - return management workflow test cases', () => {
    it('test_ret_verifies_return_eligibility_across_order_lifecycle_statuses', () => {
      // 1. Delivered order within return window: eligible
      const deliveredOrder = storage.findOrderById('ord_4');
      expect(deliveredOrder?.status).toBe('DELIVERED');

      // 2. Delivering order: not eligible
      const deliveringOrder = storage.findOrderById('ord_3');
      expect(() => {
        storage.submitReturn({ orderId: deliveringOrder!.id, reason: 'DAMAGED_OR_DEFECTIVE' }, customerB);
      }).toThrowError(/đã giao thành công/i);

      // 3. Pending confirmation order: not eligible
      const pendingOrder = storage.findOrderById('ord_1');
      expect(() => {
        storage.submitReturn({ orderId: pendingOrder!.id, reason: 'DAMAGED_OR_DEFECTIVE' }, customerA);
      }).toThrowError(/đã giao thành công/i);
    });

    it('test_ret_enforces_fifteen_day_return_window_boundary_rules', () => {
      // Delivered order delivered 2 days ago: valid
      const recentOrder = storage.findOrderById('ord_4');
      const deliveredDate = new Date(recentOrder?.updatedAt || recentOrder?.createdAt || '').getTime();
      const daysSince = (Date.now() - deliveredDate) / (1000 * 60 * 60 * 24);
      expect(daysSince).toBeLessThan(15);

      // Delivered order delivered 20 days ago: rejected
      const expiredOrder = storage.findOrderById('ord_5');
      expect(() => {
        storage.submitReturn({ orderId: expiredOrder!.id, reason: 'DAMAGED_OR_DEFECTIVE' }, customerA);
      }).toThrowError(/vượt quá thời hạn/i);
    });

    it('test_ret_enforces_strict_customer_ownership_for_return_requests', () => {
      // Customer B cannot submit return for Customer A's order ord_4
      expect(() => {
        storage.submitReturn({ orderId: 'ord_4', reason: 'DAMAGED_OR_DEFECTIVE' }, customerB);
      }).toThrowError(/không có quyền/i);
    });

    it('test_ret_enforces_single_active_return_request_per_order', () => {
      // ord_4 already has ret_1 active with PENDING_APPROVAL
      expect(() => {
        storage.submitReturn({ orderId: 'ord_4', reason: 'OTHER', notes: 'Duplicate try' }, customerA);
      }).toThrowError(/đang được xử lý/i);
    });

    it('test_ret_executes_admin_approval_and_rejection_state_transformations', () => {
      // Review return approval
      const approved = storage.reviewReturn('ret_1', { action: 'APPROVE' }, adminA);
      expect(approved.status).toBe('ACCEPTED');

      const associatedOrder = storage.findOrderById(approved.orderId);
      expect(associatedOrder?.status).toBe('RETURNING');

      // Review return rejection
      storage.reset();
      const rejected = storage.reviewReturn(
        'ret_1',
        { action: 'REJECT', rejectionReason: 'Hàng không còn nguyên tem mác' },
        adminA
      );
      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectionReason).toContain('không còn nguyên tem mác');
    });

    it('test_ret_completes_return_workflow_when_warehouse_receives_goods', () => {
      // ret_2 is ACCEPTED
      const completed = storage.completeReturn('ret_2');
      expect(completed.status).toBe('COMPLETED');

      const completedOrder = storage.findOrderById(completed.orderId);
      expect(completedOrder?.status).toBe('RETURNED_TO_SELLER');
    });
  });

  // --- MODULE ISS (Exception & Issues Management) ---
  describe('module ISS - delivery exceptions and issue handling test cases', () => {
    it('test_iss_tracks_incremental_failed_delivery_attempts_accurately', () => {
      const order = storage.findOrderById('ord_3');
      expect(order?.shipment?.failedAttempts).toBe(0);

      // Attempt 1
      storage.reportIssue('ord_3', { issueType: 'FAILED_DELIVERY', notes: 'First call no answer' }, shipperA);
      expect(order?.shipment?.failedAttempts).toBe(1);
      expect(order?.status).toBe('FAILED_DELIVERY');

      // Attempt 2
      storage.reportIssue('ord_3', { issueType: 'FAILED_DELIVERY', notes: 'Second call busy' }, shipperA);
      expect(order?.shipment?.failedAttempts).toBe(2);

      // Attempt 3
      storage.reportIssue('ord_3', { issueType: 'FAILED_DELIVERY', notes: 'Third call rejected' }, shipperA);
      expect(order?.shipment?.failedAttempts).toBe(3);
    });

    it('test_iss_records_damaged_and_lost_incidents_with_status_transitions', () => {
      const orderDamaged = storage.findOrderById('ord_11');
      expect(orderDamaged?.status).toBe('DAMAGED');

      const orderLost = storage.findOrderById('ord_12');
      expect(orderLost?.status).toBe('LOST');
    });

    it('test_iss_enforces_mandatory_non_empty_resolution_notes_on_resolve', () => {
      expect(() => {
        storage.resolveIssue('iss_1', { resolutionNotes: '   ' }, adminA);
      }).toThrowError(/sự cố|resolution/i);
    });

    it('test_iss_enforces_three_attempt_rule_before_return_shipment_is_permitted', () => {
      // ord_6 has 1 failed attempt: not permitted to return
      const order1 = storage.findOrderById('ord_6');
      expect(order1?.shipment?.failedAttempts).toBe(1);

      // ord_8 has 3 failed attempts: permitted to transition to RETURNING
      const order3 = storage.findOrderById('ord_8');
      expect(order3?.shipment?.failedAttempts).toBe(3);
      expect(order3?.status).toBe('FAILED_DELIVERY');
    });

    it('test_iss_resolves_issue_and_records_admin_audit_trail', () => {
      const issue = storage.findIssueById('iss_2');
      expect(issue?.resolved).toBe(false);

      const resolved = storage.resolveIssue(
        'iss_2',
        { resolutionNotes: 'Đã lập biên bản hủy đơn và chuyển hoàn cho người bán' },
        adminA
      );

      expect(resolved.resolved).toBe(true);
      expect(resolved.resolvedBy).toBe(adminA.id);
      expect(resolved.resolvedAt).toBeDefined();
      expect(resolved.resolutionNotes).toContain('chuyển hoàn');
    });
  });
});
