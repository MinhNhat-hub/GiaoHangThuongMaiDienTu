import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { RealtimeNotificationBar } from '@/components/layout/RealtimeNotificationBar';
import { TEST_IDS } from '@/constants/test-ids';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
import { CustomerReturnsPage } from '@/features/returns/CustomerReturnsPage';
import { ReturnRequestPage } from '@/features/returns/ReturnRequestPage';
import { realtimeClient } from '@/realtime/event-client';
import { ProtectedLayout } from '@/routes/guards';
import type { Order, ReturnRequest } from '@/types/api';
import { clearOrderMetaCache } from '@/utils/order';

const CUSTOMER_USER = {
  id: 'cust_1',
  email: 'cust1@example.com',
  fullName: 'Customer One',
  phoneNumber: '0901234567',
  role: 'Customer' as const,
};

function buildDeliveredOrder(deliveredAtIso: string, overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord_deliv_1',
    code: 'DH-2026-0500',
    customerId: 'cust_1',
    customerName: 'Customer One',
    customerEmail: 'cust1@example.com',
    recipientName: 'Tran Van B',
    recipientPhone: '0912345678',
    deliveryAddress: '100 Hai Ba Trung',
    status: 'DELIVERED',
    createdAt: '2026-06-01T01:00:00.000Z',
    updatedAt: deliveredAtIso,
    items: [{ id: 'i1', productId: 'p1', productName: 'Loa Bluetooth', quantity: 1 }],
    history: [
      {
        oldStatus: null,
        newStatus: 'PENDING_CONFIRMATION',
        changedBy: 'cust_1',
        changedByEmail: 'cust1@example.com',
        changedAt: '2026-06-01T01:00:00.000Z',
      },
      {
        oldStatus: 'DELIVERING',
        newStatus: 'DELIVERED',
        changedBy: 'shipper_1',
        changedByEmail: 'shipper@example.com',
        changedAt: deliveredAtIso,
      },
    ],
    ...overrides,
  };
}

describe('customer returns, eligibility rules, and real-time updates', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOrderMetaCache();
    realtimeClient.disconnect();
    apiClient.setToken('cust_token');
    apiClient.setUser(CUSTOMER_USER);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    act(() => {
      realtimeClient.disconnect();
    });
    localStorage.clear();
    clearOrderMetaCache();
  });

  it('test_refuses_return_request_when_order_not_delivered_expired_or_already_requested', async () => {
    vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(
      buildDeliveredOrder(new Date().toISOString(), { status: 'DELIVERING' })
    );
    vi.spyOn(apiClient, 'listReturns').mockResolvedValue([]);

    const nonDelivered = render(
      <MemoryRouter initialEntries={['/orders/DH-2026-0500/return']}>
        <Routes>
          <Route path="/orders/:id/return" element={<ReturnRequestPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.COMMON.ERROR_BANNER);
    expect(screen.queryByTestId(TEST_IDS.RETURN.REQUEST_FORM)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.RETURN.CANCEL_BUTTON)).toBeVisible();
    nonDelivered.unmount();

    const expiredAt = new Date(Date.now() - (15 * 24 * 60 + 2) * 60_000).toISOString();
    vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(buildDeliveredOrder(expiredAt));

    const expiredView = render(
      <MemoryRouter initialEntries={['/orders/DH-2026-0500/return']}>
        <Routes>
          <Route path="/orders/:id/return" element={<ReturnRequestPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.COMMON.ERROR_BANNER);
    expect(screen.queryByTestId(TEST_IDS.RETURN.REQUEST_FORM)).not.toBeInTheDocument();
    expiredView.unmount();

    vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(
      buildDeliveredOrder(new Date().toISOString())
    );
    vi.spyOn(apiClient, 'listReturns').mockResolvedValue([
      {
        id: 'ret_existing',
        code: 'TH-2026-0001',
        orderId: 'ord_deliv_1',
        orderCode: 'DH-2026-0500',
        customerId: 'cust_1',
        reason: 'OTHER',
        status: 'REJECTED',
        rejectionReason: 'Da qua han hoac thieu bang chung',
        createdAt: new Date().toISOString(),
      },
    ]);

    render(
      <MemoryRouter initialEntries={['/orders/DH-2026-0500/return']}>
        <Routes>
          <Route path="/orders/:id/return" element={<ReturnRequestPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.COMMON.ERROR_BANNER);
    expect(screen.queryByTestId(TEST_IDS.RETURN.REQUEST_FORM)).not.toBeInTheDocument();
  });

  it('test_validates_other_reason_notes_and_submits_eligible_return_request', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(
      buildDeliveredOrder(new Date().toISOString())
    );
    vi.spyOn(apiClient, 'listReturns').mockResolvedValue([]);
    const submitSpy = vi.spyOn(apiClient, 'submitReturn').mockResolvedValue({
      id: 'ret_1',
      code: 'TH-2026-0010',
      orderId: 'ord_deliv_1',
      orderCode: 'DH-2026-0500',
      customerId: 'cust_1',
      reason: 'OTHER',
      status: 'PENDING_APPROVAL',
      notes: 'San pham giao thieu phu kien',
      createdAt: new Date().toISOString(),
    });

    render(
      <MemoryRouter initialEntries={['/orders/DH-2026-0500/return']}>
        <Routes>
          <Route path="/orders/:id/return" element={<ReturnRequestPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.RETURN.REQUEST_FORM);
    await user.click(screen.getByTestId(TEST_IDS.RETURN.SUBMIT_BUTTON));
    expect(screen.getByTestId(TEST_IDS.RETURN.REASON_ERROR)).toBeVisible();

    await user.selectOptions(screen.getByTestId(TEST_IDS.RETURN.REASON_SELECT), 'OTHER');
    await user.click(screen.getByTestId(TEST_IDS.RETURN.SUBMIT_BUTTON));
    expect(screen.getByTestId(TEST_IDS.RETURN.NOTES_ERROR)).toBeVisible();

    await user.type(
      screen.getByTestId(TEST_IDS.RETURN.NOTES_INPUT),
      'San pham giao thieu phu kien'
    );
    await user.click(screen.getByTestId(TEST_IDS.RETURN.SUBMIT_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.RETURN.SUCCESS_MESSAGE)).toBeVisible();
    });
    expect(submitSpy).toHaveBeenCalledWith({
      orderId: 'ord_deliv_1',
      reason: 'OTHER',
      notes: 'San pham giao thieu phu kien',
    });
  });

  it('test_lists_customer_return_requests_with_rejection_reason_when_rejected', async () => {
    const returns: ReturnRequest[] = [
      {
        id: 'r1',
        code: 'TH-2026-0011',
        orderId: 'o1',
        orderCode: 'DH-2026-0011',
        customerId: 'cust_1',
        reason: 'DAMAGED_OR_DEFECTIVE',
        status: 'PENDING_APPROVAL',
        notes: 'Vo hop',
        createdAt: '2026-06-11T04:00:00.000Z',
      },
      {
        id: 'r2',
        code: 'TH-2026-0012',
        orderId: 'o2',
        orderCode: 'DH-2026-0012',
        customerId: 'cust_1',
        reason: 'ITEM_NOT_RECEIVED',
        status: 'REJECTED',
        notes: '',
        rejectionReason: 'Shipper da cung cap anh ky nhan hop le',
        createdAt: '2026-06-11T05:00:00.000Z',
      },
    ];
    vi.spyOn(apiClient, 'listReturns').mockResolvedValue(returns);

    render(
      <MemoryRouter initialEntries={['/returns']}>
        <CustomerReturnsPage />
      </MemoryRouter>
    );

    const rows = await screen.findAllByTestId(TEST_IDS.RETURN.LIST_ITEM);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('TH-2026-0011');
    expect(rows[0]).toHaveTextContent('Hàng lỗi / hư hỏng');
    expect(rows[0]).toHaveTextContent('11/06/2026 11:00');
    expect(rows[1]).toHaveTextContent('Bị từ chối');
    expect(rows[1]).toHaveTextContent('Shipper da cung cap anh ky nhan hop le');
  });

  it('test_updates_order_details_and_scoped_notifications_realtime_and_after_reconnect', async () => {
    const initialOrder = buildDeliveredOrder('2026-06-10T02:00:00.000Z', {
      status: 'WAITING_PICKUP',
      history: [
        {
          oldStatus: null,
          newStatus: 'PENDING_CONFIRMATION',
          changedBy: 'cust_1',
          changedByEmail: 'cust1@example.com',
          changedAt: '2026-06-10T01:00:00.000Z',
        },
        {
          oldStatus: 'PENDING_CONFIRMATION',
          newStatus: 'WAITING_PICKUP',
          changedBy: 'adm_1',
          changedByEmail: 'admin@store.vn',
          changedAt: '2026-06-10T01:30:00.000Z',
        },
      ],
    });
    const reconnectedOrder = buildDeliveredOrder('2026-06-10T03:00:00.000Z');

    const getDetailSpy = vi
      .spyOn(apiClient, 'getOrderDetail')
      .mockResolvedValueOnce(initialOrder)
      .mockResolvedValueOnce(reconnectedOrder);

    render(
      <MemoryRouter initialEntries={['/orders/DH-2026-0500']}>
        <Routes>
          <Route element={<ProtectedLayout />}>
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent('Chờ lấy hàng');

    act(() => {
      realtimeClient.emit('order.status_changed', {
        orderId: 'ord_other',
        orderCode: 'DH-OTHER',
        customerId: 'cust_other',
        oldStatus: 'WAITING_PICKUP',
        newStatus: 'DELIVERING',
        changedAt: '2026-06-10T02:00:00.000Z',
      });
    });

    expect(screen.queryAllByTestId(TEST_IDS.COMMON.NOTIFICATION)).toHaveLength(0);

    act(() => {
      realtimeClient.emit('order.status_changed', {
        orderId: 'ord_deliv_1',
        orderCode: 'DH-2026-0500',
        customerId: 'cust_1',
        oldStatus: 'WAITING_PICKUP',
        newStatus: 'DELIVERING',
        changedBy: 'shipper_1',
        changedByEmail: 'shipper@example.com',
        changedAt: '2026-06-10T02:15:00.000Z',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent('Đang giao');
    });
    expect(screen.getAllByTestId(TEST_IDS.COMMON.NOTIFICATION)).toHaveLength(1);
    expect(screen.getByTestId(TEST_IDS.COMMON.NOTIFICATION)).toHaveTextContent('DH-2026-0500');

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByTestId(TEST_IDS.COMMON.OFFLINE_BANNER)).toBeVisible();

    act(() => {
      realtimeClient.reconnect();
    });

    await waitFor(() => {
      expect(getDetailSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent('Đã giao');
    });

    expect(RealtimeNotificationBar).toBeDefined();
  });
});
