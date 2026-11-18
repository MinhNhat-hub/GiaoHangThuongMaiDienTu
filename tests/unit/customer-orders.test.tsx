import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { TEST_IDS } from '@/constants/test-ids';
import { CreateOrderPage } from '@/features/orders/CreateOrderPage';
import { CustomerHomePage } from '@/features/orders/CustomerHomePage';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
import type { Order, Product } from '@/types/api';
import { clearOrderMetaCache } from '@/utils/order';

const SAMPLE_CUSTOMER = {
  id: 'cust_1',
  email: 'customer@example.com',
  fullName: 'Nguyen Van An',
  phoneNumber: '0901234567',
  role: 'Customer' as const,
};

const SAMPLE_PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Tai nghe Bluetooth', sku: 'SKU-001' },
  { id: 'prod_2', name: 'Bàn phím cơ', sku: 'SKU-002' },
];

const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord_1',
    code: 'DH-2026-0001',
    customerId: 'cust_1',
    customerName: 'Nguyen Van An',
    customerEmail: 'customer@example.com',
    recipientName: 'Tran Thi Bich',
    recipientPhone: '0912345678',
    deliveryAddress: '123 Le Loi, Quan 1, TP.HCM',
    status: 'DELIVERING',
    createdAt: '2026-06-10T02:30:00.000Z',
    items: [
      { id: 'line_1', productId: 'prod_1', productName: 'Tai nghe Bluetooth', quantity: 2 },
    ],
    shipment: {
      id: 'ship_1',
      trackingNumber: 'VD-2026-0001',
      shipperId: 'shipper_1',
      shipperName: 'Le Van Shipper',
      shipperEmail: 'shipper@example.com',
      failedAttempts: 0,
      assignedAt: '2026-06-10T03:00:00.000Z',
    },
    history: [
      {
        id: 'h_2',
        oldStatus: 'PENDING_CONFIRMATION',
        newStatus: 'WAITING_PICKUP',
        changedBy: 'admin_1',
        changedByEmail: 'admin@store.vn',
        changedAt: '2026-06-10T03:00:00.000Z',
      },
      {
        id: 'h_1',
        oldStatus: null,
        newStatus: 'PENDING_CONFIRMATION',
        changedBy: 'cust_1',
        changedByEmail: 'customer@example.com',
        changedAt: '2026-06-10T02:30:00.000Z',
      },
      {
        id: 'h_3',
        oldStatus: 'WAITING_PICKUP',
        newStatus: 'DELIVERING',
        changedBy: 'shipper_1',
        changedByEmail: 'shipper@example.com',
        changedAt: '2026-06-10T04:15:00.000Z',
      },
    ],
  },
];

describe('customer order list, creation, and details workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    clearOrderMetaCache();
    apiClient.setToken('cust_token');
    apiClient.setUser(SAMPLE_CUSTOMER);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    clearOrderMetaCache();
  });

  it('test_renders_customer_home_with_orders_and_without_search_or_money_fields', async () => {
    vi.spyOn(apiClient, 'listOrders').mockResolvedValue(SAMPLE_ORDERS);

    render(
      <MemoryRouter initialEntries={['/orders']}>
        <CustomerHomePage />
      </MemoryRouter>
    );

    expect(screen.getByTestId(TEST_IDS.COMMON.SCREEN_TITLE)).toHaveTextContent(
      'Trang chủ Customer'
    );
    expect(screen.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveAttribute('href', '/orders/new');

    const items = await screen.findAllByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('DH-2026-0001');
    expect(items[0]).toHaveTextContent('Đang giao');
    expect(items[0]).toHaveTextContent('10/06/2026 09:30');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('test_validates_duplicate_products_invalid_quantities_and_recipient_limits_on_create', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'getProducts').mockResolvedValue(SAMPLE_PRODUCTS);

    render(
      <MemoryRouter initialEntries={['/orders/new']}>
        <CreateOrderPage />
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.STEP_PRODUCT);

    await user.click(screen.getByTestId(TEST_IDS.ORDER.ADD_LINE_BUTTON));
    const selects = screen.getAllByTestId(TEST_IDS.ORDER.PRODUCT_SELECT);
    await user.selectOptions(selects[0], 'prod_1');
    await user.selectOptions(selects[1], 'prod_1');
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));
    expect(screen.getByTestId(TEST_IDS.ORDER.PRODUCT_ERROR)).toBeVisible();

    await user.selectOptions(selects[1], 'prod_2');
    const qtyInputs = screen.getAllByTestId(TEST_IDS.ORDER.QUANTITY_INPUT);
    await user.clear(qtyInputs[0]);
    await user.type(qtyInputs[0], '1.5');
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));
    expect(screen.getByTestId(TEST_IDS.ORDER.QUANTITY_ERROR)).toBeVisible();

    await user.clear(qtyInputs[0]);
    await user.type(qtyInputs[0], '2');
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));

    await screen.findByTestId(TEST_IDS.ORDER.STEP_RECIPIENT);
    await user.type(screen.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_INPUT), 'A'.repeat(101));
    await user.type(screen.getByTestId(TEST_IDS.ORDER.RECIPIENT_PHONE_INPUT), '12345');
    await user.type(screen.getByTestId(TEST_IDS.ORDER.DELIVERY_ADDRESS_INPUT), '   ');
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));

    expect(screen.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.ORDER.DELIVERY_ADDRESS_ERROR)).toBeVisible();
  });

  it('test_preserves_draft_on_edit_cancels_immediately_or_submits_trimmed_order', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'getProducts').mockResolvedValue(SAMPLE_PRODUCTS);
    const createOrderSpy = vi.spyOn(apiClient, 'createOrder').mockResolvedValue({
      ...SAMPLE_ORDERS[0],
      id: 'ord_new',
      code: 'DH-2026-0099',
      status: 'PENDING_CONFIRMATION',
    });

    const firstRender = render(
      <MemoryRouter initialEntries={['/orders/new']}>
        <Routes>
          <Route path="/orders/new" element={<CreateOrderPage />} />
          <Route path="/orders" element={<div data-testid="orders-landed">Orders</div>} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.STEP_PRODUCT);
    await user.click(screen.getByTestId(TEST_IDS.ORDER.CANCEL_ORDER_CREATION_BUTTON));
    expect(screen.getByTestId('orders-landed')).toBeInTheDocument();
    expect(createOrderSpy).not.toHaveBeenCalled();
    firstRender.unmount();

    render(
      <MemoryRouter initialEntries={['/orders/new']}>
        <CreateOrderPage />
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.STEP_PRODUCT);
    await user.selectOptions(screen.getByTestId(TEST_IDS.ORDER.PRODUCT_SELECT), 'prod_1');
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));

    await user.type(screen.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_INPUT), '  Tran Minh  ');
    await user.type(screen.getByTestId(TEST_IDS.ORDER.RECIPIENT_PHONE_INPUT), ' 0987654321 ');
    await user.type(screen.getByTestId(TEST_IDS.ORDER.DELIVERY_ADDRESS_INPUT), ' 45 Nguyen Hue ');
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));

    await screen.findByTestId(TEST_IDS.ORDER.STEP_CONFIRM);
    await user.click(screen.getByTestId(TEST_IDS.ORDER.EDIT_BUTTON));

    const productStep = await screen.findByTestId(TEST_IDS.ORDER.STEP_PRODUCT);
    expect(productStep).toBeVisible();
    await user.clear(screen.getByTestId(TEST_IDS.ORDER.QUANTITY_INPUT));
    await user.type(screen.getByTestId(TEST_IDS.ORDER.QUANTITY_INPUT), '3');
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));
    await user.click(screen.getByTestId(TEST_IDS.ORDER.NEXT_STEP_BUTTON));

    await screen.findByTestId(TEST_IDS.ORDER.STEP_CONFIRM);
    await user.click(screen.getByTestId(TEST_IDS.ORDER.SUBMIT_ORDER_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.ORDER.SUCCESS_CODE)).toHaveTextContent('DH-2026-0099');
    });

    expect(createOrderSpy).toHaveBeenCalledWith({
      recipientName: 'Tran Minh',
      recipientPhone: '0987654321',
      deliveryAddress: '45 Nguyen Hue',
      items: [{ productId: 'prod_1', quantity: 3 }],
    });
  });

  it('test_renders_chronological_timeline_shipment_tab_and_role_specific_actions', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'getOrderDetail').mockResolvedValue(SAMPLE_ORDERS[0]);
    const reportSpy = vi.spyOn(apiClient, 'reportIssue').mockResolvedValue({
      id: 'iss_1',
      orderId: 'ord_1',
      issueType: 'LOST',
      reportedBy: 'adm_1',
      reportedAt: '2026-06-10T05:00:00.000Z',
      resolved: false,
    });

    const customerView = render(
      <MemoryRouter initialEntries={['/orders/DH-2026-0001']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    expect(screen.getByTestId(TEST_IDS.ORDER.DETAILS_CODE)).toHaveTextContent('DH-2026-0001');
    expect(screen.getByTestId(TEST_IDS.ORDER.DETAILS_CUSTOMER)).toHaveTextContent(
      'customer@example.com'
    );
    expect(screen.getByTestId(TEST_IDS.ORDER.REQUEST_RETURN_BUTTON)).toBeVisible();
    expect(screen.queryByTestId(TEST_IDS.ADMIN.CONFIRM_LOST_BUTTON)).not.toBeInTheDocument();

    const entries = screen.getAllByTestId(TEST_IDS.ORDER.TIMELINE_ENTRY);
    expect(entries).toHaveLength(3);
    expect(screen.getAllByTestId(TEST_IDS.ORDER.TIMELINE_ENTRY_OLD_STATUS)[0]).toHaveTextContent(
      ''
    );
    expect(screen.getAllByTestId(TEST_IDS.ORDER.TIMELINE_ENTRY_NEW_STATUS)[0]).toHaveTextContent(
      'Chờ xác nhận'
    );
    expect(screen.getAllByTestId(TEST_IDS.ORDER.TIMELINE_ENTRY_NEW_STATUS)[2]).toHaveTextContent(
      'Đang giao'
    );

    await user.click(screen.getByTestId(TEST_IDS.ORDER.TAB_TRACKING));
    expect(screen.getByTestId(TEST_IDS.SHIPMENT.CODE)).toHaveTextContent('VD-2026-0001');
    expect(screen.getByTestId(TEST_IDS.SHIPMENT.SHIPPER)).toHaveTextContent('shipper@example.com');
    expect(screen.getByTestId(TEST_IDS.SHIPMENT.CREATED_AT)).toHaveTextContent('10/06/2026 10:00');
    customerView.unmount();

    apiClient.setUser({
      id: 'adm_1',
      email: 'admin@store.vn',
      fullName: 'Store Admin',
      role: 'Admin',
    });

    render(
      <MemoryRouter initialEntries={['/orders/DH-2026-0001']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    expect(screen.queryByTestId(TEST_IDS.ORDER.REQUEST_RETURN_BUTTON)).not.toBeInTheDocument();
    await user.click(screen.getByTestId(TEST_IDS.ADMIN.CONFIRM_LOST_BUTTON));
    expect(reportSpy).toHaveBeenCalledWith('ord_1', expect.objectContaining({ issueType: 'LOST' }));
  });
});
