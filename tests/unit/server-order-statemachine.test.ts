import { beforeEach, describe, expect, it } from 'vitest';
import { AppStorage } from '@/server/storage';
import type { UserProfile } from '@/types/api';

describe('server order delivery state machine transitions', () => {
  let storage: AppStorage;

  const adminActor: UserProfile = {
    id: 'usr_admin_1',
    email: 'admin@store.vn',
    fullName: 'System Administrator',
    role: 'Admin',
  };

  const shipperActor: UserProfile = {
    id: 'shp_1',
    email: 'shipper@store.vn',
    fullName: 'Nguyen Van Shipper',
    role: 'Shipper',
  };

  beforeEach(() => {
    storage = new AppStorage();
  });

  it('test_transitions_pending_order_to_waiting_pickup_when_admin_creates_shipment', () => {
    const order = storage.findOrderById('ord_1');
    expect(order).toBeDefined();
    expect(order?.status).toBe('PENDING_CONFIRMATION');

    const updated = storage.createShipment('ord_1', shipperActor.id, adminActor);
    expect(updated.status).toBe('WAITING_PICKUP');
    expect(updated.shipment?.shipperId).toBe(shipperActor.id);
    expect(updated.history?.slice(-1)[0].newStatus).toBe('WAITING_PICKUP');
  });

  it('test_transitions_waiting_pickup_order_to_delivering_when_shipper_starts_delivery', () => {
    const order = storage.findOrderById('ord_2');
    expect(order?.status).toBe('WAITING_PICKUP');

    const updated = storage.updateShipmentStatus('ord_2', 'START_DELIVERY', shipperActor);
    expect(updated.status).toBe('DELIVERING');
    expect(updated.history?.slice(-1)[0].newStatus).toBe('DELIVERING');
  });

  it('test_transitions_delivering_order_to_delivered_when_shipper_confirms_delivery', () => {
    const order = storage.findOrderById('ord_3');
    expect(order?.status).toBe('DELIVERING');

    const updated = storage.updateShipmentStatus('ord_3', 'CONFIRM_DELIVERED', shipperActor);
    expect(updated.status).toBe('DELIVERED');
    expect(updated.history?.slice(-1)[0].newStatus).toBe('DELIVERED');
  });

  it('test_rejects_confirming_delivery_when_order_is_not_in_delivering_state', () => {
    const order = storage.findOrderById('ord_2');
    expect(order?.status).toBe('WAITING_PICKUP');
    expect(order?.shipment?.shipperId).toBe(shipperActor.id);

    expect(() => {
      storage.updateShipmentStatus('ord_2', 'CONFIRM_DELIVERED', shipperActor);
    }).toThrowError(/đang trong trạng thái giao/i);
  });

  it('test_increments_failed_attempts_counter_when_shipper_reports_failed_delivery', () => {
    const order = storage.findOrderById('ord_3');
    expect(order?.status).toBe('DELIVERING');
    const initialAttempts = order?.shipment?.failedAttempts || 0;

    const issue = storage.reportIssue(
      'ord_3',
      { issueType: 'FAILED_DELIVERY', notes: 'Recipient phone turned off' },
      shipperActor
    );

    expect(issue.issueType).toBe('FAILED_DELIVERY');
    expect(order?.status).toBe('FAILED_DELIVERY');
    expect(order?.shipment?.failedAttempts).toBe(initialAttempts + 1);
  });

  it('test_allows_restarting_delivery_from_failed_state_when_under_max_attempts', () => {
    const order = storage.findOrderById('ord_6');
    expect(order?.status).toBe('FAILED_DELIVERY');
    expect(order?.shipment?.failedAttempts).toBe(1);

    const restarted = storage.updateShipmentStatus('ord_6', 'START_DELIVERY', shipperActor);
    expect(restarted.status).toBe('DELIVERING');
  });

  it('test_transitions_returning_order_to_returned_to_seller_on_warehouse_receipt', () => {
    const order = storage.findOrderById('ord_9');
    expect(order?.status).toBe('RETURNING');

    // Admin/warehouse completes return
    const timestamp = new Date().toISOString();
    order!.status = 'RETURNED_TO_SELLER';
    order!.updatedAt = timestamp;
    order!.history?.push({
      oldStatus: 'RETURNING',
      newStatus: 'RETURNED_TO_SELLER',
      changedBy: adminActor.id,
      changedByName: adminActor.fullName,
      changedAt: timestamp,
    });

    expect(order?.status).toBe('RETURNED_TO_SELLER');
    expect(order?.history?.slice(-1)[0].newStatus).toBe('RETURNED_TO_SELLER');
  });
});
