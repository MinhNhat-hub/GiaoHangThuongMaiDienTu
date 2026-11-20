import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError, apiClient } from '@/api/client';
import { TEST_IDS } from '@/constants/test-ids';
import { ShipperDeliveryPage } from '@/features/shipments/ShipperDeliveryPage';
import { realtimeClient } from '@/realtime/event-client';
import type { Order } from '@/types/api';
import { clearOrderMetaCache } from '@/utils/order';

const SHIPPER_USER = {
  id: 'shp_1',
  email: 'shipper@store.vn',
  fullName: 'Le Van Shipper',
  role: 'Shipper' as const,
};

function makeAssignedOrder(
  id: string,
  code: string,
  status: Order['status'],
  failedAttempts: number
): Order {
  return {
    id,
    code,
    customerId: 'cust_1',
    recipientName: 'Nguyen Thi Hoa',
    recipientPhone: '0901234567',
    deliveryAddress: '200 Hai Ba Trung',
    status,
    createdAt: '2026-06-10T01:00:00.000Z',
    items: [{ productId: 'p1', productName: 'Chuot khong day', quantity: 1 }],
    shipment: {
      id: `ship_${id}`,
      trackingNumber: `VD-${code}`,
      shipperId: 'shp_1',
      failedAttempts,
      assignedAt: '2026-06-10T02:00:00.000Z',
    },
    history: [
      {
        oldStatus: null,
        newStatus: 'PENDING_CONFIRMATION',
        changedBy: 'cust_1',
        changedByEmail: 'cust@example.com',
        changedAt: '2026-06-10T01:00:00.000Z',
      },
      {
        oldStatus: 'PENDING_CONFIRMATION',
        newStatus: status,
        changedBy: 'adm_1',
        changedByEmail: 'admin@store.vn',
        changedAt: '2026-06-10T02:00:00.000Z',
      },
    ],
  };
}

describe('shipper delivery management workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOrderMetaCache();
    apiClient.setToken('shp_token');
    apiClient.setUser(SHIPPER_USER);
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

  it('test_renders_shipper_assigned_shipments_and_action_visibility_matrix', async () => {
    const waitingOrder = makeAssignedOrder('o1', 'DH-WAIT', 'WAITING_PICKUP', 0);
    const deliveringOrder = makeAssignedOrder('o2', 'DH-DLVG', 'DELIVERING', 0);
    const failedTwoOrder = makeAssignedOrder('o3', 'DH-F2', 'FAILED_DELIVERY', 2);
    const failedThreeOrder = makeAssignedOrder('o4', 'DH-F3', 'FAILED_DELIVERY', 3);
    const deliveredOrder = makeAssignedOrder('o5', 'DH-DONE', 'DELIVERED', 0);

    vi.spyOn(apiClient, 'listAssignedShipments').mockResolvedValue([
      waitingOrder,
      deliveringOrder,
      failedTwoOrder,
      failedThreeOrder,
      deliveredOrder,
    ]);

    render(
      <MemoryRouter initialEntries={['/shipper']}>
        <ShipperDeliveryPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId(TEST_IDS.COMMON.SCREEN_TITLE)).toHaveTextContent(
      'Màn hình giao hàng của Shipper'
    );

    const cards = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    expect(cards).toHaveLength(5);

    expect(within(cards[0]).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON)).toBeVisible();
    expect(within(cards[0]).queryByTestId(TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON)).not.toBeInTheDocument();
    expect(within(cards[0]).queryByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON)).not.toBeInTheDocument();

    expect(within(cards[1]).queryByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON)).not.toBeInTheDocument();
    expect(within(cards[1]).getByTestId(TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON)).toBeVisible();
    expect(within(cards[1]).getByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON)).toBeVisible();

    expect(within(cards[2]).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON)).toBeVisible();
    expect(within(cards[2]).queryByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON)).not.toBeInTheDocument();

    expect(within(cards[3]).queryByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON)).not.toBeInTheDocument();
    expect(within(cards[3]).queryByTestId(TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON)).not.toBeInTheDocument();
    expect(within(cards[3]).queryByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON)).not.toBeInTheDocument();

    expect(within(cards[4]).queryByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON)).not.toBeInTheDocument();
    expect(within(cards[4]).queryByTestId(TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON)).not.toBeInTheDocument();
    expect(within(cards[4]).queryByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON)).not.toBeInTheDocument();
  });

  it('test_requires_confirmation_dialog_before_updating_status_or_reporting_issue', async () => {
    const user = userEvent.setup();
    const waitingOrder = makeAssignedOrder('o1', 'DH-WAIT', 'WAITING_PICKUP', 0);
    const deliveringOrder = makeAssignedOrder('o2', 'DH-DLVG', 'DELIVERING', 0);

    vi.spyOn(apiClient, 'listAssignedShipments').mockResolvedValue([waitingOrder, deliveringOrder]);
    const updateStatusSpy = vi
      .spyOn(apiClient, 'updateShipmentStatus')
      .mockResolvedValue({ ...waitingOrder, status: 'DELIVERING' });
    const reportIssueSpy = vi.spyOn(apiClient, 'reportIssue').mockResolvedValue({
      id: 'iss_1',
      orderId: 'o2',
      issueType: 'DAMAGED',
      reportedBy: 'shp_1',
      reportedAt: '2026-06-10T04:00:00.000Z',
      resolved: false,
    });

    render(
      <MemoryRouter initialEntries={['/shipper']}>
        <ShipperDeliveryPage />
      </MemoryRouter>
    );

    const cards = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);

    await user.click(within(cards[0]).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON));
    expect(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG)).toBeVisible();
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CANCEL));
    expect(updateStatusSpy).not.toHaveBeenCalled();

    await user.click(within(cards[0]).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));
    await waitFor(() => {
      expect(updateStatusSpy).toHaveBeenCalledWith('ship_o1', { action: 'START_DELIVERY' });
    });

    await user.click(within(cards[1]).getByTestId(TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));
    await waitFor(() => {
      expect(updateStatusSpy).toHaveBeenCalledWith('ship_o2', { action: 'CONFIRM_DELIVERED' });
    });

    await user.click(within(cards[1]).getByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON));
    const select = screen.getByTestId(TEST_IDS.SHIPPER.ISSUE_TYPE_SELECT) as HTMLSelectElement;
    const optionLabels = Array.from(select.options)
      .filter((opt) => opt.value !== '')
      .map((opt) => opt.textContent?.trim());
    expect(optionLabels).toEqual(['Hàng hỏng', 'Giao không thành công', 'Thất lạc']);

    await user.selectOptions(select, 'DAMAGED');
    await user.type(screen.getByTestId(TEST_IDS.SHIPPER.ISSUE_NOTES_INPUT), 'Vo man hinh');
    await user.click(screen.getByTestId(TEST_IDS.SHIPPER.SUBMIT_ISSUE_BUTTON));

    expect(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG)).toBeVisible();
    expect(reportIssueSpy).not.toHaveBeenCalled();

    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CANCEL));
    expect(reportIssueSpy).not.toHaveBeenCalled();

    await user.click(screen.getByTestId(TEST_IDS.SHIPPER.SUBMIT_ISSUE_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(reportIssueSpy).toHaveBeenCalledWith('o2', {
        issueType: 'DAMAGED',
        notes: 'Vo man hinh',
      });
    });
  });

  it('test_opens_status_history_timeline_from_shipment_card', async () => {
    const user = userEvent.setup();
    const order = makeAssignedOrder('o1', 'DH-HIS', 'WAITING_PICKUP', 0);
    vi.spyOn(apiClient, 'listAssignedShipments').mockResolvedValue([order]);

    render(
      <MemoryRouter initialEntries={['/shipper']}>
        <ShipperDeliveryPage />
      </MemoryRouter>
    );

    const cards = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    await user.click(within(cards[0]).getByTestId(TEST_IDS.SHIPPER.HISTORY_BUTTON));

    const timeline = await screen.findByTestId(TEST_IDS.ORDER.ORDER_STATUS_TIMELINE);
    expect(within(timeline).getAllByTestId(TEST_IDS.ORDER.TIMELINE_ENTRY)).toHaveLength(2);
    expect(timeline).toHaveTextContent('Chờ xác nhận');
    expect(timeline).toHaveTextContent('Chờ lấy hàng');
  });

  it('test_reloads_shipments_after_server_rejects_redelivery', async () => {
    const user = userEvent.setup();
    const staleOrder = makeAssignedOrder('o9', 'DH-RETRY', 'FAILED_DELIVERY', 2);
    const serverOrder = makeAssignedOrder('o9', 'DH-RETRY', 'FAILED_DELIVERY', 3);

    const listSpy = vi
      .spyOn(apiClient, 'listAssignedShipments')
      .mockResolvedValueOnce([staleOrder])
      .mockResolvedValue([serverOrder]);
    vi.spyOn(apiClient, 'updateShipmentStatus').mockRejectedValue(
      new ApiClientError('Đơn đã đủ số lần giao không thành công.', 'INVALID_TRANSITION', 'tr_1', 409)
    );

    render(
      <MemoryRouter initialEntries={['/shipper']}>
        <ShipperDeliveryPage />
      </MemoryRouter>
    );

    const [card] = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    await user.click(within(card).getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    const [reloadedCard] = await screen.findAllByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD);
    expect(within(reloadedCard).queryByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON)).not.toBeInTheDocument();
  });
});
