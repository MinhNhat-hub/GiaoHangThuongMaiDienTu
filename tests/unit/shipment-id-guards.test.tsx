import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { TEST_IDS } from '@/constants/test-ids';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
import { ShipperDeliveryPage } from '@/features/shipments/ShipperDeliveryPage';
import type { DeliveryIssue, Order } from '@/types/api';
import { clearOrderMetaCache } from '@/utils/order';

function makeOrderWithoutShipment(id: string, code: string, status: Order['status']): Order {
  return {
    id,
    code,
    customerId: 'cust_1',
    recipientName: 'Tran Thi Bich',
    recipientPhone: '0912345678',
    deliveryAddress: '123 Le Loi, Quan 1, TP.HCM',
    status,
    createdAt: '2026-06-10T02:30:00.000Z',
    items: [{ id: 'line_1', productId: 'prod_1', productName: 'Tai nghe Bluetooth', quantity: 1 }],
  };
}

describe('shipment identifier guards on order detail and shipper delivery', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOrderMetaCache();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
    clearOrderMetaCache();
  });

  it('test_order_detail_refuses_to_send_order_id_when_shipment_id_is_missing', async () => {
    const user = userEvent.setup();
    const orderNoShipment = makeOrderWithoutShipment('ord_no_ship', 'DH-NOSHIP-1', 'RETURNING');

    apiClient.setToken('adm_token');
    apiClient.setUser({
      id: 'adm_1',
      email: 'admin@store.vn',
      fullName: 'Store Admin',
      role: 'Admin',
    });

    const detailSpy = vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(orderNoShipment);
    const confirmSpy = vi.spyOn(apiClient, 'confirmReturnReceived');

    render(
      <MemoryRouter initialEntries={['/orders/DH-NOSHIP-1']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    await user.click(screen.getByTestId(TEST_IDS.ADMIN.CONFIRM_RETURNED_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    });
    expect(detailSpy).toHaveBeenCalledWith('ord_no_ship');
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('test_order_detail_fetches_shipment_id_before_confirming_return_received', async () => {
    const user = userEvent.setup();
    const initialOrder = makeOrderWithoutShipment('ord_refetch', 'DH-REFETCH-1', 'RETURNING');
    const hydratedOrder: Order = {
      ...initialOrder,
      shipment: {
        id: 'ship_hydrated_1',
        trackingNumber: 'VD-REFETCH-1',
        shipperId: 'shp_1',
        failedAttempts: 3,
        assignedAt: '2026-06-10T03:00:00.000Z',
      },
    };

    apiClient.setToken('adm_token');
    apiClient.setUser({
      id: 'adm_1',
      email: 'admin@store.vn',
      fullName: 'Store Admin',
      role: 'Admin',
    });

    vi.spyOn(apiClient, 'getOrderDetail')
      .mockResolvedValueOnce(initialOrder)
      .mockResolvedValue(hydratedOrder);
    const confirmSpy = vi
      .spyOn(apiClient, 'confirmReturnReceived')
      .mockResolvedValue({ ...hydratedOrder, status: 'RETURNED_TO_SELLER' });

    render(
      <MemoryRouter initialEntries={['/orders/DH-REFETCH-1']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    await user.click(screen.getByTestId(TEST_IDS.ADMIN.CONFIRM_RETURNED_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('ship_hydrated_1');
    });
  });

  it('test_shipper_delivery_refuses_to_send_order_id_when_shipment_id_is_missing', async () => {
    const user = userEvent.setup();
    const orderNoShipment = makeOrderWithoutShipment('ord_shp_missing', 'DH-SHP-1', 'WAITING_PICKUP');

    apiClient.setToken('shp_token');
    apiClient.setUser({
      id: 'shp_1',
      email: 'shipper@store.vn',
      fullName: 'Le Van Shipper',
      role: 'Shipper',
    });

    vi.spyOn(apiClient, 'listAssignedShipments').mockResolvedValue([orderNoShipment]);
    const detailSpy = vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(orderNoShipment);
    const updateSpy = vi.spyOn(apiClient, 'updateShipmentStatus');

    render(
      <MemoryRouter initialEntries={['/shipper']}>
        <ShipperDeliveryPage />
      </MemoryRouter>
    );

    const [card] = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    await user.click(within(card).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    });
    expect(detailSpy).toHaveBeenCalledWith('ord_shp_missing');
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('test_shipper_delivery_fetches_shipment_id_before_updating_status', async () => {
    const user = userEvent.setup();
    const initialOrder = makeOrderWithoutShipment('ord_shp_refetch', 'DH-SHP-2', 'WAITING_PICKUP');
    const hydratedOrder: Order = {
      ...initialOrder,
      shipment: {
        id: 'ship_hydrated_2',
        trackingNumber: 'VD-SHP-2',
        shipperId: 'shp_1',
        failedAttempts: 0,
        assignedAt: '2026-06-10T03:00:00.000Z',
      },
    };

    apiClient.setToken('shp_token');
    apiClient.setUser({
      id: 'shp_1',
      email: 'shipper@store.vn',
      fullName: 'Le Van Shipper',
      role: 'Shipper',
    });

    vi.spyOn(apiClient, 'listAssignedShipments').mockResolvedValue([initialOrder]);
    vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(hydratedOrder);
    const updateSpy = vi
      .spyOn(apiClient, 'updateShipmentStatus')
      .mockResolvedValue({ ...hydratedOrder, status: 'DELIVERING' });

    render(
      <MemoryRouter initialEntries={['/shipper']}>
        <ShipperDeliveryPage />
      </MemoryRouter>
    );

    const [card] = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    await user.click(within(card).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('ship_hydrated_2', { action: 'START_DELIVERY' });
    });
  });

  it('test_order_detail_rejects_whitespace_only_shipment_id_after_refetch', async () => {
    const user = userEvent.setup();
    const orderBlankShipment: Order = {
      ...makeOrderWithoutShipment('ord_blank_ship', 'DH-BLANK-1', 'RETURNING'),
      shipment: {
        id: '   ',
        trackingNumber: 'VD-BLANK-1',
        shipperId: 'shp_1',
        failedAttempts: 3,
        assignedAt: '2026-06-10T03:00:00.000Z',
      },
    };

    apiClient.setToken('adm_token');
    apiClient.setUser({
      id: 'adm_1',
      email: 'admin@store.vn',
      fullName: 'Store Admin',
      role: 'Admin',
    });

    const detailSpy = vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(orderBlankShipment);
    const confirmSpy = vi.spyOn(apiClient, 'confirmReturnReceived');

    render(
      <MemoryRouter initialEntries={['/orders/DH-BLANK-1']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    await user.click(screen.getByTestId(TEST_IDS.ADMIN.CONFIRM_RETURNED_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    });
    expect(detailSpy).toHaveBeenCalledWith('ord_blank_ship');
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('test_shipper_delivery_refetches_empty_shipment_id_trims_valid_id_and_rejects_whitespace', async () => {
    const user = userEvent.setup();
    const emptyIdOrder: Order = {
      ...makeOrderWithoutShipment('ord_empty_ship', 'DH-EMPTY-1', 'WAITING_PICKUP'),
      shipment: {
        id: '',
        trackingNumber: 'VD-EMPTY-1',
        shipperId: 'shp_1',
        failedAttempts: 0,
        assignedAt: '2026-06-10T03:00:00.000Z',
      },
    };
    const whitespaceOrder: Order = {
      ...makeOrderWithoutShipment('ord_ws_ship', 'DH-WS-1', 'WAITING_PICKUP'),
      shipment: {
        id: '   ',
        trackingNumber: 'VD-WS-1',
        shipperId: 'shp_1',
        failedAttempts: 0,
        assignedAt: '2026-06-10T03:00:00.000Z',
      },
    };
    const hydratedEmptyOrder: Order = {
      ...emptyIdOrder,
      shipment: {
        ...emptyIdOrder.shipment!,
        id: '  ship_trimmed_9  ',
      },
    };

    apiClient.setToken('shp_token');
    apiClient.setUser({
      id: 'shp_1',
      email: 'shipper@store.vn',
      fullName: 'Le Van Shipper',
      role: 'Shipper',
    });

    vi.spyOn(apiClient, 'listAssignedShipments').mockResolvedValue([emptyIdOrder, whitespaceOrder]);
    vi.spyOn(apiClient, 'getOrderDetail').mockImplementation(async (orderId) =>
      orderId === 'ord_empty_ship' ? hydratedEmptyOrder : whitespaceOrder
    );
    const updateSpy = vi
      .spyOn(apiClient, 'updateShipmentStatus')
      .mockResolvedValue({ ...hydratedEmptyOrder, status: 'DELIVERING' });

    render(
      <MemoryRouter initialEntries={['/shipper']}>
        <ShipperDeliveryPage />
      </MemoryRouter>
    );

    const cards = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    await user.click(within(cards[0]).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('ship_trimmed_9', { action: 'START_DELIVERY' });
    });

    const refreshedCards = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    await user.click(within(refreshedCards[1]).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    });
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('test_admin_dashboard_refetches_blank_shipment_id_before_moving_issue_to_returning', async () => {
    const user = userEvent.setup();
    const cachedOrderBlankShipment: Order = {
      ...makeOrderWithoutShipment('ord_adm_1', 'DH-ADM-1', 'FAILED_DELIVERY'),
      shipment: {
        id: '   ',
        trackingNumber: 'VD-ADM-1',
        shipperId: 'shp_1',
        failedAttempts: 3,
        assignedAt: '2026-06-10T03:00:00.000Z',
      },
    };
    const hydratedOrder: Order = {
      ...cachedOrderBlankShipment,
      shipment: {
        ...cachedOrderBlankShipment.shipment!,
        id: '  ship_adm_99  ',
      },
    };
    const issue: DeliveryIssue = {
      id: 'iss_adm_1',
      code: 'SC-ADM-1',
      orderId: 'ord_adm_1',
      orderCode: 'DH-ADM-1',
      issueType: 'FAILED_DELIVERY',
      reportedBy: 'shp_1',
      reportedAt: '2026-06-10T04:00:00.000Z',
      resolved: false,
    };

    apiClient.setToken('adm_token');
    apiClient.setUser({
      id: 'adm_1',
      email: 'admin@store.vn',
      fullName: 'Store Admin',
      role: 'Admin',
    });

    vi.spyOn(apiClient, 'listOrders').mockResolvedValue([cachedOrderBlankShipment]);
    vi.spyOn(apiClient, 'listIssues').mockResolvedValue([issue]);
    const detailSpy = vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(hydratedOrder);
    const returnSpy = vi.spyOn(apiClient, 'processReturnShipment').mockResolvedValue({
      ...hydratedOrder,
      status: 'RETURNING',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await user.click(await screen.findByTestId(TEST_IDS.ADMIN.ISSUES_TAB));
    await user.click(await screen.findByTestId(TEST_IDS.ADMIN.ISSUE_RETURN_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(detailSpy).toHaveBeenCalledWith('ord_adm_1');
      expect(returnSpy).toHaveBeenCalledWith('ship_adm_99');
    });
  });
});
