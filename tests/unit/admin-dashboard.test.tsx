import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { TEST_IDS } from '@/constants/test-ids';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { realtimeClient } from '@/realtime/event-client';
import type { DeliveryIssue, Order, ReturnRequest } from '@/types/api';
import { clearOrderMetaCache } from '@/utils/order';

const ADMIN_USER = {
  id: 'adm_1',
  email: 'admin@store.vn',
  fullName: 'Store Admin',
  role: 'Admin' as const,
};

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord_1',
    code: 'DH-1001',
    customerId: 'cust_1',
    customerName: 'Customer One',
    customerEmail: 'cust1@example.com',
    recipientName: 'Nguyen Van C',
    recipientPhone: '0901112233',
    deliveryAddress: '10 Nguyen Trai',
    status: 'PENDING_CONFIRMATION',
    createdAt: '2026-06-10T02:00:00.000Z',
    items: [{ productId: 'p1', productName: 'Tai nghe', quantity: 1 }],
    ...overrides,
  };
}

describe('admin dashboard workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOrderMetaCache();
    apiClient.setToken('adm_token');
    apiClient.setUser(ADMIN_USER);
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

  it('test_lists_only_pending_orders_in_assignment_tab_and_assigns_selected_shipper', async () => {
    const user = userEvent.setup();
    const pendingOrder = makeOrder({ id: 'ord_p', code: 'DH-PENDING', status: 'PENDING_CONFIRMATION' });
    const deliveredOrder = makeOrder({ id: 'ord_d', code: 'DH-DELIV', status: 'DELIVERED' });

    vi.spyOn(apiClient, 'listOrders')
      .mockResolvedValueOnce([pendingOrder, deliveredOrder])
      .mockResolvedValueOnce([
        { ...pendingOrder, status: 'WAITING_PICKUP' },
        deliveredOrder,
      ]);
    vi.spyOn(apiClient, 'listShippers').mockResolvedValue([
      { id: 'shp_1', fullName: 'Shipper Alpha', email: 'shipper1@store.vn' },
    ]);
    const createShipmentSpy = vi.spyOn(apiClient, 'createShipment').mockResolvedValue({
      id: 'ship_1',
      trackingNumber: 'VD-1001',
      shipperId: 'shp_1',
      failedAttempts: 0,
      assignedAt: '2026-06-10T03:00:00.000Z',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId(TEST_IDS.COMMON.SCREEN_TITLE)).toHaveTextContent(
      'Bảng điều khiển Admin'
    );
    expect(screen.queryByText(/Đặt lại dữ liệu mẫu/i)).not.toBeInTheDocument();

    const table = await screen.findByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE);
    await waitFor(() => {
      expect(within(table).getAllByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM)).toHaveLength(1);
    });
    expect(table).toHaveTextContent('DH-PENDING');
    expect(table).not.toHaveTextContent('DH-DELIV');

    await user.click(within(table).getByTestId(TEST_IDS.ADMIN.ASSIGN_BUTTON));
    const dialog = await screen.findByTestId(TEST_IDS.ADMIN.ASSIGN_SHIPPER_DIALOG);
    expect((within(dialog).getByTestId(TEST_IDS.ADMIN.SHIPPER_SELECT) as HTMLSelectElement).value).toBe('');

    await user.click(within(dialog).getByTestId(TEST_IDS.ADMIN.CONFIRM_ASSIGN_BUTTON));
    expect(createShipmentSpy).not.toHaveBeenCalled();

    await user.selectOptions(within(dialog).getByTestId(TEST_IDS.ADMIN.SHIPPER_SELECT), 'shp_1');
    await user.click(within(dialog).getByTestId(TEST_IDS.ADMIN.CONFIRM_ASSIGN_BUTTON));

    await waitFor(() => {
      expect(createShipmentSpy).toHaveBeenCalledWith({
        orderId: 'ord_p',
        shipperId: 'shp_1',
      });
      expect(screen.queryByTestId(TEST_IDS.ADMIN.ASSIGN_SHIPPER_DIALOG)).not.toBeInTheDocument();
      expect(within(table).getByTestId(TEST_IDS.COMMON.EMPTY_STATE)).toBeVisible();
    });
  });

  it('test_displays_all_orders_in_tracking_tab_and_updates_realtime_status', async () => {
    const user = userEvent.setup();
    const orderA = makeOrder({ id: 'ord_a', code: 'DH-TRACK-A', status: 'WAITING_PICKUP' });
    const orderB = makeOrder({ id: 'ord_b', code: 'DH-TRACK-B', status: 'LOST' });
    vi.spyOn(apiClient, 'listOrders').mockResolvedValue([orderA, orderB]);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId(TEST_IDS.ADMIN.TRACKING_TAB));
    const trackingTable = await screen.findByTestId(TEST_IDS.ADMIN.TRACKING_TABLE);

    await waitFor(() => {
      expect(within(trackingTable).getAllByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM)).toHaveLength(2);
    });
    expect(trackingTable).toHaveTextContent('Chờ lấy hàng');
    expect(trackingTable).toHaveTextContent('Thất lạc');

    act(() => {
      realtimeClient.emit('order.status_changed', {
        orderId: 'ord_a',
        orderCode: 'DH-TRACK-A',
        oldStatus: 'WAITING_PICKUP',
        newStatus: 'DELIVERING',
        changedAt: '2026-06-10T04:00:00.000Z',
      });
    });

    await waitFor(() => {
      expect(trackingTable).toHaveTextContent('Đang giao');
    });
  });

  it('test_enforces_issue_resolution_rules_blocks_early_return_and_three_attempt_unresolved_rule', async () => {
    const user = userEvent.setup();
    const orderTwoFails = makeOrder({
      id: 'ord_f2',
      code: 'DH-FAIL2',
      status: 'FAILED_DELIVERY',
      shipment: {
        id: 's_f2',
        trackingNumber: 'VD-F2',
        shipperId: 'shp_1',
        failedAttempts: 2,
        assignedAt: '2026-06-10T01:00:00.000Z',
      },
    });
    const orderThreeFails = makeOrder({
      id: 'ord_f3',
      code: 'DH-FAIL3',
      status: 'FAILED_DELIVERY',
      shipment: {
        id: 's_f3',
        trackingNumber: 'VD-F3',
        shipperId: 'shp_1',
        failedAttempts: 3,
        assignedAt: '2026-06-10T01:00:00.000Z',
      },
    });
    const orderDamaged = makeOrder({ id: 'ord_dmg', code: 'DH-DMG', status: 'DAMAGED' });

    const issueTwoFails: DeliveryIssue = {
      id: 'iss_f2',
      code: 'SC-01',
      orderId: 'ord_f2',
      orderCode: 'DH-FAIL2',
      issueType: 'FAILED_DELIVERY',
      reportedBy: 'shp_1',
      reportedByEmail: 'shipper1@store.vn',
      reportedAt: '2026-06-10T05:00:00.000Z',
      resolved: false,
    };
    const issueThreeFails: DeliveryIssue = {
      id: 'iss_f3',
      code: 'SC-02',
      orderId: 'ord_f3',
      orderCode: 'DH-FAIL3',
      issueType: 'FAILED_DELIVERY',
      reportedBy: 'shp_1',
      reportedByEmail: 'shipper1@store.vn',
      reportedAt: '2026-06-10T06:00:00.000Z',
      resolved: false,
    };
    const issueDamaged: DeliveryIssue = {
      id: 'iss_dmg',
      code: 'SC-03',
      orderId: 'ord_dmg',
      orderCode: 'DH-DMG',
      issueType: 'DAMAGED',
      reportedBy: 'shp_1',
      reportedByEmail: 'shipper1@store.vn',
      reportedAt: '2026-06-10T07:00:00.000Z',
      resolved: false,
    };

    vi.spyOn(apiClient, 'listOrders').mockResolvedValue([
      orderTwoFails,
      orderThreeFails,
      orderDamaged,
    ]);
    vi.spyOn(apiClient, 'listIssues')
      .mockResolvedValueOnce([issueTwoFails, issueThreeFails, issueDamaged])
      .mockResolvedValueOnce([issueTwoFails, issueThreeFails]);
    const returnSpy = vi.spyOn(apiClient, 'processReturnShipment').mockResolvedValue(orderThreeFails);
    const resolveSpy = vi.spyOn(apiClient, 'resolveIssue').mockResolvedValue({
      ...issueDamaged,
      resolved: true,
      resolutionResult: 'Da doi san pham moi',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId(TEST_IDS.ADMIN.ISSUES_TAB));
    const list = await screen.findByTestId(TEST_IDS.ADMIN.ISSUES_LIST);
    const items = await within(list).findAllByTestId(TEST_IDS.ADMIN.ISSUE_ITEM);
    expect(items).toHaveLength(3);

    await user.click(within(items[0]).getByTestId(TEST_IDS.ADMIN.ISSUE_RETURN_BUTTON));
    expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    expect(returnSpy).not.toHaveBeenCalled();

    await user.type(within(items[1]).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_INPUT), 'Khach huy');
    await user.click(within(items[1]).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_SAVE_BUTTON));
    expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    expect(resolveSpy).not.toHaveBeenCalled();

    await user.click(within(items[2]).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_SAVE_BUTTON));
    expect(within(items[2]).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_ERROR)).toBeVisible();

    await user.type(
      within(items[2]).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_INPUT),
      'Da doi san pham moi'
    );
    await user.click(within(items[2]).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_SAVE_BUTTON));

    await waitFor(() => {
      expect(resolveSpy).toHaveBeenCalledWith('iss_dmg', {
        resolutionNotes: 'Da doi san pham moi',
        resolutionResult: 'Da doi san pham moi',
      });
      expect(within(items[2]).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_TEXT)).toHaveTextContent(
        'Da doi san pham moi'
      );
    });

    await user.click(screen.getByTestId(TEST_IDS.ADMIN.ISSUES_TAB));
    await waitFor(() => {
      expect(within(list).getAllByTestId(TEST_IDS.ADMIN.ISSUE_ITEM)).toHaveLength(2);
    });
  });

  it('test_approves_rejects_with_reason_and_completes_active_return_requests', async () => {
    const user = userEvent.setup();
    const pendingA: ReturnRequest = {
      id: 'ret_1',
      code: 'TH-1',
      orderId: 'o1',
      orderCode: 'DH-RET-1',
      customerId: 'c1',
      reason: 'DAMAGED_OR_DEFECTIVE',
      status: 'PENDING_APPROVAL',
      createdAt: '2026-06-10T01:00:00.000Z',
    };
    const pendingB: ReturnRequest = {
      id: 'ret_2',
      code: 'TH-2',
      orderId: 'o2',
      orderCode: 'DH-RET-2',
      customerId: 'c2',
      reason: 'OTHER',
      notes: 'Sai kich thuoc',
      status: 'PENDING_APPROVAL',
      createdAt: '2026-06-10T02:00:00.000Z',
    };
    const completedHidden: ReturnRequest = {
      id: 'ret_3',
      code: 'TH-3',
      orderId: 'o3',
      orderCode: 'DH-RET-3',
      customerId: 'c3',
      reason: 'OTHER',
      status: 'COMPLETED',
      createdAt: '2026-06-09T01:00:00.000Z',
    };

    vi.spyOn(apiClient, 'listOrders').mockResolvedValue([]);
    vi.spyOn(apiClient, 'listReturns').mockResolvedValue([pendingA, pendingB, completedHidden]);
    const reviewSpy = vi
      .spyOn(apiClient, 'reviewReturn')
      .mockResolvedValueOnce({ ...pendingA, status: 'ACCEPTED' })
      .mockResolvedValueOnce({ ...pendingB, status: 'REJECTED', rejectionReason: 'Qua 15 ngay' });
    const completeSpy = vi
      .spyOn(apiClient, 'completeReturn')
      .mockResolvedValue({ ...pendingA, status: 'COMPLETED' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId(TEST_IDS.ADMIN.RETURNS_TAB));
    const returnsList = await screen.findByTestId(TEST_IDS.ADMIN.RETURNS_LIST);
    const rows = await within(returnsList).findAllByTestId(TEST_IDS.ADMIN.RETURN_ITEM);
    expect(rows).toHaveLength(2);
    expect(returnsList).not.toHaveTextContent('DH-RET-3');

    await user.click(within(rows[0]).getByTestId(TEST_IDS.ADMIN.APPROVE_RETURN_BUTTON));
    await waitFor(() => {
      expect(within(rows[0]).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent(
        'Đã chấp nhận'
      );
      expect(within(rows[0]).getByTestId(TEST_IDS.ADMIN.RETURN_COMPLETE_FORM)).toBeVisible();
    });
    expect(reviewSpy).toHaveBeenCalledWith('ret_1', { action: 'APPROVE' });

    await user.click(within(rows[1]).getByTestId(TEST_IDS.ADMIN.REJECT_RETURN_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.ADMIN.REJECT_CONFIRM_BUTTON));
    expect(screen.getByTestId(TEST_IDS.ADMIN.REJECT_REASON_ERROR)).toBeVisible();

    await user.type(screen.getByTestId(TEST_IDS.ADMIN.REJECT_REASON_INPUT), 'Qua 15 ngay');
    await user.click(screen.getByTestId(TEST_IDS.ADMIN.REJECT_CONFIRM_BUTTON));
    await waitFor(() => {
      expect(reviewSpy).toHaveBeenCalledWith('ret_2', {
        action: 'REJECT',
        rejectionReason: 'Qua 15 ngay',
      });
      expect(within(returnsList).getAllByTestId(TEST_IDS.ADMIN.RETURN_ITEM)).toHaveLength(1);
    });

    await user.click(screen.getByTestId(TEST_IDS.ADMIN.RETURN_COMPLETE_BUTTON));
    await waitFor(() => {
      expect(completeSpy).toHaveBeenCalledWith('ret_1');
      expect(within(returnsList).getByTestId(TEST_IDS.COMMON.EMPTY_STATE)).toBeVisible();
    });
  });

  it('test_loads_order_detail_before_returning_when_issue_order_is_not_in_list', async () => {
    const user = userEvent.setup();
    const unlistedOrder = makeOrder({
      id: 'ord_off',
      code: 'DH-OFF',
      status: 'FAILED_DELIVERY',
      shipment: {
        id: 's_off',
        trackingNumber: 'VD-OFF',
        shipperId: 'shp_1',
        failedAttempts: 3,
        assignedAt: '2026-06-10T01:00:00.000Z',
      },
    });
    const issue: DeliveryIssue = {
      id: 'iss_off',
      code: 'SC-09',
      orderId: 'ord_off',
      orderCode: 'DH-OFF',
      issueType: 'FAILED_DELIVERY',
      reportedBy: 'shp_1',
      reportedByEmail: 'shipper1@store.vn',
      reportedAt: '2026-06-10T05:00:00.000Z',
      resolved: false,
    };

    vi.spyOn(apiClient, 'listOrders').mockResolvedValue([]);
    vi.spyOn(apiClient, 'listIssues').mockResolvedValue([issue]);
    const detailSpy = vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(unlistedOrder);
    const returnSpy = vi
      .spyOn(apiClient, 'processReturnShipment')
      .mockResolvedValue({ ...unlistedOrder, status: 'RETURNING' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId(TEST_IDS.ADMIN.ISSUES_TAB));
    const list = await screen.findByTestId(TEST_IDS.ADMIN.ISSUES_LIST);
    const [item] = await within(list).findAllByTestId(TEST_IDS.ADMIN.ISSUE_ITEM);
    await user.click(within(item).getByTestId(TEST_IDS.ADMIN.ISSUE_RETURN_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM));

    await waitFor(() => {
      expect(returnSpy).toHaveBeenCalledWith('s_off');
    });
    expect(detailSpy).toHaveBeenCalledWith('ord_off');
  });

  it('test_cancelling_return_confirmation_keeps_order_unchanged', async () => {
    const user = userEvent.setup();
    const order = makeOrder({
      id: 'ord_f3',
      code: 'DH-FAIL3',
      status: 'FAILED_DELIVERY',
      shipment: {
        id: 's_f3',
        trackingNumber: 'VD-F3',
        shipperId: 'shp_1',
        failedAttempts: 3,
        assignedAt: '2026-06-10T01:00:00.000Z',
      },
    });
    const issue: DeliveryIssue = {
      id: 'iss_f3',
      code: 'SC-02',
      orderId: 'ord_f3',
      orderCode: 'DH-FAIL3',
      issueType: 'FAILED_DELIVERY',
      reportedBy: 'shp_1',
      reportedByEmail: 'shipper1@store.vn',
      reportedAt: '2026-06-10T06:00:00.000Z',
      resolved: false,
    };

    vi.spyOn(apiClient, 'listOrders').mockResolvedValue([order]);
    vi.spyOn(apiClient, 'listIssues').mockResolvedValue([issue]);
    const returnSpy = vi.spyOn(apiClient, 'processReturnShipment');

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId(TEST_IDS.ADMIN.ISSUES_TAB));
    const list = await screen.findByTestId(TEST_IDS.ADMIN.ISSUES_LIST);
    const [item] = await within(list).findAllByTestId(TEST_IDS.ADMIN.ISSUE_ITEM);
    await user.click(within(item).getByTestId(TEST_IDS.ADMIN.ISSUE_RETURN_BUTTON));
    expect(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG)).toBeVisible();
    await user.click(screen.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CANCEL));

    expect(screen.queryByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG)).not.toBeInTheDocument();
    expect(returnSpy).not.toHaveBeenCalled();
  });
});
