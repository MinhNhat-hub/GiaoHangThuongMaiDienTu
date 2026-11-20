import type { Page } from '@playwright/test';
import { TEST_IDS } from '../../src/constants/test-ids';
import {
  APP_PATHS,
  assignmentRow,
  createOrder,
  openAdminOrder,
  openAssignedList,
  openAssignmentList,
  openOrderByCode,
  openOrderCreation,
  shipmentCardByCode,
  SHIPPER_ACTION_IDS,
} from './helpers/flows';
import {
  adminConfirmLost,
  adminConfirmReturnedGoods,
  adminMoveToReturning,
  expectIncidentReportUnavailable,
  openIssue,
  saveIssueResult,
} from './helpers/issue-flows';
import {
  approveReturn,
  completeReturn,
  expectMyReturn,
  openReturnForm,
  openReview,
  rejectReturn,
  requestReturn,
  submitReturnForm,
} from './helpers/return-flows';
import {
  FAILED_DELIVERY_LIMIT,
  INCIDENT_TYPE,
  LONG_SCENARIO_TIMEOUT_MS,
  ORDER_STATUS,
  RETURN_REASON,
  RETURN_STATUS,
  SHORT_TEXT,
} from './helpers/constants';
import { ABSENCE_IDS } from './helpers/absence-ids';
import { expectNoElements, expectNoMoneyHandling } from './helpers/nfr-flows';
import { type Actor, advance, expectLifecycle, type LifecycleStep } from './helpers/lifecycle';
import { type Customer, expect, test, World } from './helpers/world';

test.describe.configure({ timeout: LONG_SCENARIO_TIMEOUT_MS });

interface AllowedAdminControls {
  confirmLost?: boolean;
  confirmReturned?: boolean;
}

async function expectAdminOrderControls(admin: Page, code: string, allowed: AllowedAdminControls): Promise<void> {
  await openAdminOrder(admin, code);
  await expect(admin.getByTestId(TEST_IDS.ADMIN.CONFIRM_LOST_BUTTON)).toHaveCount(allowed.confirmLost === true ? 1 : 0);
  await expect(admin.getByTestId(TEST_IDS.ADMIN.CONFIRM_RETURNED_BUTTON)).toHaveCount(allowed.confirmReturned === true ? 1 : 0);
  await expectNoElements(admin, [ABSENCE_IDS.STATUS_CHANGE_CONTROL, ...SHIPPER_ACTION_IDS]);
}

async function expectNoShipperChoices(shipper: Page, code: string): Promise<void> {
  await openAssignedList(shipper);
  const card = shipmentCardByCode(shipper, code);
  for (const testId of SHIPPER_ACTION_IDS) {
    await expect(card.getByTestId(testId)).toHaveCount(0);
  }
}

async function expectNoStatusChangeForAnyRole(world: World, customer: Customer, code: string): Promise<void> {
  await expectAdminOrderControls(await world.admin(), code, {});
  await expectNoShipperChoices(await world.shipperA(), code);
  await openOrderByCode(customer.page, code);
  await expectNoElements(customer.page, [
    ABSENCE_IDS.STATUS_CHANGE_CONTROL,
    TEST_IDS.ORDER.REQUEST_RETURN_BUTTON,
  ]);
}

function step(oldStatus: string, newStatus: string, actor: Actor): LifecycleStep {
  return { oldStatus, newStatus, actor };
}

async function startLifecycle(world: World): Promise<{ customer: Customer; code: string; steps: LifecycleStep[] }> {
  const customer = await world.newCustomer();
  const code = await world.placeOrder(customer);
  const steps = [step('', ORDER_STATUS.PENDING, 'Customer')];
  await expectLifecycle(customer, code, steps);
  return { customer, code, steps };
}

async function runUntilDelivering(world: World, customer: Customer, code: string, steps: LifecycleStep[]): Promise<void> {
  await advance(customer, code, steps, step(ORDER_STATUS.PENDING, ORDER_STATUS.AWAITING_PICKUP, 'Admin'), () => world.assign(code));
  await advance(customer, code, steps, step(ORDER_STATUS.AWAITING_PICKUP, ORDER_STATUS.DELIVERING, 'Shipper'), () => world.pickUp(code));
}

async function runFailedDelivery(world: World, customer: Customer, code: string, steps: LifecycleStep[]): Promise<void> {
  await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.FAILED_DELIVERY, 'Shipper'), () =>
    world.report(code, INCIDENT_TYPE.FAILED_DELIVERY),
  );
}

async function runRedelivery(world: World, customer: Customer, code: string, steps: LifecycleStep[]): Promise<void> {
  await advance(customer, code, steps, step(ORDER_STATUS.FAILED_DELIVERY, ORDER_STATUS.DELIVERING, 'Shipper'), () => world.pickUp(code));
}

test.describe('Order status transition matrix', () => {
  test('offers no way to create an order in a status other than waiting for confirmation', async ({ world }) => {
    const customer = await world.newCustomer();
    await openOrderCreation(customer.page);
    await expectNoElements(customer.page, [ABSENCE_IDS.ORDER_STATUS_SELECT]);
    await customer.page.goto(APP_PATHS.customerHome);
    const code = await createOrder(customer.page);
    await expectLifecycle(customer, code, [step('', ORDER_STATUS.PENDING, 'Customer')]);
  });

  test('offers the admin only assignment for an order waiting for confirmation', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.PENDING);
    const admin = await world.admin();
    await openAssignmentList(admin);
    await expect(assignmentRow(admin, code).getByTestId(TEST_IDS.ADMIN.ASSIGN_BUTTON)).toHaveCount(1);
    await expectAdminOrderControls(admin, code, {});
  });

  test('offers the admin no status change for an order waiting for pickup', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.AWAITING_PICKUP);
    const admin = await world.admin();
    await openAssignmentList(admin);
    await expect(assignmentRow(admin, code)).toHaveCount(0);
    await expectAdminOrderControls(admin, code, {});
  });

  test('offers the admin only lost confirmation for a delivering order', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    await expectAdminOrderControls(await world.admin(), code, { confirmLost: true });
  });

  test('offers the admin only the return-driven moves for a delivered order', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await requestReturn(customer.page, code, RETURN_REASON.DEFECTIVE, SHORT_TEXT);
    const admin = await world.admin();
    await expectAdminOrderControls(admin, code, {});
    const row = await openReview(admin, code);
    await expect(row.getByTestId(TEST_IDS.ADMIN.APPROVE_RETURN_BUTTON)).toHaveCount(1);
    await expect(row.getByTestId(TEST_IDS.ADMIN.REJECT_RETURN_BUTTON)).toHaveCount(1);
  });

  test('offers the admin only the returning move for a failed delivery with enough attempts', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.FAILED_DELIVERY, { failedDeliveries: FAILED_DELIVERY_LIMIT });
    const admin = await world.admin();
    const row = await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY);
    await expect(row.getByTestId(TEST_IDS.ADMIN.ISSUE_RETURN_BUTTON)).toHaveCount(1);
    await expectAdminOrderControls(admin, code, {});
    await expectNoShipperChoices(await world.shipperA(), code);
  });

  test('offers only receipt confirmation for a returning order', async ({ world }) => {
    const { code } = await world.orderAt(ORDER_STATUS.RETURNING);
    await expectAdminOrderControls(await world.admin(), code, { confirmReturned: true });
    await expectNoShipperChoices(await world.shipperA(), code);
  });

  test('offers no status change for an order returned to the seller', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.RETURNED_TO_SELLER);
    await expectNoStatusChangeForAnyRole(world, customer, code);
  });

  test('offers no status change for a damaged order', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DAMAGED);
    await expectNoStatusChangeForAnyRole(world, customer, code);
  });

  test('offers no status change for a lost order', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.LOST);
    await expectNoStatusChangeForAnyRole(world, customer, code);
  });
});

test.describe('Return request status matrix', () => {
  test('offers no way to create a return request in a status other than pending review', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
    await expectNoElements(customer.page, [ABSENCE_IDS.RETURN_STATUS_SELECT]);
    await submitReturnForm(customer.page, RETURN_REASON.OTHER, SHORT_TEXT);
    await expect(customer.page.getByTestId(TEST_IDS.RETURN.SUCCESS_MESSAGE)).toBeVisible();
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
  });
});

test.describe('Order and return request lifecycles', () => {
  test('follows the delivered lifecycle with history after each step', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.DELIVERED, 'Shipper'), () => world.deliver(code));
    await expectNoMoneyHandling(await world.admin());
  });

  test('follows the redelivery lifecycle that ends delivered', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await runFailedDelivery(world, customer, code, steps);
    await runRedelivery(world, customer, code, steps);
    await runFailedDelivery(world, customer, code, steps);
    await runRedelivery(world, customer, code, steps);
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.DELIVERED, 'Shipper'), () => world.deliver(code));
    await expectNoMoneyHandling(await world.admin());
  });

  test('follows the lifecycle that ends returned to the seller', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await runFailedDelivery(world, customer, code, steps);
    await runRedelivery(world, customer, code, steps);
    await runFailedDelivery(world, customer, code, steps);
    await runRedelivery(world, customer, code, steps);
    await runFailedDelivery(world, customer, code, steps);
    await expectNoShipperChoices(await world.shipperA(), code);
    const admin = await world.admin();
    await advance(customer, code, steps, step(ORDER_STATUS.FAILED_DELIVERY, ORDER_STATUS.RETURNING, 'Admin'), () =>
      adminMoveToReturning(admin, code),
    );
    await advance(customer, code, steps, null, async () => {
      await saveIssueResult(await openIssue(admin, code, INCIDENT_TYPE.FAILED_DELIVERY), SHORT_TEXT);
    });
    await advance(customer, code, steps, step(ORDER_STATUS.RETURNING, ORDER_STATUS.RETURNED_TO_SELLER, 'Admin'), () =>
      adminConfirmReturnedGoods(admin, code),
    );
    await expectNoMoneyHandling(admin);
  });

  test('follows the lifecycle that ends damaged by a shipper report', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.DAMAGED, 'Shipper'), () =>
      world.report(code, INCIDENT_TYPE.DAMAGED),
    );
    await expectNoShipperChoices(await world.shipperA(), code);
    await expectIncidentReportUnavailable(await world.shipperA(), code);
    await expectAdminOrderControls(await world.admin(), code, {});
  });

  test('follows the lifecycle that ends lost by a shipper report', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.LOST, 'Shipper'), () =>
      world.report(code, INCIDENT_TYPE.LOST),
    );
    await expectNoShipperChoices(await world.shipperA(), code);
    await expectIncidentReportUnavailable(await world.shipperA(), code);
    await expectAdminOrderControls(await world.admin(), code, {});
  });

  test('follows the lifecycle that ends lost by an admin confirmation', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    const admin = await world.admin();
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.LOST, 'Admin'), () => adminConfirmLost(admin, code));
    await expectNoShipperChoices(await world.shipperA(), code);
    await expectAdminOrderControls(admin, code, {});
  });

  test('follows the return lifecycle for the defective reason', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.DELIVERED, 'Shipper'), () => world.deliver(code));
    const admin = await world.admin();
    await advance(customer, code, steps, null, () => requestReturn(customer.page, code, RETURN_REASON.DEFECTIVE, SHORT_TEXT));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERED, ORDER_STATUS.DAMAGED, 'Admin'), () => approveReturn(admin, code));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.APPROVED });
    await advance(customer, code, steps, null, () => completeReturn(admin, code));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.COMPLETED });
    await expectNoMoneyHandling(admin);
  });

  test('follows the return lifecycle for the not-received reason', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.DELIVERED, 'Shipper'), () => world.deliver(code));
    const admin = await world.admin();
    await advance(customer, code, steps, null, () => requestReturn(customer.page, code, RETURN_REASON.NOT_RECEIVED, SHORT_TEXT));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERED, ORDER_STATUS.LOST, 'Admin'), () => approveReturn(admin, code));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.APPROVED });
    await advance(customer, code, steps, null, () => completeReturn(admin, code));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.COMPLETED });
    await expectNoMoneyHandling(admin);
  });

  test('follows the return lifecycle that ends with a rejected request', async ({ world }) => {
    test.slow();
    const { customer, code, steps } = await startLifecycle(world);
    await runUntilDelivering(world, customer, code, steps);
    await advance(customer, code, steps, step(ORDER_STATUS.DELIVERING, ORDER_STATUS.DELIVERED, 'Shipper'), () => world.deliver(code));
    const admin = await world.admin();
    await advance(customer, code, steps, null, () => requestReturn(customer.page, code, RETURN_REASON.OTHER, SHORT_TEXT));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
    await advance(customer, code, steps, null, () => rejectReturn(admin, code, SHORT_TEXT));
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.REJECTED, rejectReason: SHORT_TEXT });
  });
});
