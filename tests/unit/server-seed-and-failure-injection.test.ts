import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearFailureInjection,
  getFailureInjection,
  resolveFailurePointFromHeader,
  setFailureInjection,
  StorageError,
} from '@/server/failureInjection';
import {
  getInitialSeedData,
} from '@/server/seedData';
import { AppStorage } from '@/server/storage';
import type { CreateOrderPayload, UserProfile } from '@/types/api';

describe('seed data integrity and failure injection mechanism', () => {
  let storage: AppStorage;

  const mockCustomer: UserProfile = {
    id: 'usr_customer_1',
    email: 'cust@example.com',
    fullName: 'Le Thi Khach',
    role: 'Customer',
  };

  const sampleOrderPayload: CreateOrderPayload = {
    recipientName: 'Nguyen Van A',
    recipientPhone: '0987654321',
    deliveryAddress: '789 Dien Bien Phu, Binh Thanh, TP.HCM',
    items: [
      { productId: 'prod_1', quantity: 2 },
      { productId: 'prod_2', quantity: 1 },
    ],
  };

  beforeEach(() => {
    storage = new AppStorage();
    clearFailureInjection();
  });

  it('test_seed_dataset_contains_all_required_roles_products_and_order_states', () => {
    const seed = getInitialSeedData();

    // Verify user roles
    const adminUser = seed.users.find((u) => u.role === 'Admin');
    const shipperUser = seed.users.find((u) => u.role === 'Shipper');
    const customerUser = seed.users.find((u) => u.role === 'Customer');
    expect(adminUser).toBeDefined();
    expect(shipperUser).toBeDefined();
    expect(customerUser).toBeDefined();

    // Verify products AS-2 and AS-3
    const productAs2 = seed.products.find((p) => p.sku === 'AS-2');
    const productAs3 = seed.products.find((p) => p.sku === 'AS-3');
    expect(productAs2).toBeDefined();
    expect(productAs3).toBeDefined();

    // Verify order statuses representation
    const statuses = new Set(seed.orders.map((o) => o.status));
    expect(statuses.has('PENDING_CONFIRMATION')).toBe(true);
    expect(statuses.has('WAITING_PICKUP')).toBe(true);
    expect(statuses.has('DELIVERING')).toBe(true);
    expect(statuses.has('DELIVERED')).toBe(true);
    expect(statuses.has('FAILED_DELIVERY')).toBe(true);
    expect(statuses.has('RETURNING')).toBe(true);
    expect(statuses.has('RETURNED_TO_SELLER')).toBe(true);
    expect(statuses.has('DAMAGED')).toBe(true);
    expect(statuses.has('LOST')).toBe(true);

    // Verify returns and issues
    expect(seed.returns.length).toBeGreaterThanOrEqual(4);
    expect(seed.issues.length).toBeGreaterThanOrEqual(4);
  });

  it('test_order_creation_rolls_back_when_order_storage_fails', () => {
    const initialCount = storage.listOrders().total;

    setFailureInjection('ORDER_STORE');
    expect(getFailureInjection()).toBe('ORDER_STORE');

    let thrownError: unknown;
    try {
      storage.createOrder(sampleOrderPayload, mockCustomer);
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeInstanceOf(StorageError);
    expect((thrownError as StorageError).stage).toBe('ORDER_STORE');

    // Verify strict transaction rollback: no order added
    const afterCount = storage.listOrders().total;
    expect(afterCount).toBe(initialCount);
  });

  it('test_order_creation_rolls_back_when_history_storage_fails', () => {
    const initialCount = storage.listOrders().total;

    setFailureInjection('ORDER_HISTORY');
    expect(getFailureInjection()).toBe('ORDER_HISTORY');

    let thrownError: unknown;
    try {
      storage.createOrder(sampleOrderPayload, mockCustomer);
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeInstanceOf(StorageError);
    expect((thrownError as StorageError).stage).toBe('ORDER_HISTORY');

    // Verify staged order was completely rolled back
    const afterCount = storage.listOrders().total;
    expect(afterCount).toBe(initialCount);
  });

  it('test_order_creation_succeeds_and_persists_when_no_failure_injected', () => {
    const initialCount = storage.listOrders().total;

    clearFailureInjection();
    const createdOrder = storage.createOrder(sampleOrderPayload, mockCustomer);

    expect(createdOrder).toBeDefined();
    expect(createdOrder.status).toBe('PENDING_CONFIRMATION');
    expect(createdOrder.items).toHaveLength(2);
    expect(createdOrder.history).toHaveLength(1);
    expect(createdOrder.history?.[0].newStatus).toBe('PENDING_CONFIRMATION');

    const afterCount = storage.listOrders().total;
    expect(afterCount).toBe(initialCount + 1);

    const retrieved = storage.findOrderById(createdOrder.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.recipientName).toBe('Nguyen Van A');
  });

  it('test_resolves_failure_point_from_header_values', () => {
    expect(resolveFailurePointFromHeader(undefined)).toBe('NONE');
    expect(resolveFailurePointFromHeader('')).toBe('NONE');
    expect(resolveFailurePointFromHeader('order-store')).toBe('ORDER_STORE');
    expect(resolveFailurePointFromHeader('ORDER_HISTORY')).toBe('ORDER_HISTORY');
    expect(resolveFailurePointFromHeader('delivery-store')).toBe('DELIVERY_STORE');
    expect(resolveFailurePointFromHeader('unknown_value')).toBe('NONE');
  });

  it('test_resets_storage_to_clean_seed_dataset', () => {
    const initialCount = storage.listOrders().total;

    storage.createOrder(sampleOrderPayload, mockCustomer);
    expect(storage.listOrders().total).toBe(initialCount + 1);

    storage.reset();
    expect(storage.listOrders().total).toBe(initialCount);
  });
});
