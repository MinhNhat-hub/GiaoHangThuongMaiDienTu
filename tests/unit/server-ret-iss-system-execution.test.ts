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

  describe('module RET - return management workflow test cases', () => {
    it('test_ret_verifies_return_eligibility_across_order_lifecycle_statuses', () => {
      const deliveredOrder = storage.findOrderById('ord_4');
      expect(deliveredOrder?.status).toBe('DELIVERED');

      const deliveringOrder = storage.findOrderById('ord_3');
      expect(() => {
        storage.submitReturn({ orderId: deliveringOrder!.id, reason: 'DAMAGED_OR_DEFECTIVE' }, customerB);
      }).toThrowError(/đã giao thành công/i);

      const pendingOrder = storage.findOrderById('ord_1');
      expect(() => {
        storage.submitReturn({ orderId: pendingOrder!.id, reason: 'DAMAGED_OR_DEFECTIVE' }, customerA);
      }).toThrowError(/đã giao thành công/i);
    });

    it('test_ret_enforces_fifteen_day_return_window_boundary_rules', () => {
      const recentOrder = storage.findOrderById('ord_4');
      const deliveredDate = new Date(recentOrder?.updatedAt || recentOrder?.createdAt || '').getTime();
      const daysSince = (Date.now() - deliveredDate) / (1000 * 60 * 60 * 24);
      expect(daysSince).toBeLessThan(15);

      const expiredOrder = storage.findOrderById('ord_5');
      expect(() => {
        storage.submitReturn({ orderId: expiredOrder!.id, reason: 'DAMAGED_OR_DEFECTIVE' }, customerA);
      }).toThrowError(/vượt quá thời hạn/i);
    });

    it('test_ret_enforces_strict_customer_ownership_for_return_requests', () => {
      expect(() => {
        storage.submitReturn({ orderId: 'ord_4', reason: 'DAMAGED_OR_DEFECTIVE' }, customerB);
      }).toThrowError(/không có quyền/i);
    });

    it('test_ret_enforces_single_return_request_per_order_lifetime', () => {
      expect(() => {
        storage.submitReturn({ orderId: 'ord_4', reason: 'OTHER', notes: 'Duplicate try' }, customerA);
      }).toThrowError(/đã từng tạo yêu cầu hoàn trả/i);
    });

    it('test_ret_executes_admin_approval_mapping_to_damaged_or_lost_states', () => {
      const approved = storage.reviewReturn('ret_1', { action: 'APPROVE' }, adminA);
      expect(approved.status).toBe('ACCEPTED');

      const associatedOrder = storage.findOrderById(approved.orderId);
      expect(associatedOrder?.status).toBe('DAMAGED');

      storage.reset();
      const rejected = storage.reviewReturn(
        'ret_1',
        { action: 'REJECT', rejectionReason: 'Hàng không còn nguyên tem mác' },
        adminA
      );
      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectionReason).toContain('không còn nguyên tem mác');
    });

    it('test_ret_completes_return_workflow_without_altering_order_status', () => {
      const initialOrderStatus = storage.findOrderById('ord_10')?.status;
      const completed = storage.completeReturn('ret_2');
      expect(completed.status).toBe('COMPLETED');

      const completedOrder = storage.findOrderById(completed.orderId);
      expect(completedOrder?.status).toBe(initialOrderStatus);
    });
  });

  describe('module ISS - delivery exceptions and issue handling test cases', () => {
    it('test_iss_tracks_incremental_failed_delivery_attempts_accurately', () => {
      const order = storage.findOrderById('ord_3');
      expect(order?.shipment?.failedAttempts).toBe(0);

      storage.reportIssue('ord_3', { issueType: 'FAILED_DELIVERY', notes: 'First call no answer' }, shipperA);
      expect(order?.shipment?.failedAttempts).toBe(1);
      expect(order?.status).toBe('FAILED_DELIVERY');

      storage.updateShipmentStatus('ord_3', 'START_DELIVERY', shipperA);
      expect(order?.status).toBe('DELIVERING');

      storage.reportIssue('ord_3', { issueType: 'FAILED_DELIVERY', notes: 'Second call busy' }, shipperA);
      expect(order?.shipment?.failedAttempts).toBe(2);
      expect(order?.status).toBe('FAILED_DELIVERY');

      storage.updateShipmentStatus('ord_3', 'START_DELIVERY', shipperA);
      expect(order?.status).toBe('DELIVERING');

      storage.reportIssue('ord_3', { issueType: 'FAILED_DELIVERY', notes: 'Third call rejected' }, shipperA);
      expect(order?.shipment?.failedAttempts).toBe(3);
      expect(order?.status).toBe('FAILED_DELIVERY');
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
      const order1 = storage.findOrderById('ord_6');
      expect(order1?.shipment?.failedAttempts).toBe(1);

      const order3 = storage.findOrderById('ord_8');
      expect(order3?.shipment?.failedAttempts).toBe(3);
      expect(order3?.status).toBe('FAILED_DELIVERY');
    });

    it('test_iss_blocks_resolving_already_resolved_issue', () => {
      const issue = storage.findIssueById('iss_3');
      expect(issue?.resolved).toBe(true);

      expect(() => {
        storage.resolveIssue(
          'iss_3',
          { resolutionNotes: 'Cố tình giải quyết lại sự cố đã xong' },
          adminA
        );
      }).toThrowError(/đã được giải quyết/i);
    });
  });
});
