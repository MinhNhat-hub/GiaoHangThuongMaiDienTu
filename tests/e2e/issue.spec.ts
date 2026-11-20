import { TEST_IDS } from '../../src/constants/test-ids';
import {
  expectAdminOrderStatus,
  expectLatestHistoryEntry,
  expectNextStatusChoices,
  expectOrderStatus,
  expectShipmentStatus,
  expectTrackedStatus,
  openAdminOrder,
  openOrderByCode,
  openShipperHistory,
} from './helpers/flows';
import {
  abandonIncidentReport,
  adminConfirmLost,
  adminConfirmReturnedGoods,
  expectConfirmLostUnavailable,
  expectIncidentFields,
  expectIncidentReportBlocked,
  issueRows,
  moveIssueOrderToReturning,
  openIssue,
  openIssuesList,
  readIncidentTypeOptions,
  readIssueCode,
  resolveAllIssues,
  saveIssueResult,
  submitIssueResult,
} from './helpers/issue-flows';
import { emailOf } from './helpers/session';
import { repeatChar } from './helpers/data';
import {
  FAILED_DELIVERY_LIMIT,
  INCIDENT_TYPE,
  LONG_SCENARIO_TIMEOUT_MS,
  ISOLATED_TAG,
  MAX_FREE_TEXT_LENGTH,
  ORDER_STATUS,
} from './helpers/constants';
import { ABSENCE_IDS } from './helpers/absence-ids';
import { expect, test, World } from './helpers/world';

test.describe.configure({ timeout: LONG_SCENARIO_TIMEOUT_MS });

async function deliveringOrder(world: World, failedDeliveries = 0): Promise<string> {
  const { code } = await world.orderAt(ORDER_STATUS.DELIVERING, { failedDeliveries });
  return code;
}

async function expectStoredIncident(world: World, code: string, type: string): Promise<void> {
  const row = await openIssue(await world.admin(), code, type);
  await expectIncidentFields(row, type, emailOf('Shipper'));
}

async function expectIncidentCount(world: World, code: string, type: string, count: number): Promise<void> {
  const admin = await world.admin();
  await openIssuesList(admin);
  await expect(issueRows(admin, code, type)).toHaveCount(count);
}

async function reportAndExpectStatus(world: World, type: string, status: string): Promise<string> {
  const code = await deliveringOrder(world);
  await world.report(code, type);
  await expectShipmentStatus(await world.shipperA(), code, status);
  return code;
}

async function reportAndExpectHistory(world: World, type: string, newStatus: string): Promise<void> {
  const code = await deliveringOrder(world);
  await world.report(code, type);
  const shipperA = await world.shipperA();
  await openShipperHistory(shipperA, code);
  await expectLatestHistoryEntry(shipperA, {
    actorEmail: emailOf('Shipper'),
    oldStatus: ORDER_STATUS.DELIVERING,
    newStatus,
  });
}

async function resultSavedFor(world: World, code: string, type: string, result: string): Promise<void> {
  const admin = await world.admin();
  const row = await openIssue(admin, code, type);
  await saveIssueResult(row, result);
}

type RefusalSign = 'field-error' | 'banner';

async function expectResultRefused(
  world: World,
  code: string,
  type: string,
  result: string,
  sign: RefusalSign = 'banner',
): Promise<void> {
  const admin = await world.admin();
  const row = await openIssue(admin, code, type);
  await submitIssueResult(row, result);
  const refusal =
    sign === 'field-error'
      ? row.getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_ERROR)
      : admin.getByTestId(TEST_IDS.COMMON.ERROR_BANNER);
  await expect(refusal).toBeVisible();
  await openIssuesList(admin);
  await expect(issueRows(admin, code, type)).toHaveCount(1);
  await expect(issueRows(admin, code, type).getByTestId(TEST_IDS.ADMIN.ISSUE_RESULT_TEXT)).toHaveCount(0);
}

test.describe('Shipper incident reports', () => {
  test('offers exactly three incident types to the assigned shipper', async ({ world }) => {
    const code = await deliveringOrder(world);
    const labels = await readIncidentTypeOptions(await world.shipperA(), code);
    expect([...labels].sort()).toEqual([INCIDENT_TYPE.DAMAGED, INCIDENT_TYPE.FAILED_DELIVERY, INCIDENT_TYPE.LOST].sort());
  });

  test('blocks incident reports for an order waiting for pickup', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    await expectIncidentReportBlocked(await world.shipperA(), await world.admin(), code, ORDER_STATUS.AWAITING_PICKUP);
  });

  test('blocks incident reports for an order with a failed delivery', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY);
    await expectIncidentReportBlocked(await world.shipperA(), await world.admin(), code, ORDER_STATUS.FAILED_DELIVERY);
  });

  test('blocks incident reports for a delivered order', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await expectIncidentReportBlocked(await world.shipperA(), await world.admin(), code, ORDER_STATUS.DELIVERED);
  });

  test('stores a damaged-goods incident with order, type, reporter and time', async ({ world }) => {
    const code = await deliveringOrder(world);
    await world.report(code, INCIDENT_TYPE.DAMAGED);
    await expectStoredIncident(world, code, INCIDENT_TYPE.DAMAGED);
  });

  test('stores a failed-delivery incident with order, type, reporter and time', async ({ world }) => {
    const code = await deliveringOrder(world);
    await world.report(code, INCIDENT_TYPE.FAILED_DELIVERY);
    await expectStoredIncident(world, code, INCIDENT_TYPE.FAILED_DELIVERY);
  });

  test('stores a lost-goods incident with order, type, reporter and time', async ({ world }) => {
    const code = await deliveringOrder(world);
    await world.report(code, INCIDENT_TYPE.LOST);
    await expectStoredIncident(world, code, INCIDENT_TYPE.LOST);
  });

  test('gives incidents on two different orders different incident codes', async ({ world }) => {
    const first = await deliveringOrder(world);
    const second = await deliveringOrder(world);
    await world.report(first, INCIDENT_TYPE.DAMAGED);
    await world.report(second, INCIDENT_TYPE.FAILED_DELIVERY);
    const admin = await world.admin();
    const firstCode = await readIssueCode(await openIssue(admin, first, INCIDENT_TYPE.DAMAGED));
    const secondCode = await readIssueCode(await openIssue(admin, second, INCIDENT_TYPE.FAILED_DELIVERY));
    expect(secondCode).not.toBe(firstCode);
    await expect(issueRows(admin, first)).toHaveCount(1);
    await expect(issueRows(admin, second)).toHaveCount(1);
  });

  test('counts failed deliveries per order including a repeated incident', async ({ world }) => {
    const code = await deliveringOrder(world, 1);
    await world.report(code, INCIDENT_TYPE.FAILED_DELIVERY);
    await expectIncidentCount(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 2);
  });

  test('moves a delivering order to damaged when damaged goods are reported', async ({ world }) => {
    await reportAndExpectStatus(world, INCIDENT_TYPE.DAMAGED, ORDER_STATUS.DAMAGED);
  });

  test('moves a delivering order to failed delivery when a failed delivery is reported', async ({ world }) => {
    await reportAndExpectStatus(world, INCIDENT_TYPE.FAILED_DELIVERY, ORDER_STATUS.FAILED_DELIVERY);
  });

  test('moves a delivering order to lost when lost goods are reported', async ({ world }) => {
    await reportAndExpectStatus(world, INCIDENT_TYPE.LOST, ORDER_STATUS.LOST);
  });
});

test.describe('Damaged goods during delivery', () => {
  test('saves the incident and moves the order to damaged when the shipper confirms damaged goods', async ({ world }) => {
    const code = await reportAndExpectStatus(world, INCIDENT_TYPE.DAMAGED, ORDER_STATUS.DAMAGED);
    await expectStoredIncident(world, code, INCIDENT_TYPE.DAMAGED);
  });

  test('records a shipper history entry when damaged goods are reported', async ({ world }) => {
    await reportAndExpectHistory(world, INCIDENT_TYPE.DAMAGED, ORDER_STATUS.DAMAGED);
  });

  test('changes nothing when the shipper does not confirm a damaged-goods report', async ({ world }) => {
    const code = await deliveringOrder(world);
    const shipperA = await world.shipperA();
    await abandonIncidentReport(shipperA, code, INCIDENT_TYPE.DAMAGED);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERING);
    await expectIncidentCount(world, code, INCIDENT_TYPE.DAMAGED, 0);
  });
});

test.describe('Failed delivery', () => {
  test('counts the first failed delivery and keeps redelivery possible', async ({ world }) => {
    const code = await deliveringOrder(world);
    await world.report(code, INCIDENT_TYPE.FAILED_DELIVERY);
    const shipperA = await world.shipperA();
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.FAILED_DELIVERY);
    await expectIncidentCount(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 1);
    await expectNextStatusChoices(shipperA, code, { pickup: true, deliver: false });
  });

  test('counts the second failed delivery and keeps redelivery possible', async ({ world }) => {
    const code = await deliveringOrder(world, 1);
    await world.report(code, INCIDENT_TYPE.FAILED_DELIVERY);
    const shipperA = await world.shipperA();
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.FAILED_DELIVERY);
    await expectIncidentCount(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 2);
    await expectNextStatusChoices(shipperA, code, { pickup: true, deliver: false });
  });

  test('counts the third failed delivery and reaches the redelivery limit', async ({ world }) => {
    const code = await deliveringOrder(world, FAILED_DELIVERY_LIMIT - 1);
    await world.report(code, INCIDENT_TYPE.FAILED_DELIVERY);
    const shipperA = await world.shipperA();
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.FAILED_DELIVERY);
    await expectIncidentCount(world, code, INCIDENT_TYPE.FAILED_DELIVERY, FAILED_DELIVERY_LIMIT);
    await expectNextStatusChoices(shipperA, code, { pickup: false, deliver: false });
  });

  test('records a shipper history entry when a failed delivery is reported', async ({ world }) => {
    await reportAndExpectHistory(world, INCIDENT_TYPE.FAILED_DELIVERY, ORDER_STATUS.FAILED_DELIVERY);
  });

  test('changes nothing when the shipper does not confirm a failed-delivery report', async ({ world }) => {
    const code = await deliveringOrder(world);
    const shipperA = await world.shipperA();
    await abandonIncidentReport(shipperA, code, INCIDENT_TYPE.FAILED_DELIVERY);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERING);
    await expectIncidentCount(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 0);
  });
});

test.describe('Lost goods', () => {
  test('saves the incident and moves the order to lost when the shipper confirms lost goods', async ({ world }) => {
    const code = await reportAndExpectStatus(world, INCIDENT_TYPE.LOST, ORDER_STATUS.LOST);
    await expectStoredIncident(world, code, INCIDENT_TYPE.LOST);
  });

  test('records a shipper history entry when lost goods are reported', async ({ world }) => {
    await reportAndExpectHistory(world, INCIDENT_TYPE.LOST, ORDER_STATUS.LOST);
  });

  test('changes nothing when the shipper does not confirm a lost-goods report', async ({ world }) => {
    const code = await deliveringOrder(world);
    const shipperA = await world.shipperA();
    await abandonIncidentReport(shipperA, code, INCIDENT_TYPE.LOST);
    await expectShipmentStatus(shipperA, code, ORDER_STATUS.DELIVERING);
    await expectIncidentCount(world, code, INCIDENT_TYPE.LOST, 0);
  });
});

test.describe('Admin incident handling', () => {
  test('lists a newly reported incident among the unresolved incidents', async ({ world }) => {
    const code = await deliveringOrder(world);
    await world.report(code, INCIDENT_TYPE.DAMAGED);
    await expectIncidentCount(world, code, INCIDENT_TYPE.DAMAGED, 1);
  });

  test('lists three unresolved incidents of different types', async ({ world }) => {
    const reported = [
      { code: await deliveringOrder(world), type: INCIDENT_TYPE.DAMAGED },
      { code: await deliveringOrder(world), type: INCIDENT_TYPE.FAILED_DELIVERY },
      { code: await deliveringOrder(world), type: INCIDENT_TYPE.LOST },
    ];
    for (const { code, type } of reported) {
      await world.report(code, type);
    }
    const admin = await world.admin();
    await openIssuesList(admin);
    for (const { code, type } of reported) {
      await expect(issueRows(admin, code, type)).toHaveCount(1);
    }
  });

  test('removes a resolved incident from the unresolved list', async ({ world }) => {
    const damaged = await deliveringOrder(world);
    const lost = await deliveringOrder(world);
    await world.report(damaged, INCIDENT_TYPE.DAMAGED);
    await world.report(lost, INCIDENT_TYPE.LOST);
    const admin = await world.admin();
    await saveIssueResult(await openIssue(admin, damaged, INCIDENT_TYPE.DAMAGED), 'A');
    await openIssuesList(admin);
    await expect(issueRows(admin, damaged, INCIDENT_TYPE.DAMAGED)).toHaveCount(0);
    await expect(issueRows(admin, lost, INCIDENT_TYPE.LOST)).toHaveCount(1);
  });

  test('shows an empty unresolved list when every incident has a result', { tag: ISOLATED_TAG }, async ({ world }) => {
    const admin = await world.admin();
    await resolveAllIssues(admin, 'A');
    await openIssuesList(admin);
    await expect(admin.getByTestId(TEST_IDS.ADMIN.ISSUES_LIST).getByTestId(TEST_IDS.ADMIN.ISSUE_ITEM)).toHaveCount(0);
  });

  test('lists the lost incident confirmed by the admin among the unresolved incidents', async ({ world }) => {
    const code = await deliveringOrder(world);
    const admin = await world.admin();
    await adminConfirmLost(admin, code);
    const row = await openIssue(admin, code, INCIDENT_TYPE.LOST);
    await expectIncidentFields(row, INCIDENT_TYPE.LOST, emailOf('Admin'));
  });

  test('moves an order with enough failed deliveries to returning', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: FAILED_DELIVERY_LIMIT });
    const admin = await world.admin();
    await moveIssueOrderToReturning(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY));
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.RETURNING);
  });

  test('records an admin history entry when an order moves to returning', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: FAILED_DELIVERY_LIMIT });
    const admin = await world.admin();
    await moveIssueOrderToReturning(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY));
    await openAdminOrder(admin, code);
    await expectLatestHistoryEntry(admin, {
      actorEmail: emailOf('Admin'),
      oldStatus: ORDER_STATUS.FAILED_DELIVERY,
      newStatus: ORDER_STATUS.RETURNING,
    });
  });

  test('moves a returning order to returned to seller when the admin confirms receipt', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.RETURNING);
    await adminConfirmReturnedGoods(await world.admin(), code);
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.RETURNED_TO_SELLER);
  });

  test('records an admin history entry when the returned goods are received', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.RETURNING);
    const admin = await world.admin();
    await adminConfirmReturnedGoods(admin, code);
    await openAdminOrder(admin, code);
    await expectLatestHistoryEntry(admin, {
      actorEmail: emailOf('Admin'),
      oldStatus: ORDER_STATUS.RETURNING,
      newStatus: ORDER_STATUS.RETURNED_TO_SELLER,
    });
  });

  test('keeps the order returning when the admin does not confirm receipt', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.RETURNING);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expect(admin.getByTestId(TEST_IDS.ADMIN.CONFIRM_RETURNED_BUTTON)).toBeVisible();
    await expectTrackedStatus(admin, code, ORDER_STATUS.RETURNING);
  });

  test('lets the admin confirm lost goods for a delivering order', async ({ world }) => {
    const code = await deliveringOrder(world);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expect(admin.getByTestId(TEST_IDS.ADMIN.CONFIRM_LOST_BUTTON)).toBeEnabled();
    await admin.getByTestId(TEST_IDS.ADMIN.CONFIRM_LOST_BUTTON).click();
    await expectIncidentCount(world, code, INCIDENT_TYPE.LOST, 1);
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.LOST);
  });

  test('does not let the admin confirm lost goods for a delivered order', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    await expectConfirmLostUnavailable(admin);
    await expectOrderStatus(admin, ORDER_STATUS.DELIVERED);
  });

  test('records the admin as reporter of a lost incident they confirm', async ({ world }) => {
    const code = await deliveringOrder(world);
    await adminConfirmLost(await world.admin(), code);
    const row = await openIssue(await world.admin(), code, INCIDENT_TYPE.LOST);
    await expectIncidentFields(row, INCIDENT_TYPE.LOST, emailOf('Admin'));
  });

  test('records the second admin as reporter and gives a different incident code', async ({ world }) => {
    const first = await deliveringOrder(world);
    const second = await deliveringOrder(world);
    await adminConfirmLost(await world.admin(), first);
    const secondAdmin = await world.secondAdmin();
    await adminConfirmLost(secondAdmin, second);
    const secondRow = await openIssue(secondAdmin, second, INCIDENT_TYPE.LOST);
    await expectIncidentFields(secondRow, INCIDENT_TYPE.LOST, emailOf('Admin', 'secondary'));
    const secondCode = await readIssueCode(secondRow);
    const firstCode = await readIssueCode(await openIssue(secondAdmin, first, INCIDENT_TYPE.LOST));
    expect(secondCode).not.toBe(firstCode);
  });

  test('tells the admin reporter from the shipper reporter on lost incidents', async ({ world }) => {
    const adminOrder = await deliveringOrder(world);
    const shipperOrder = await deliveringOrder(world);
    await adminConfirmLost(await world.admin(), adminOrder);
    await world.report(shipperOrder, INCIDENT_TYPE.LOST);
    const admin = await world.admin();
    await expectIncidentFields(await openIssue(admin, adminOrder, INCIDENT_TYPE.LOST), INCIDENT_TYPE.LOST, emailOf('Admin'));
    await expectIncidentFields(await openIssue(admin, shipperOrder, INCIDENT_TYPE.LOST), INCIDENT_TYPE.LOST, emailOf('Shipper'));
  });

  test('moves a delivering order to lost when the admin confirms it', async ({ world }) => {
    const code = await deliveringOrder(world);
    await adminConfirmLost(await world.admin(), code);
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.LOST);
  });

  test('shows the customer the lost status and an admin history entry', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    await adminConfirmLost(await world.admin(), code);
    await openOrderByCode(customer.page, code);
    await expectOrderStatus(customer.page, ORDER_STATUS.LOST);
    await expectLatestHistoryEntry(customer.page, {
      actorEmail: emailOf('Admin'),
      oldStatus: ORDER_STATUS.DELIVERING,
      newStatus: ORDER_STATUS.LOST,
    });
  });

  test('saves a resolution result for a damaged-goods incident and removes it from the list', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DAMAGED);
    const admin = await world.admin();
    await saveIssueResult(await openIssue(admin, code, INCIDENT_TYPE.DAMAGED), 'A');
    await expect(admin.getByTestId(ABSENCE_IDS.MONEY_FIELD)).toHaveCount(0);
    await openIssuesList(admin);
    await expect(issueRows(admin, code, INCIDENT_TYPE.DAMAGED)).toHaveCount(0);
  });

  test('saves a resolution result of 500 characters unchanged', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DAMAGED);
    await resultSavedFor(world, code, INCIDENT_TYPE.DAMAGED, repeatChar('a', MAX_FREE_TEXT_LENGTH));
    await expect((await world.admin()).getByTestId(ABSENCE_IDS.MONEY_FIELD)).toHaveCount(0);
  });

  test('refuses an empty resolution result', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DAMAGED);
    await expectResultRefused(world, code, INCIDENT_TYPE.DAMAGED, '', 'field-error');
  });

  test('treats a whitespace-only resolution result as empty', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DAMAGED);
    await expectResultRefused(world, code, INCIDENT_TYPE.DAMAGED, repeatChar(' ', 3), 'field-error');
  });

  test('refuses a resolution result longer than 500 characters', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DAMAGED);
    await expectResultRefused(world, code, INCIDENT_TYPE.DAMAGED, repeatChar('a', MAX_FREE_TEXT_LENGTH + 1), 'field-error');
  });

  test('saves a result for a lost-goods incident reported by a shipper without changing the order status', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.LOST);
    await resultSavedFor(world, code, INCIDENT_TYPE.LOST, 'A');
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.LOST);
  });

  test('saves a result for a lost-goods incident confirmed by the admin and removes it from the list', async ({ world }) => {
    const code = await deliveringOrder(world);
    const admin = await world.admin();
    await adminConfirmLost(admin, code);
    await saveIssueResult(await openIssue(admin, code, INCIDENT_TYPE.LOST), 'A');
    await openIssuesList(admin);
    await expect(issueRows(admin, code, INCIDENT_TYPE.LOST)).toHaveCount(0);
  });

  test('refuses a result for a failed-delivery incident of an order that has not moved to returning', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: FAILED_DELIVERY_LIMIT });
    await expectResultRefused(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 'A');
  });

  test('saves a result after the order moves to returning', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: FAILED_DELIVERY_LIMIT });
    const admin = await world.admin();
    await moveIssueOrderToReturning(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY));
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.RETURNING);
    await saveIssueResult(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY), 'A');
    await openIssuesList(admin);
    await expect(issueRows(admin, code, INCIDENT_TYPE.FAILED_DELIVERY)).toHaveCount(FAILED_DELIVERY_LIMIT - 1);
  });

  test('saves a result for a failed-delivery incident while redelivery is still possible', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 2 });
    await resultSavedFor(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 'A');
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.FAILED_DELIVERY);
  });

  test('saves a result for a failed-delivery incident after the shipper redelivered', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING, { failedDeliveries: 1 });
    await resultSavedFor(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 'A');
  });

  test('saves a result for a failed-delivery incident after the goods were received back', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.RETURNED_TO_SELLER);
    await resultSavedFor(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 'A');
  });
});

test.describe('Return requested before enough failed deliveries', () => {
  test('refuses moving to returning from the incident when there are fewer than three failed deliveries', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 2 });
    const admin = await world.admin();
    await moveIssueOrderToReturning(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY));
    await expect(admin.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.FAILED_DELIVERY);
  });

  test('saves a result after the early return move was refused', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: 2 });
    const admin = await world.admin();
    await moveIssueOrderToReturning(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY));
    await expect(admin.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await resultSavedFor(world, code, INCIDENT_TYPE.FAILED_DELIVERY, 'A');
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.FAILED_DELIVERY);
  });

  test('moves the order to returning once three failed deliveries are reached', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: FAILED_DELIVERY_LIMIT });
    const admin = await world.admin();
    await moveIssueOrderToReturning(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY));
    await expect(admin.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toHaveCount(0);
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.RETURNING);
  });
});
