import type { Page } from '@playwright/test';
import { TEST_IDS } from '../../src/constants/test-ids';
import {
  APP_PATHS,
  assignOrderToShipper,
  expectHistoryStatuses,
  expectListedOrderStatus,
  expectOrderStatus,
  expectShipmentStatus,
  expectTrackedStatus,
  historyEntries,
  openAdminOrder,
  openAdminShipment,
  openAssignedList,
  openAssignmentList,
  openOrderByCode,
  openOrderCreation,
  openOrderList,
  openShipperHistory,
  openTrackingList,
  openTrackingTab,
  readOptionLabels,
  shipmentCardByCode,
  SHIPPER_ACTION_IDS,
  shipperDeliver,
  shipperPickUp,
  trackingRow,
} from './helpers/flows';
import {
  issueRows,
  openIssue,
  openIssuesList,
  readIncidentTypeOptions,
  saveIssueResult,
} from './helpers/issue-flows';
import {
  approveReturn,
  completeReturn,
  expectMyReturn,
  expectMyReturnCount,
  expectReviewStatus,
  openReturnForm,
  rejectReturn,
  requestReturn,
} from './helpers/return-flows';
import {
  expectLoginRejected,
  loginWithCredentials,
  logout,
  openLoginScreen,
  openRegisterScreen,
  registerCustomer,
} from './helpers/session';
import { generatePassword } from './helpers/data';
import {
  ALL_ORDER_STATUSES,
  INCIDENT_TYPE,
  LONG_SCENARIO_TIMEOUT_MS,
  MAX_PASSWORD_LENGTH,
  OBSERVATION_WINDOW_MS,
  ORDER_STATUS,
  REALTIME_TIMEOUT_MS,
  RECONNECT_TIMEOUT_MS,
  RETURN_REASON,
  RETURN_STATUS,
  SCREEN_NAME,
  SHORT_TEXT,
  type OrderStatusName,
} from './helpers/constants';
import { ABSENCE_IDS } from './helpers/absence-ids';
import {
  expectNoElements,
  expectPageNotReloaded,
  expectScreenUnavailable,
  expectSignedOutBlocked,
  markLoadedPage,
  countNotificationsFor,
  notificationsFor,
  recordRequests,
} from './helpers/nfr-flows';
import { expect, test } from './helpers/world';

test.describe.configure({ timeout: LONG_SCENARIO_TIMEOUT_MS });

const RETURN_REVIEW_IDS = [
  TEST_IDS.ADMIN.RETURNS_TAB,
  TEST_IDS.ADMIN.APPROVE_RETURN_BUTTON,
  TEST_IDS.ADMIN.REJECT_RETURN_BUTTON,
  TEST_IDS.ADMIN.RETURN_COMPLETE_BUTTON,
];

const INCIDENT_HANDLING_IDS = [
  TEST_IDS.ADMIN.ISSUES_TAB,
  TEST_IDS.ADMIN.ISSUES_LIST,
  TEST_IDS.ADMIN.RESOLVE_ISSUE_BUTTON,
  TEST_IDS.ADMIN.ISSUE_RESULT_INPUT,
];

const ASSIGNMENT_IDS = [TEST_IDS.ADMIN.DASHBOARD_TABLE, TEST_IDS.ADMIN.ASSIGN_BUTTON];

const HISTORY_EDIT_IDS = [
  ABSENCE_IDS.TIMELINE_EDIT_BUTTON,
  ABSENCE_IDS.TIMELINE_DELETE_BUTTON,
];

async function expectSignedOutAfterLogout(page: Page, homeTestId: string): Promise<void> {
  const previousAddress = page.url();
  await logout(page);
  await page.goBack();
  await expect(page.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT)).toBeVisible();
  await expect(page.getByTestId(homeTestId)).toHaveCount(0);
  await page.goto(previousAddress);
  await expect(page.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT)).toBeVisible();
  await expect(page.getByTestId(homeTestId)).toHaveCount(0);
}

async function expectScreenShown(page: Page, path: string, marker: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByTestId(marker).first()).toBeVisible();
}

async function expectScreenName(page: Page, path: string, name: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByTestId(TEST_IDS.COMMON.SCREEN_TITLE)).toHaveText(name);
}

async function openCustomerHome(page: Page): Promise<void> {
  await page.goto(APP_PATHS.customerHome);
  await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toBeVisible();
}

test.describe('Real-time status updates', () => {
  test('shows delivering and then delivered on the customer tracking screen without reloading', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipper = await world.shipperA();
    await openOrderByCode(customer.page, code);
    await openTrackingTab(customer.page);
    await markLoadedPage(customer.page);
    await shipperPickUp(shipper, code);
    await expectOrderStatus(customer.page, ORDER_STATUS.DELIVERING, REALTIME_TIMEOUT_MS);
    await shipperDeliver(shipper, code);
    await expectOrderStatus(customer.page, ORDER_STATUS.DELIVERED, REALTIME_TIMEOUT_MS);
    await expectPageNotReloaded(customer.page);
  });

  test('shows the assigned status on the customer order details without reloading', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.PENDING);
    await openOrderByCode(customer.page, code);
    await markLoadedPage(customer.page);
    await world.assign(code);
    await expectOrderStatus(customer.page, ORDER_STATUS.AWAITING_PICKUP, REALTIME_TIMEOUT_MS);
    await expectPageNotReloaded(customer.page);
  });

  test('does not update a customer screen for orders of other customers', async ({ world }) => {
    const owner = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const other = await world.orderAt(ORDER_STATUS.PENDING);
    await openOrderByCode(owner.customer.page, owner.code);
    await openOrderByCode(other.customer.page, other.code);
    await markLoadedPage(other.customer.page);
    await shipperPickUp(await world.shipperA(), owner.code);
    await expectOrderStatus(owner.customer.page, ORDER_STATUS.DELIVERING, REALTIME_TIMEOUT_MS);
    await expectOrderStatus(other.customer.page, ORDER_STATUS.PENDING);
    await expect(other.customer.page.getByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER)).not.toContainText(owner.code);
    await expectPageNotReloaded(other.customer.page);
  });

  test('updates the admin dashboard when a shipper changes an order without reloading', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const admin = await world.admin();
    await openTrackingList(admin);
    await markLoadedPage(admin);
    await shipperPickUp(await world.shipperA(), code);
    await expect(trackingRow(admin, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.DELIVERING, {
      timeout: REALTIME_TIMEOUT_MS,
    });
    await expectPageNotReloaded(admin);
  });

  test('updates the admin dashboard when another admin assigns an order without reloading', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.PENDING);
    const admin = await world.admin();
    const secondAdmin = await world.secondAdmin();
    await openTrackingList(admin);
    await markLoadedPage(admin);
    await assignOrderToShipper(secondAdmin, code);
    await expect(trackingRow(admin, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.AWAITING_PICKUP, {
      timeout: REALTIME_TIMEOUT_MS,
    });
    await expectPageNotReloaded(admin);
  });
});

test.describe('Access control, sign-out and passwords', () => {
  test('opens the login and registration screens without signing in', async ({ world }) => {
    const page = await world.newPage();
    await openLoginScreen(page);
    await openRegisterScreen(page);
    const customer = await registerCustomer(page);
    await loginWithCredentials(page, 'Customer', customer.email, customer.password);
  });

  test('sends signed-out visitors to login for every protected screen', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.PENDING);
    const page = await world.newPage();
    const paths = [
      APP_PATHS.customerHome,
      APP_PATHS.orderCreation,
      APP_PATHS.orderList,
      APP_PATHS.returnList,
      APP_PATHS.orderDetails(code),
      APP_PATHS.returnRequest(code),
      APP_PATHS.tracking(code),
      APP_PATHS.adminDashboard,
      APP_PATHS.shipperDeliveries,
    ];
    for (const path of paths) {
      await expectSignedOutBlocked(page, path);
    }
  });

  test('lets a customer create an order in their own name and see it with their return requests', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await requestReturn(customer.page, code, RETURN_REASON.OTHER, SHORT_TEXT);
    await openOrderByCode(customer.page, code);
    await expect(customer.page.getByTestId(TEST_IDS.ORDER.DETAILS_CUSTOMER)).toContainText(customer.email);
    await expectListedOrderStatus(customer.page, code, ORDER_STATUS.DELIVERED);
    await expectMyReturnCount(customer.page, code, 1);
  });

  test('hides other customers data and order creation from other roles and signed-out visitors', async ({ world }) => {
    const own = await world.orderAt(ORDER_STATUS.DELIVERED);
    await requestReturn(own.customer.page, own.code, RETURN_REASON.OTHER, SHORT_TEXT);
    const other = await world.orderAt(ORDER_STATUS.DELIVERED);
    await requestReturn(other.customer.page, other.code, RETURN_REASON.OTHER, SHORT_TEXT);
    await openOrderList(other.customer.page);
    const listed = other.customer.page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM);
    await expect(listed.filter({ hasText: other.code })).toHaveCount(1);
    await expect(listed.filter({ hasText: own.code })).toHaveCount(0);
    await expectMyReturnCount(other.customer.page, other.code, 1);
    await expectMyReturnCount(other.customer.page, own.code, 0);
    await expectNoElements(await world.shipperA(), [TEST_IDS.ORDER.CREATE_BUTTON]);
    await expectNoElements(await world.admin(), [TEST_IDS.ORDER.CREATE_BUTTON]);
    await expectSignedOutBlocked(await world.newPage(), APP_PATHS.orderCreation);
  });

  test('lets a customer request a return for their own delivered order', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await requestReturn(customer.page, code, RETURN_REASON.DEFECTIVE, SHORT_TEXT);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
  });

  test('hides the return request action from other customers, shippers, admins and signed-out visitors', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    const otherCustomer = await world.newCustomer();
    await openOrderList(otherCustomer.page);
    await expect(otherCustomer.page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM).filter({ hasText: code })).toHaveCount(0);
    await expectNoElements(await world.shipperA(), [TEST_IDS.ORDER.REQUEST_RETURN_BUTTON]);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expectNoElements(admin, [TEST_IDS.ORDER.REQUEST_RETURN_BUTTON]);
    await expectSignedOutBlocked(await world.newPage(), APP_PATHS.returnRequest(code));
  });

  test('lets an assigned shipper see their order and move it to delivering', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipper = await world.shipperA();
    await openAssignedList(shipper);
    await expect(shipmentCardByCode(shipper, code)).toBeVisible();
    await shipperPickUp(shipper, code);
    await expectShipmentStatus(shipper, code, ORDER_STATUS.DELIVERING);
  });

  test('hides assigned orders from other shippers, customers and signed-out visitors', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipperB = await world.shipperB();
    await openAssignedList(shipperB);
    await expect(shipmentCardByCode(shipperB, code)).toHaveCount(0);
    await expectScreenUnavailable(shipperB, APP_PATHS.orderDetails(code), [TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER]);
    const customer = await world.newCustomer();
    await expectScreenUnavailable(customer.page, APP_PATHS.shipperDeliveries, [TEST_IDS.SHIPPER.ASSIGNED_LIST]);
    await expectSignedOutBlocked(await world.newPage(), APP_PATHS.shipperDeliveries);
  });

  test('lets an admin create a shipment and assign an order', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.PENDING);
    await world.assign(code);
    const admin = await world.admin();
    await openAdminShipment(admin, code);
    await expectTrackedStatus(admin, code, ORDER_STATUS.AWAITING_PICKUP);
  });

  test('hides assignment actions from customers, shippers and signed-out visitors', async ({ world }) => {
    await world.orderAt(ORDER_STATUS.PENDING);
    const customer = await world.newCustomer();
    await expectNoElements(customer.page, ASSIGNMENT_IDS);
    await expectNoElements(await world.shipperA(), ASSIGNMENT_IDS);
    await expectSignedOutBlocked(await world.newPage(), APP_PATHS.adminDashboard);
  });

  test('lets an admin approve, reject and complete return requests', async ({ world }) => {
    const customer = await world.newCustomer();
    const codes: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      codes.push((await world.orderWithReturn(RETURN_REASON.OTHER, SHORT_TEXT, customer)).code);
    }
    const admin = await world.admin();
    await approveReturn(admin, codes[0]);
    await rejectReturn(admin, codes[1], SHORT_TEXT);
    await approveReturn(admin, codes[2]);
    await completeReturn(admin, codes[2]);
    await expectMyReturn(customer.page, codes[0], { status: RETURN_STATUS.APPROVED });
    await expectMyReturn(customer.page, codes[1], { status: RETURN_STATUS.REJECTED, rejectReason: SHORT_TEXT });
    await expectMyReturn(customer.page, codes[2], { status: RETURN_STATUS.COMPLETED });
  });

  test('hides return review actions from customers, shippers and signed-out visitors', async ({ world }) => {
    await world.orderWithReturn(RETURN_REASON.OTHER, SHORT_TEXT);
    const customer = await world.newCustomer();
    await expectNoElements(customer.page, RETURN_REVIEW_IDS);
    await expectNoElements(await world.shipperA(), RETURN_REVIEW_IDS);
    await expectSignedOutBlocked(await world.newPage(), APP_PATHS.adminDashboard);
  });

  test('lets an admin list and resolve incidents', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    await world.report(code, INCIDENT_TYPE.DAMAGED);
    const admin = await world.admin();
    await saveIssueResult(await openIssue(admin, code, INCIDENT_TYPE.DAMAGED), SHORT_TEXT);
    await openIssuesList(admin);
    await expect(issueRows(admin, code)).toHaveCount(0);
  });

  test('hides the incident list from customers, shippers and signed-out visitors', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    await world.report(code, INCIDENT_TYPE.DAMAGED);
    const customer = await world.newCustomer();
    await expectNoElements(customer.page, INCIDENT_HANDLING_IDS);
    await expectNoElements(await world.shipperA(), INCIDENT_HANDLING_IDS);
    await expectSignedOutBlocked(await world.newPage(), APP_PATHS.adminDashboard);
  });

  test('lets an assigned shipper update the status and report an incident', async ({ world }) => {
    const first = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const second = await world.orderAt(ORDER_STATUS.DELIVERING);
    const shipper = await world.shipperA();
    await shipperPickUp(shipper, first.code);
    await expectShipmentStatus(shipper, first.code, ORDER_STATUS.DELIVERING);
    await world.report(second.code, INCIDENT_TYPE.DAMAGED);
    await expectShipmentStatus(shipper, second.code, ORDER_STATUS.DAMAGED);
    const admin = await world.admin();
    await openIssuesList(admin);
    await expect(issueRows(admin, second.code, INCIDENT_TYPE.DAMAGED)).toHaveCount(1);
  });

  test('hides shipper delivery actions from unassigned shippers, admins, customers and signed-out visitors', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    const shipperB = await world.shipperB();
    await openAssignedList(shipperB);
    await expect(shipmentCardByCode(shipperB, code)).toHaveCount(0);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expectNoElements(admin, SHIPPER_ACTION_IDS);
    await openOrderByCode(customer.page, code);
    await expectNoElements(customer.page, SHIPPER_ACTION_IDS);
    await expectSignedOutBlocked(await world.newPage(), APP_PATHS.shipperDeliveries);
  });

  test('signs a customer out and back in', async ({ world }) => {
    const customer = await world.newCustomer();
    const code = await world.placeOrder(customer);
    await logout(customer.page);
    await loginWithCredentials(customer.page, 'Customer', customer.email, customer.password);
    await openOrderList(customer.page);
    await expect(customer.page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM).filter({ hasText: code })).toBeVisible();
  });

  test('refuses signed-out users who go back or reopen the previous screen', async ({ world }) => {
    const customer = await world.newCustomer();
    await expectSignedOutAfterLogout(customer.page, TEST_IDS.ORDER.CREATE_BUTTON);
    await expectSignedOutAfterLogout(await world.shipperA(), TEST_IDS.SHIPPER.ASSIGNED_LIST);
    await expectSignedOutAfterLogout(await world.admin(), TEST_IDS.ADMIN.DASHBOARD_TABLE);
  });

  test('refuses login with the password cut by one character', async ({ world }) => {
    const page = await world.newPage();
    const customer = await registerCustomer(page, { password: generatePassword(MAX_PASSWORD_LENGTH) });
    await expectLoginRejected(page, customer.email, customer.password.slice(0, MAX_PASSWORD_LENGTH - 1));
  });
});

test.describe('Recovery after losing connection', () => {
  test('shows the latest status on the customer order details after reconnecting', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipper = await world.shipperA();
    await openOrderByCode(customer.page, code);
    await expect(historyEntries(customer.page)).toHaveCount(2);
    await customer.page.context().setOffline(true);
    await shipperPickUp(shipper, code);
    await shipperDeliver(shipper, code);
    await customer.page.context().setOffline(false);
    await expectOrderStatus(customer.page, ORDER_STATUS.DELIVERED, RECONNECT_TIMEOUT_MS);
    await expect(historyEntries(customer.page)).toHaveCount(4, { timeout: RECONNECT_TIMEOUT_MS });
    await expectHistoryStatuses(customer.page, [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.AWAITING_PICKUP,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.DELIVERED,
    ]);
  });

  test('shows the latest orders on the admin dashboard after reconnecting', async ({ world }) => {
    const first = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const second = await world.orderAt(ORDER_STATUS.PENDING);
    const admin = await world.admin();
    await openTrackingList(admin);
    await admin.context().setOffline(true);
    await shipperPickUp(await world.shipperA(), first.code);
    await assignOrderToShipper(await world.secondAdmin(), second.code);
    await admin.context().setOffline(false);
    await expect(trackingRow(admin, first.code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.DELIVERING, {
      timeout: RECONNECT_TIMEOUT_MS,
    });
    await expect(trackingRow(admin, second.code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.AWAITING_PICKUP, {
      timeout: RECONNECT_TIMEOUT_MS,
    });
  });
});

test.describe('In-app notifications', () => {
  test('notifies the customer on the home screen when a shipper changes an order', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    await openCustomerHome(customer.page);
    const before = await countNotificationsFor(customer.page, code);
    await shipperPickUp(await world.shipperA(), code);
    await expect(notificationsFor(customer.page, code)).toHaveCount(before + 1, { timeout: REALTIME_TIMEOUT_MS });
  });

  test('notifies the customer on another screen when an admin assigns an order', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.PENDING);
    await openCustomerHome(customer.page);
    await openOrderCreation(customer.page);
    const before = await countNotificationsFor(customer.page, code);
    await world.assign(code);
    await expect(notificationsFor(customer.page, code)).toHaveCount(before + 1, { timeout: REALTIME_TIMEOUT_MS });
    await expect(customer.page.getByTestId(TEST_IDS.ORDER.STEP_PRODUCT)).toBeVisible();
  });

  test('shows one notification for each of two consecutive status changes', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    await openCustomerHome(customer.page);
    const before = await countNotificationsFor(customer.page, code);
    const shipper = await world.shipperA();
    await shipperPickUp(shipper, code);
    await shipperDeliver(shipper, code);
    await expect(notificationsFor(customer.page, code)).toHaveCount(before + 2, { timeout: REALTIME_TIMEOUT_MS });
  });

  test('sends no notification about another customer order', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const other = await world.newCustomer();
    await openCustomerHome(customer.page);
    await openCustomerHome(other.page);
    const before = await countNotificationsFor(customer.page, code);
    await shipperPickUp(await world.shipperA(), code);
    await expect(notificationsFor(customer.page, code)).toHaveCount(before + 1, { timeout: REALTIME_TIMEOUT_MS });
    await expect(notificationsFor(other.page, code)).toHaveCount(0);
  });
});

test.describe('History integrity', () => {
  test('offers no edit or delete action on the order history for any role', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openOrderByCode(customer.page, code);
    await expect(historyEntries(customer.page)).not.toHaveCount(0);
    await expectNoElements(customer.page, HISTORY_EDIT_IDS);
    const shipper = await world.shipperA();
    await openShipperHistory(shipper, code);
    await expect(historyEntries(shipper)).not.toHaveCount(0);
    await expectNoElements(shipper, HISTORY_EDIT_IDS);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expect(historyEntries(admin)).not.toHaveCount(0);
    await expectNoElements(admin, HISTORY_EDIT_IDS);
  });

  test('adds exactly one history entry and keeps older entries unchanged', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    await openOrderByCode(customer.page, code);
    await expect(historyEntries(customer.page)).toHaveCount(3);
    const before = await historyEntries(customer.page).allTextContents();
    await world.deliver(code);
    await openOrderByCode(customer.page, code);
    await expect(historyEntries(customer.page)).toHaveCount(before.length + 1);
    const after = await historyEntries(customer.page).allTextContents();
    expect(after.slice(0, before.length)).toEqual(before);
  });
});

test.describe('Operating environment', () => {
  test('opens every screen by its web address in the browser', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await expectScreenShown(customer.page, APP_PATHS.customerHome, TEST_IDS.ORDER.CREATE_BUTTON);
    await expectScreenShown(customer.page, APP_PATHS.orderCreation, TEST_IDS.ORDER.STEP_PRODUCT);
    await expectScreenShown(customer.page, APP_PATHS.orderList, TEST_IDS.ORDER.ORDER_LIST_ITEM);
    await expectScreenShown(customer.page, APP_PATHS.returnList, TEST_IDS.RETURN.LIST);
    await expectScreenShown(customer.page, APP_PATHS.orderDetails(code), TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    await expectScreenShown(customer.page, APP_PATHS.returnRequest(code), TEST_IDS.RETURN.REQUEST_FORM);
    await expectScreenShown(customer.page, APP_PATHS.tracking(code), TEST_IDS.SHIPMENT.TIMELINE_CONTAINER);
    await expectScreenShown(await world.admin(), APP_PATHS.adminDashboard, TEST_IDS.ADMIN.DASHBOARD_TABLE);
    await expectScreenShown(await world.shipperA(), APP_PATHS.shipperDeliveries, TEST_IDS.SHIPPER.ASSIGNED_LIST);
    await expectScreenShown(await world.newPage(), APP_PATHS.login, TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON);
    await expectScreenShown(await world.newPage(), APP_PATHS.register, TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON);
  });
});

test.describe('No periodic reload and Vietnamese wording', () => {
  test('sends no periodic reload requests while nothing changes', async ({ world }) => {
    test.slow();
    const { customer, code } = await world.orderAt(ORDER_STATUS.PENDING);
    const admin = await world.admin();
    await openOrderByCode(customer.page, code);
    await openAssignmentList(admin);
    await markLoadedPage(customer.page);
    await markLoadedPage(admin);
    const stopCustomer = recordRequests(customer.page);
    const stopAdmin = recordRequests(admin);
    await customer.page.waitForTimeout(OBSERVATION_WINDOW_MS);
    expect(stopCustomer()).toEqual([]);
    expect(stopAdmin()).toEqual([]);
    await expectPageNotReloaded(customer.page);
    await expectPageNotReloaded(admin);
  });

  test('updates the customer screen from a change event without reloading the page', async ({ world }) => {
    test.slow();
    const { customer, code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    await openOrderByCode(customer.page, code);
    await openTrackingTab(customer.page);
    await markLoadedPage(customer.page);
    const stop = recordRequests(customer.page);
    await shipperPickUp(await world.shipperA(), code);
    await expect(customer.page.getByTestId(TEST_IDS.SHIPMENT.TIMELINE_CONTAINER)).toContainText(ORDER_STATUS.DELIVERING, {
      timeout: REALTIME_TIMEOUT_MS,
    });
    await customer.page.waitForTimeout(OBSERVATION_WINDOW_MS);
    const requests = stop();
    await expectPageNotReloaded(customer.page);
    expect(new Set(requests).size).toBe(requests.length);
  });

  test('shows the nine order status names verbatim', async ({ world }) => {
    test.slow();
    const customer = await world.newCustomer();
    const admin = await world.admin();
    const orders: Array<{ status: OrderStatusName; code: string }> = [];
    for (const status of ALL_ORDER_STATUSES) {
      orders.push({ status, code: (await world.orderAt(status, {}, customer)).code });
    }
    for (const { status, code } of orders) {
      await expectListedOrderStatus(customer.page, code, status);
      await openOrderByCode(customer.page, code);
      await expectOrderStatus(customer.page, status);
      await expectTrackedStatus(admin, code, status);
    }
  });

  test('shows the four return request status names verbatim', async ({ world }) => {
    test.slow();
    const customer = await world.newCustomer();
    const codes: string[] = [];
    for (let index = 0; index < 4; index += 1) {
      codes.push((await world.orderWithReturn(RETURN_REASON.OTHER, SHORT_TEXT, customer)).code);
    }
    const admin = await world.admin();
    await approveReturn(admin, codes[1]);
    await rejectReturn(admin, codes[2], SHORT_TEXT);
    await approveReturn(admin, codes[3]);
    await completeReturn(admin, codes[3]);
    const expected = [RETURN_STATUS.PENDING, RETURN_STATUS.APPROVED, RETURN_STATUS.REJECTED, RETURN_STATUS.COMPLETED];
    for (const [position, status] of expected.entries()) {
      await expectMyReturn(customer.page, codes[position], { status });
    }
    await expectReviewStatus(admin, codes[0], RETURN_STATUS.PENDING);
    await expectReviewStatus(admin, codes[1], RETURN_STATUS.APPROVED);
  });

  test('shows the three return reasons verbatim', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
    const labels = await readOptionLabels(customer.page.getByTestId(TEST_IDS.RETURN.REASON_SELECT));
    expect([...labels].sort()).toEqual([RETURN_REASON.DEFECTIVE, RETURN_REASON.NOT_RECEIVED, RETURN_REASON.OTHER].sort());
  });

  test('shows the three incident types verbatim', async ({ world }) => {
    const failed = await world.orderAt(ORDER_STATUS.DELIVERING);
    const damaged = await world.orderAt(ORDER_STATUS.DELIVERING);
    const lost = await world.orderAt(ORDER_STATUS.DELIVERING);
    const labels = await readIncidentTypeOptions(await world.shipperA(), failed.code);
    expect([...labels].sort()).toEqual(Object.values(INCIDENT_TYPE).sort());
    await world.report(failed.code, INCIDENT_TYPE.FAILED_DELIVERY);
    await world.report(damaged.code, INCIDENT_TYPE.DAMAGED);
    await world.report(lost.code, INCIDENT_TYPE.LOST);
    const admin = await world.admin();
    const reported = [
      { code: failed.code, type: INCIDENT_TYPE.FAILED_DELIVERY },
      { code: damaged.code, type: INCIDENT_TYPE.DAMAGED },
      { code: lost.code, type: INCIDENT_TYPE.LOST },
    ];
    for (const { code, type } of reported) {
      const row = await openIssue(admin, code, type);
      await expect(row.getByTestId(TEST_IDS.ADMIN.ISSUE_TYPE)).toHaveText(type);
    }
  });

  test('shows the nine screen names verbatim', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await expectScreenName(await world.newPage(), APP_PATHS.login, SCREEN_NAME.LOGIN);
    await expectScreenName(await world.newPage(), APP_PATHS.register, SCREEN_NAME.REGISTER);
    await expectScreenName(customer.page, APP_PATHS.customerHome, SCREEN_NAME.CUSTOMER_HOME);
    await expectScreenName(customer.page, APP_PATHS.orderCreation, SCREEN_NAME.ORDER_CREATION);
    await expectScreenName(customer.page, APP_PATHS.orderDetails(code), SCREEN_NAME.ORDER_DETAILS);
    await expectScreenName(customer.page, APP_PATHS.returnRequest(code), SCREEN_NAME.RETURN_REQUEST);
    await expectScreenName(customer.page, APP_PATHS.tracking(code), SCREEN_NAME.TRACKING);
    await expectScreenName(await world.admin(), APP_PATHS.adminDashboard, SCREEN_NAME.ADMIN_DASHBOARD);
    await expectScreenName(await world.shipperA(), APP_PATHS.shipperDeliveries, SCREEN_NAME.SHIPPER_DELIVERY);
  });
});
