import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError, apiClient } from '@/api/client';
import { SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import { ShipmentTrackingPage } from '@/features/shipments/ShipmentTrackingPage';
import { realtimeClient } from '@/realtime/event-client';
import type { Order } from '@/types/api';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order_10',
    code: 'DH-TRACK-10',
    customerId: 'cust_1',
    recipientName: 'Tran Thi B',
    recipientPhone: '0912345678',
    deliveryAddress: '123 Le Loi, Q1',
    status: 'DELIVERING',
    createdAt: '2026-11-18T01:00:00Z',
    items: [{ productId: 'prod_01', productName: 'Chuột không dây', quantity: 1 }],
    shipment: {
      id: 'ship_10',
      trackingNumber: 'TRK-0010',
      shipperId: 'shipper_1',
      shipperName: 'Le Van Shipper',
      shipperEmail: 'shipper@example.com',
      shipperPhone: '0987654321',
      failedAttempts: 0,
      assignedAt: '2026-11-18T02:00:00Z',
    },
    history: [
      {
        oldStatus: null,
        newStatus: 'PENDING_CONFIRMATION',
        changedBy: 'cust_1',
        changedAt: '2026-11-18T01:00:00Z',
      },
      {
        oldStatus: 'PENDING_CONFIRMATION',
        newStatus: 'WAITING_PICKUP',
        changedBy: 'admin_1',
        changedAt: '2026-11-18T02:00:00Z',
      },
    ],
    ...overrides,
  };
}

function renderTrackingRoute(initialPath: string): void {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/orders/:id/tracking" element={<ShipmentTrackingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('shipment tracking screen workflows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('test_loads_tracking_details_and_updates_status_realtime_and_on_reconnect', async () => {
    const initialOrder = makeOrder();
    const refreshedOrder = makeOrder({ status: 'DELIVERED' });
    const detailSpy = vi
      .spyOn(apiClient, 'getOrderDetail')
      .mockResolvedValueOnce(initialOrder)
      .mockResolvedValueOnce(refreshedOrder);

    renderTrackingRoute('/orders/order_10/tracking');

    expect(screen.getByTestId(TEST_IDS.COMMON.SCREEN_TITLE)).toHaveTextContent(
      SCREEN_NAMES.TRACKING
    );
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.SHIPMENT.CODE)).toHaveTextContent('TRK-0010');
    });
    expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent('Đang giao');

    act(() => {
      realtimeClient.emit('order.status_changed', {
        orderId: 'order_10',
        oldStatus: 'DELIVERING',
        newStatus: 'DELIVERY_FAILED' as never,
        changedAt: '2026-11-18T04:00:00Z',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent(
        'Giao không thành công'
      );
    });
    expect(screen.getAllByTestId(TEST_IDS.ORDER.TIMELINE_ENTRY)).toHaveLength(3);

    act(() => {
      realtimeClient.emit('realtime:reconnected', { reconnectedAt: '2026-11-18T05:00:00Z' });
    });

    await waitFor(() => {
      expect(detailSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent('Đã giao');
    });
  });

  it('test_searches_shipment_by_tracking_code_and_handles_missing_shipment_error', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValueOnce(makeOrder());
    const trackSpy = vi
      .spyOn(apiClient, 'trackShipment')
      .mockResolvedValueOnce(
        makeOrder({
          id: 'order_20',
          code: 'DH-TRACK-20',
          status: 'RETURNED_TO_SELLER',
          shipment: {
            id: 'ship_20',
            trackingNumber: 'TRK-9999',
            shipperId: 'shipper_2',
            shipperName: 'Shipper Hai',
            failedAttempts: 3,
            assignedAt: '2026-11-18T03:00:00Z',
          },
        })
      )
      .mockRejectedValueOnce(new ApiClientError('Không tìm thấy mã vận đơn.', 'NOT_FOUND', 'tr_404', 404));

    renderTrackingRoute('/orders/order_10/tracking');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.SHIPMENT.CODE)).toHaveTextContent('TRK-0010');
    });

    await user.click(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_SEARCH_BUTTON));
    expect(trackSpy).not.toHaveBeenCalled();

    await user.type(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_INPUT), '  TRK-9999  ');
    await user.click(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_SEARCH_BUTTON));

    await waitFor(() => {
      expect(trackSpy).toHaveBeenCalledWith('TRK-9999');
      expect(screen.getByTestId(TEST_IDS.SHIPMENT.CODE)).toHaveTextContent('TRK-9999');
      expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent(
        'Đã hoàn về người bán'
      );
    });

    await user.clear(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_INPUT));
    await user.type(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_INPUT), 'TRK-MISSING');
    await user.click(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_SEARCH_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toHaveTextContent(
        'Không tìm thấy mã vận đơn.'
      );
    });
  });

  it('test_refreshes_searched_tracking_shipment_on_reconnect_without_reverting_to_initial_order', async () => {
    const user = userEvent.setup();
    const detailSpy = vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValueOnce(makeOrder());
    const trackSpy = vi
      .spyOn(apiClient, 'trackShipment')
      .mockResolvedValueOnce(
        makeOrder({
          id: 'order_20',
          code: 'DH-TRACK-20',
          status: 'DELIVERING',
          shipment: {
            id: 'ship_20',
            trackingNumber: 'TRK-9999',
            shipperId: 'shipper_2',
            shipperName: 'Shipper Hai',
            failedAttempts: 0,
            assignedAt: '2026-11-18T03:00:00Z',
          },
        })
      )
      .mockResolvedValueOnce(
        makeOrder({
          id: 'order_20',
          code: 'DH-TRACK-20',
          status: 'DELIVERED',
          shipment: {
            id: 'ship_20',
            trackingNumber: 'TRK-9999',
            shipperId: 'shipper_2',
            shipperName: 'Shipper Hai',
            failedAttempts: 0,
            assignedAt: '2026-11-18T03:00:00Z',
          },
        })
      );

    renderTrackingRoute('/orders/order_10/tracking');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.SHIPMENT.CODE)).toHaveTextContent('TRK-0010');
    });

    await user.type(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_INPUT), 'TRK-9999');
    await user.click(screen.getByTestId(TEST_IDS.SHIPMENT.TRACKING_SEARCH_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.SHIPMENT.CODE)).toHaveTextContent('TRK-9999');
    });

    act(() => {
      realtimeClient.emit('realtime:reconnected', { reconnectedAt: '2026-11-18T06:00:00Z' });
    });

    await waitFor(() => {
      expect(trackSpy).toHaveBeenCalledTimes(2);
      expect(detailSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId(TEST_IDS.SHIPMENT.CODE)).toHaveTextContent('TRK-9999');
      expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent('Đã giao');
    });
  });
});
