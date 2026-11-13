import { TEST_IDS } from '../../src/constants/test-ids';
import {
  assignmentRow,
  assignOrderToShipper,
  chooseShipperForOrder,
  expectListedOrderCount,
  listedOrder,
  dismissDialog,
  expectEveryRowHasStatus,
  expectHistoryEntry,
  expectHistoryStatuses,
  expectHistoryTimestamps,
  expectLatestHistoryEntry,
  expectListedOrderStatus,
  expectNextStatusChoices,
  expectNoSavedOrder,
  expectOrderStatus,
  expectShipmentStatus,
  expectTrackedStatus,
  historyEntries,
  openAdminOrder,
  openAdminShipment,
  openAssignedList,
  openAssignmentList,
  openOrderByCode,
  openShipperHistory,
  openTrackingList,
  openTrackingTab,
  pressSaveAssignment,
  readOptionLabels,
  readShipmentCode,
  saveAssignment,
  shipmentCardByCode,
  shipperDeliver,
  shipperPickUp,
  startStatusChange,
  trackingRow,
} from './helpers/flows';
import { adminConfirmLost } from './helpers/issue-flows';
import { emailOf } from './helpers/session';
import {
  ALL_ORDER_STATUSES,
  FAILED_DELIVERY_LIMIT,
  LONG_SCENARIO_TIMEOUT_MS,
  NON_PENDING_ORDER_STATUSES,
  ORDER_STATUS,
  type OrderStatusName,
  RECONNECT_TIMEOUT_MS,
  TIMESTAMP_FORMAT,
} from './helpers/constants';
import { PENDING_TEST_IDS } from './helpers/pending-test-ids';
import { type Customer, expect, test, World } from './helpers/world';

test.describe.configure({ timeout: LONG_SCENARIO_TIMEOUT_MS });

async function placeFor(world: World): Promise<{ customer: Customer; code: string }> {
  return world.orderAt(ORDER_STATUS.PENDING);
}

async function placeOrders(world: World, count: number): Promise<string[]> {
  const customer = await world.newCustomer();
  const codes: string[] = [];
  for (let index = 0; index < count; index += 1) {
    codes.push(await world.placeOrder(customer));
  }
  return codes;
}

async function expectStatusAfterReconnect(world: World, status: string, changes: (code: string) => Promise<void>, from: OrderStatusName): Promise<void> {
  const { customer, code } = await world.orderAt(from);
  await openOrderByCode(customer.page, code);
  await openTrackingTab(customer.page);
  await customer.page.context().setOffline(true);
  await changes(code);
  await customer.page.context().setOffline(false);
  await expectOrderStatus(customer.page, status, RECONNECT_TIMEOUT_MS);
}

test.describe('Order assignment to a shipper', () => {
  test('lists only orders waiting for confirmation on the admin assignment list', async ({ world }) => {
    test.slow();
    const admin = await world.admin();
    const customer = await world.newCustomer();
    const waiting = await world.placeOrder(customer);
    const others: string[] = [];
    for (const status of NON_PENDING_ORDER_STATUSES) {
      others.push((await world.orderAt(status, {}, customer)).code);
    }
    await openAssignmentList(admin);
    await expect(assignmentRow(admin, waiting)).toHaveCount(1);
    for (const code of others) {
      await expect(assignmentRow(admin, code)).toHaveCount(0);
    }
    await expectEveryRowHasStatus(admin.getByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE), ORDER_STATUS.PENDING);
  });

  test('removes an assigned order from the admin assignment list', async ({ world }) => {
    const { code } = await placeFor(world);
    const admin = await world.admin();
    await assignOrderToShipper(admin, code);
    await openAssignmentList(admin);
    await expect(assignmentRow(admin, code)).toHaveCount(0);
  });

  test('creates a shipment with a unique code, the chosen shipper and a creation time when an order is assigned', async ({ world }) => {
    const { code } = await placeFor(world);
    const admin = await world.admin();
    await assignOrderToShipper(admin, code);
    await openAdminShipment(admin, code);
    await readShipmentCode(admin);
    await expect(admin.getByTestId(PENDING_TEST_IDS.SHIPMENT.SHIPPER)).toContainText(emailOf('Shipper'));
    await expect(admin.getByTestId(PENDING_TEST_IDS.SHIPMENT.CREATED_AT)).toHaveText(TIMESTAMP_FORMAT);
  });

  test('gives two consecutive assignments different shipment codes', async ({ world }) => {
    const [first, second] = await placeOrders(world, 2);
    const admin = await world.admin();
    await assignOrderToShipper(admin, first);
    await assignOrderToShipper(admin, second);
    await openAdminShipment(admin, first);
    const firstShipmentCode = await readShipmentCode(admin);
    await openAdminShipment(admin, second);
    const secondShipmentCode = await readShipmentCode(admin);
    expect(secondShipmentCode).not.toBe(firstShipmentCode);
  });

  test('lets the admin pick a shipper for a selected order', async ({ world }) => {
    const { code } = await placeFor(world);
    const admin = await world.admin();
    await openAssignmentList(admin);
    const dialog = await chooseShipperForOrder(admin, code);
    const labels = (await readOptionLabels(dialog.getByTestId(TEST_IDS.ADMIN.SHIPPER_SELECT))).join(' ');
    expect(labels).toContain(emailOf('Shipper'));
    expect(labels).toContain(emailOf('Shipper', 'secondary'));
    await expect(dialog.getByTestId(TEST_IDS.ADMIN.CONFIRM_ASSIGN_BUTTON)).toBeEnabled();
  });

  test('puts the assigned order on the chosen shipper list and not on another shipper list', async ({ world }) => {
    const { code } = await placeFor(world);
    await world.assign(code);
    const admin = await world.admin();
    await openAdminShipment(admin, code);
    await expect(admin.getByTestId(PENDING_TEST_IDS.SHIPMENT.SHIPPER)).toContainText(emailOf('Shipper'));
    const shipperA = await world.shipperA();
    await openAssignedList(shipperA);
    await expect(shipmentCardByCode(shipperA, code)).toHaveCount(1);
    const shipperB = await world.shipperB();
    await openAssignedList(shipperB);
    await expect(shipmentCardByCode(shipperB, code)).toHaveCount(0);
  });

  test('moves an assigned order to waiting for pickup', async ({ world }) => {
    const { code } = await placeFor(world);
    await world.assign(code);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expectOrderStatus(admin, ORDER_STATUS.AWAITING_PICKUP);
  });

  test('keeps the order waiting for confirmation until the assignment is saved', async ({ world }) => {
    const { code } = await placeFor(world);
    const admin = await world.admin();
    await openAssignmentList(admin);
    const dialog = await chooseShipperForOrder(admin, code);
    await admin.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await openAssignmentList(admin);
    await expect(assignmentRow(admin, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.PENDING);
  });
});

test.describe('Shipper status updates', () => {
  test('shows a shipper only the orders assigned to that shipper', async ({ world }) => {
    const [first, second] = await placeOrders(world, 2);
    await world.assign(first);
    await world.assign(second, 'secondary');
    const shipperA = await world.shipperA();
    await openAssignedList(shipperA);
    await expect(shipmentCardByCode(shipperA, first)).toHaveCount(1);
    await expect(shipmentCardByCode(shipperA, second)).toHaveCount(0);
  });

  test('shows an empty assigned list to a shipper without assignments', async ({ world }) => {
    const unassignedShipper = await world.unassignedShipper();
    await openAssignedList(unassignedShipper);
    await expect(unassignedShipper.getByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD)).toHaveCount(0);
    await expect(unassignedShipper.getByTestId(TEST_IDS.COMMON.EMPTY_STATE)).toBeVisible();
  });

  test('offers only delivering as the next status for an order waiting for pickup', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    await expectNextStatusChoices(await world.shipperA(), code, { pickup: true, deliver: false });
  });

  test('offers only delivered as the next status for a delivering order and no incident status', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    const shipperA = await world.shipperA();
    await expectNextStatusChoices(shipperA, code, { pickup: false, deliver: true });
    const card = shipmentCardByCode(shipperA, code);
    for (const status of [ORDER_STATUS.FAILED_DELIVERY, ORDER_STATUS.DAMAGED, ORDER_STATUS.LOST]) {
      await expect(card).not.toContainText(status);
    }
    await expect(shipperA.getByTestId(TEST_IDS.SHIPPER.ISSUE_TYPE_SELECT)).toHaveCount(0);
  });

  test('offers delivering again after the first failed delivery', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 1 });
    await expectNextStatusChoices(await world.shipperA(), code, { pickup: true, deliver: false });
  });

  test('offers delivering again after the second failed delivery', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 2 });
    await expectNextStatusChoices(await world.shipperA(), code, { pickup: true, deliver: false });
  });

  test('blocks delivering again after the third failed delivery', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: FAILED_DELIVERY_LIMIT });
    await expectNextStatusChoices(await world.shipperA(), code, { pickup: false, deliver: false });
  });

  test('offers no next status for a delivered order', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    const shipperA = await world.shipperA();
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERED);
    await expectNextStatusChoices(shipperA, code, { pickup: false, deliver: false });
  });

  test('asks the shipper to confirm before an order moves to delivering', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipperA = await world.shipperA();
    await startStatusChange(shipperA, code, 'pickup');
    await expect(shipmentCardByCode(shipperA, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.AWAITING_PICKUP);
  });

  test('asks the shipper to confirm before an order moves to delivered', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    const shipperA = await world.shipperA();
    await startStatusChange(shipperA, code, 'deliver');
    await expect(shipmentCardByCode(shipperA, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.DELIVERING);
  });

  test('asks the shipper to confirm before a failed delivery moves to delivering again', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 1 });
    const shipperA = await world.shipperA();
    await startStatusChange(shipperA, code, 'pickup');
    await expect(shipmentCardByCode(shipperA, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(ORDER_STATUS.FAILED_DELIVERY);
  });

  test('keeps the order unchanged when the shipper closes the confirmation dialog', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipperA = await world.shipperA();
    await startStatusChange(shipperA, code, 'pickup');
    await dismissDialog(shipperA);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.AWAITING_PICKUP);
    await openShipperHistory(shipperA, code);
    await expectHistoryStatuses(shipperA, [ORDER_STATUS.PENDING, ORDER_STATUS.AWAITING_PICKUP]);
  });

  test('moves an order to delivering after the shipper confirms', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipperA = await world.shipperA();
    await shipperPickUp(shipperA, code);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERING);
  });

  test('moves an order to delivered after the shipper confirms', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    const shipperA = await world.shipperA();
    await shipperDeliver(shipperA, code);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERED);
  });

  test('moves a failed delivery back to delivering after the first incident', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 1 });
    const shipperA = await world.shipperA();
    await shipperPickUp(shipperA, code);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERING);
  });

  test('moves a failed delivery back to delivering after the second incident', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 2 });
    const shipperA = await world.shipperA();
    await shipperPickUp(shipperA, code);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERING);
  });

  test('records an admin history entry when an order is assigned', async ({ world }) => {
    const { code } = await placeFor(world);
    await world.assign(code);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expectLatestHistoryEntry(admin, {
      actorEmail: emailOf('Admin'),
      oldStatus: ORDER_STATUS.PENDING,
      newStatus: ORDER_STATUS.AWAITING_PICKUP,
    });
  });

  test('records a shipper history entry when an order moves to delivering', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipperA = await world.shipperA();
    await shipperPickUp(shipperA, code);
    await openShipperHistory(shipperA, code);
    await expectLatestHistoryEntry(shipperA, {
      actorEmail: emailOf('Shipper'),
      oldStatus: ORDER_STATUS.AWAITING_PICKUP,
      newStatus: ORDER_STATUS.DELIVERING,
    });
  });

  test('records a shipper history entry when an order moves to delivered', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    const shipperA = await world.shipperA();
    await shipperDeliver(shipperA, code);
    await openShipperHistory(shipperA, code);
    await expectLatestHistoryEntry(shipperA, {
      actorEmail: emailOf('Shipper'),
      oldStatus: ORDER_STATUS.DELIVERING,
      newStatus: ORDER_STATUS.DELIVERED,
    });
  });

  test('records an admin history entry when the admin confirms a delivering order as lost', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    const admin = await world.admin();
    await adminConfirmLost(admin, code);
    await openAdminOrder(admin, code);
    await expectLatestHistoryEntry(admin, {
      actorEmail: emailOf('Admin'),
      oldStatus: ORDER_STATUS.DELIVERING,
      newStatus: ORDER_STATUS.LOST,
    });
  });

  test('records separate chained history entries for consecutive status changes', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const shipperA = await world.shipperA();
    await shipperPickUp(shipperA, code);
    await shipperDeliver(shipperA, code);
    await openShipperHistory(shipperA, code);
    await expectHistoryStatuses(shipperA, [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.AWAITING_PICKUP,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.DELIVERED,
    ]);
    const entries = historyEntries(shipperA);
    await expectHistoryEntry(entries.nth(2), {
      oldStatus: ORDER_STATUS.AWAITING_PICKUP,
      newStatus: ORDER_STATUS.DELIVERING,
    });
    await expectHistoryEntry(entries.nth(3), {
      oldStatus: ORDER_STATUS.DELIVERING,
      newStatus: ORDER_STATUS.DELIVERED,
    });
  });
});

test.describe('Customer order tracking', () => {
  test('lists only the orders of the signed-in customer', async ({ world }) => {
    const customerA = await world.newCustomer();
    const customerB = await world.newCustomer();
    const first = await world.placeOrder(customerA);
    const second = await world.placeOrder(customerA);
    const other = await world.placeOrder(customerB);
    await expectListedOrderCount(customerA.page, 2);
    await expect(listedOrder(customerA.page, first)).toHaveCount(1);
    await expect(listedOrder(customerA.page, second)).toHaveCount(1);
    await expect(listedOrder(customerA.page, other)).toHaveCount(0);
  });

  test('shows a newly created order in the customer list as waiting for confirmation', async ({ world }) => {
    const { customer, code } = await placeFor(world);
    await expectListedOrderStatus(customer.page, code, ORDER_STATUS.PENDING);
  });

  test('shows an empty order list to a customer without orders', async ({ world }) => {
    const customer = await world.newCustomer();
    await expectNoSavedOrder(customer.page);
  });

  test('shows the current status of a newly created order', async ({ world }) => {
    const { customer, code } = await placeFor(world);
    await openOrderByCode(customer.page, code);
    await expectOrderStatus(customer.page, ORDER_STATUS.PENDING);
  });

  test('shows the latest status of an order that has been delivered', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openOrderByCode(customer.page, code);
    await expectOrderStatus(customer.page, ORDER_STATUS.DELIVERED);
  });

  test('shows one history entry for a newly created order', async ({ world }) => {
    const { customer, code } = await placeFor(world);
    await openOrderByCode(customer.page, code);
    await expect(historyEntries(customer.page)).toHaveCount(1);
    await expectHistoryEntry(historyEntries(customer.page).first(), {
      actorEmail: customer.email,
      oldStatus: '',
      newStatus: ORDER_STATUS.PENDING,
    });
  });

  test('shows the history from oldest to newest with timestamps', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openOrderByCode(customer.page, code);
    await expectHistoryStatuses(customer.page, [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.AWAITING_PICKUP,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.DELIVERED,
    ]);
    await expectHistoryTimestamps(customer.page);
  });

  test('shows every status change as its own history entry including a repeated delivering status', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED, { failedDeliveries: 1 });
    await openOrderByCode(customer.page, code);
    await expectHistoryStatuses(customer.page, [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.AWAITING_PICKUP,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.FAILED_DELIVERY,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.DELIVERED,
    ]);
  });
});

test.describe('Admin order tracking', () => {
  test('lists orders of every status for the admin with their current status', async ({ world }) => {
    test.slow();
    const admin = await world.admin();
    const owners = [await world.newCustomer(), await world.newCustomer()];
    const placed: { code: string; status: OrderStatusName }[] = [];
    for (const [index, status] of ALL_ORDER_STATUSES.entries()) {
      const { code } = await world.orderAt(status, {}, owners[index % owners.length]);
      placed.push({ code, status });
    }
    await openTrackingList(admin);
    for (const { code, status } of placed) {
      await expect(trackingRow(admin, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(status);
    }
  });

  test('shows the new status in the admin list after a shipper changes an order', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    await world.pickUp(code);
    await expectTrackedStatus(await world.admin(), code, ORDER_STATUS.DELIVERING);
  });
});

test.describe('Order no longer waiting for confirmation', () => {
  test('refuses the second admin who assigns an order that was already assigned', async ({ world }) => {
    const { code } = await placeFor(world);
    const first = await world.admin();
    const second = await world.secondAdmin();
    await openAssignmentList(first);
    await openAssignmentList(second);
    const firstDialog = await chooseShipperForOrder(first, code, 'primary');
    const secondDialog = await chooseShipperForOrder(second, code, 'secondary');
    await saveAssignment(firstDialog);
    await pressSaveAssignment(secondDialog);
    await expect(second.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await openAdminOrder(first, code);
    await expectOrderStatus(first, ORDER_STATUS.AWAITING_PICKUP);
  });
});

test.describe('Connection lost while tracking', () => {
  test('shows the latest status after the customer reconnects', async ({ world }) => {
    await expectStatusAfterReconnect(
      world,
      ORDER_STATUS.DELIVERING,
      (code) => world.pickUp(code),
      ORDER_STATUS.AWAITING_PICKUP,
    );
  });

  test('shows the final status after several changes made while the customer was offline', async ({ world }) => {
    await expectStatusAfterReconnect(
      world,
      ORDER_STATUS.DELIVERED,
      async (code) => {
        await world.pickUp(code);
        await world.deliver(code);
      },
      ORDER_STATUS.AWAITING_PICKUP,
    );
  });

  test('keeps the same status after reconnecting when nothing changed', async ({ world }) => {
    await expectStatusAfterReconnect(world, ORDER_STATUS.DELIVERING, async () => undefined, ORDER_STATUS.DELIVERING);
  });
});
