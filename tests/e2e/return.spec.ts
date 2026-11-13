import type { Page } from '@playwright/test';
import { TEST_IDS } from '../../src/constants/test-ids';
import {
  countHistoryEntries,
  expectAdminOrderStatus,
  expectLatestHistoryEntry,
  expectListedOrderStatus,
  expectOrderStatus,
  historyEntries,
  openAdminOrder,
  openOrderByCode,
  readOptionLabels,
} from './helpers/flows';
import {
  approveReturn,
  clearReturnReviewList,
  completeReturn,
  expectMyReturn,
  expectMyReturnCount,
  expectNoReturnRequest,
  expectReturnRequestRefused,
  expectReturnSubmitTime,
  expectReviewStatus,
  myReturnRows,
  openMyReturns,
  openReturnForm,
  openReturnRequest,
  openReturnReviewList,
  openReview,
  pressApprove,
  readReturnCode,
  rejectReturn,
  requestReturn,
  reviewRow,
  submitRejection,
  submitReturnForm,
} from './helpers/return-flows';
import { emailOf, loginWithCredentials } from './helpers/session';
import { repeatChar } from './helpers/data';
import {
  ISOLATED_TAG,
  LONG_SCENARIO_TIMEOUT_MS,
  MAX_FREE_TEXT_LENGTH,
  ORDER_STATUS,
  type OrderStatusName,
  RETURN_REASON,
  RETURN_STATUS,
  SHORT_TEXT,
} from './helpers/constants';
import { ABSENCE_IDS, PENDING_TEST_IDS } from './helpers/pending-test-ids';
import { type Customer, type DriveOptions, expect, test, World } from './helpers/world';

test.describe.configure({ timeout: LONG_SCENARIO_TIMEOUT_MS });

async function requestAndApprove(world: World, reason: string, notes: string | null = null): Promise<{ customer: Customer; code: string }> {
  const placed = await world.orderWithReturn(reason, notes);
  await approveReturn(await world.admin(), placed.code);
  return placed;
}

async function requestAndReject(world: World, reason: string, notes: string | null, rejectReason: string): Promise<{ customer: Customer; code: string }> {
  const placed = await world.orderWithReturn(reason, notes);
  await rejectReturn(await world.admin(), placed.code, rejectReason);
  return placed;
}

async function requestApproveAndComplete(world: World, reason: string, notes: string | null = null): Promise<{ customer: Customer; code: string }> {
  const placed = await requestAndApprove(world, reason, notes);
  await completeReturn(await world.admin(), placed.code);
  return placed;
}

async function returnsInEveryStatus(world: World): Promise<{ customer: Customer; codes: Record<string, string> }> {
  const customer = await world.newCustomer();
  const codes: Record<string, string> = {};
  for (const key of ['pending', 'approved', 'rejected', 'completed']) {
    codes[key] = (await world.orderWithReturn(RETURN_REASON.OTHER, SHORT_TEXT, customer)).code;
  }
  const admin = await world.admin();
  await approveReturn(admin, codes.approved);
  await rejectReturn(admin, codes.rejected, 'A');
  await approveReturn(admin, codes.completed);
  await completeReturn(admin, codes.completed);
  return { customer, codes };
}

async function expectRefusedFor(world: World, status: OrderStatusName, options: DriveOptions = {}): Promise<void> {
  const { customer, code } = await world.orderAt(status, options);
  await openReturnRequest(customer.page, code);
  await expectReturnRequestRefused(customer.page);
  await expectNoReturnRequest(customer.page, code);
}

async function expectSecondRequestRefused(page: Page, code: string): Promise<void> {
  await openReturnRequest(page, code);
  await expectReturnRequestRefused(page);
  await expectMyReturnCount(page, code, 1);
}

async function expectInvalidNotes(world: World, reason: string, notes: string | null): Promise<void> {
  const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
  await openReturnForm(customer.page, code);
  await submitReturnForm(customer.page, reason, notes);
  await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.NOTES_ERROR)).toBeVisible();
  await expectNoReturnRequest(customer.page, code);
}

async function expectInvalidRejection(world: World, rejectReason: string): Promise<void> {
  const { code } = await world.orderWithReturn(RETURN_REASON.OTHER, 'A');
  const admin = await world.admin();
  await submitRejection(admin, await openReview(admin, code), rejectReason);
  await expect(admin.getByTestId(PENDING_TEST_IDS.ADMIN.REJECT_REASON_ERROR)).toBeVisible();
  await expectReviewStatus(admin, code, RETURN_STATUS.PENDING);
}

async function expectRejectionKeepsOrderDelivered(world: World, reason: string): Promise<void> {
  const { customer, code } = await requestAndReject(world, reason, reason === RETURN_REASON.OTHER ? 'A' : null, 'A');
  await expectMyReturn(customer.page, code, { status: RETURN_STATUS.REJECTED, rejectReason: 'A' });
  await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.DELIVERED);
}

async function expectApprovalMovesOrder(world: World, reason: string, orderStatus: string): Promise<void> {
  const { code } = await requestAndApprove(world, reason);
  await expectAdminOrderStatus(await world.admin(), code, orderStatus);
}

async function expectApprovalHistory(world: World, reason: string, newStatus: string): Promise<void> {
  const { code } = await requestAndApprove(world, reason);
  const admin = await world.admin();
  await openAdminOrder(admin, code);
  await expectLatestHistoryEntry(admin, {
    actorEmail: emailOf('Admin'),
    oldStatus: ORDER_STATUS.DELIVERED,
    newStatus,
  });
}

async function expectCompletionKeepsOrder(world: World, reason: string, orderStatus: string): Promise<void> {
  const { customer, code } = await requestApproveAndComplete(world, reason);
  await expectMyReturn(customer.page, code, { status: RETURN_STATUS.COMPLETED });
  await expectAdminOrderStatus(await world.admin(), code, orderStatus);
}

test.describe('Customer return requests', () => {
  test('lets a customer request a return for a delivered order of their own', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
  });

  test('offers exactly three return reasons', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
    const labels = await readOptionLabels(customer.page.getByTestId(TEST_IDS.RETURN.REASON_SELECT));
    expect([...labels].sort()).toEqual([RETURN_REASON.DEFECTIVE, RETURN_REASON.NOT_RECEIVED, RETURN_REASON.OTHER].sort());
  });

  test('accepts the defective reason without a description', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING, reason: RETURN_REASON.DEFECTIVE });
  });

  test('accepts the not-received reason without a description', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.NOT_RECEIVED);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING, reason: RETURN_REASON.NOT_RECEIVED });
  });

  test('accepts the other reason with a one-character description', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.OTHER, 'A');
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING, reason: RETURN_REASON.OTHER, notes: 'A' });
  });

  test('accepts the other reason with a description of 500 characters', async ({ world }) => {
    const notes = repeatChar('a', MAX_FREE_TEXT_LENGTH);
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.OTHER, notes);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING, reason: RETURN_REASON.OTHER, notes });
  });

  test('rejects a description longer than 500 characters for the other reason', async ({ world }) => {
    await expectInvalidNotes(world, RETURN_REASON.OTHER, repeatChar('a', MAX_FREE_TEXT_LENGTH + 1));
  });

  test('stores a return request as pending review with a submit time', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const row = await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
    await expectReturnSubmitTime(row);
  });

  test('stores the other reason with a 500-character description unchanged', async ({ world }) => {
    const notes = repeatChar('a', MAX_FREE_TEXT_LENGTH);
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.OTHER, notes);
    const row = await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING, reason: RETURN_REASON.OTHER, notes });
    await expectReturnSubmitTime(row);
  });

  test('keeps the order delivered after a return request is submitted', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    await expectListedOrderStatus(customer.page, code, ORDER_STATUS.DELIVERED);
  });

  test('gives return requests for two different orders different request codes', async ({ world }) => {
    const first = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const second = await world.orderAt(ORDER_STATUS.DELIVERED, {}, first.customer);
    await requestReturn(first.customer.page, second.code, RETURN_REASON.DEFECTIVE);
    const firstRow = await expectMyReturn(first.customer.page, first.code, { status: RETURN_STATUS.PENDING });
    const firstCode = await readReturnCode(firstRow);
    const secondRow = await expectMyReturn(first.customer.page, second.code, { status: RETURN_STATUS.PENDING });
    expect(await readReturnCode(secondRow)).not.toBe(firstCode);
  });
});

test.describe('Customer view of return requests', () => {
  test('shows a pending return request to its customer', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
  });

  test('shows an approved return request status to its customer', async ({ world }) => {
    const { customer, code } = await requestAndApprove(world, RETURN_REASON.OTHER, 'A');
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.APPROVED });
  });

  test('shows a completed return request status to its customer', async ({ world }) => {
    const { customer, code } = await requestApproveAndComplete(world, RETURN_REASON.OTHER, 'A');
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.COMPLETED });
  });

  test('shows a rejected return request with the rejection reason', async ({ world }) => {
    const { customer, code } = await requestAndReject(world, RETURN_REASON.OTHER, 'A', 'A');
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.REJECTED, rejectReason: 'A' });
  });

  test('shows a rejected return request with a rejection reason of 500 characters', async ({ world }) => {
    const rejectReason = repeatChar('a', MAX_FREE_TEXT_LENGTH);
    const { customer, code } = await requestAndReject(world, RETURN_REASON.OTHER, 'A', rejectReason);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.REJECTED, rejectReason });
  });

  test('shows the status of each of four return requests and the reason only on the rejected one', async ({ world }) => {
    test.slow();
    const { customer, codes } = await returnsInEveryStatus(world);
    await expectMyReturn(customer.page, codes.pending, { status: RETURN_STATUS.PENDING });
    await expectMyReturn(customer.page, codes.approved, { status: RETURN_STATUS.APPROVED });
    await expectMyReturn(customer.page, codes.rejected, { status: RETURN_STATUS.REJECTED, rejectReason: 'A' });
    await expectMyReturn(customer.page, codes.completed, { status: RETURN_STATUS.COMPLETED });
    for (const key of ['pending', 'approved', 'completed']) {
      await expect(myReturnRows(customer.page, codes[key]).getByTestId(PENDING_TEST_IDS.RETURN.ITEM_REJECT_REASON)).toHaveCount(0);
    }
  });

  test('shows a customer only their own return requests', async ({ world }) => {
    const own = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const other = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    await expectMyReturnCount(other.customer.page, other.code, 1);
    await expectMyReturnCount(other.customer.page, own.code, 0);
  });

  test('shows an empty return request list to a customer without requests', async ({ world }) => {
    const customer = await world.newCustomer();
    await openMyReturns(customer.page);
    await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.LIST_ITEM)).toHaveCount(0);
  });

  test('shows the approved status when the customer views the request again after approval', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.OTHER, 'A');
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
    await approveReturn(await world.admin(), code);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.APPROVED });
  });
});

test.describe('Admin review of return requests', () => {
  test('lists only pending and approved return requests for the admin', async ({ world }) => {
    test.slow();
    const { codes } = await returnsInEveryStatus(world);
    const admin = await world.admin();
    await openReturnReviewList(admin);
    await expect(reviewRow(admin, codes.pending)).toHaveCount(1);
    await expect(reviewRow(admin, codes.approved)).toHaveCount(1);
    await expect(reviewRow(admin, codes.rejected)).toHaveCount(0);
    await expect(reviewRow(admin, codes.completed)).toHaveCount(0);
  });

  test('shows each pending request with its order and reason', async ({ world }) => {
    const placed = [
      { ...(await world.orderWithReturn(RETURN_REASON.DEFECTIVE)), reason: RETURN_REASON.DEFECTIVE },
      { ...(await world.orderWithReturn(RETURN_REASON.NOT_RECEIVED)), reason: RETURN_REASON.NOT_RECEIVED },
      { ...(await world.orderWithReturn(RETURN_REASON.OTHER, 'A')), reason: RETURN_REASON.OTHER },
    ];
    const admin = await world.admin();
    await openReturnReviewList(admin);
    for (const { code, reason } of placed) {
      await expect(reviewRow(admin, code)).toHaveCount(1);
      await expect(reviewRow(admin, code).getByTestId(PENDING_TEST_IDS.ADMIN.RETURN_REASON)).toHaveText(reason);
    }
  });

  test('lists the pending requests of two customers', async ({ world }) => {
    const first = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const second = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const admin = await world.admin();
    await openReturnReviewList(admin);
    for (const { code } of [first, second]) {
      await expect(reviewRow(admin, code)).toHaveCount(1);
      await expect(reviewRow(admin, code).getByTestId(PENDING_TEST_IDS.ADMIN.RETURN_REASON)).toHaveText(RETURN_REASON.DEFECTIVE);
    }
  });

  test('shows a newly submitted request in the admin list as pending', async ({ world }) => {
    const { code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    await expectReviewStatus(await world.admin(), code, RETURN_STATUS.PENDING);
  });

  test('keeps an approved request in the admin list', async ({ world }) => {
    const { code } = await requestAndApprove(world, RETURN_REASON.OTHER, 'A');
    await expectReviewStatus(await world.admin(), code, RETURN_STATUS.APPROVED);
  });

  test('removes a rejected request from the admin list', async ({ world }) => {
    const { code } = await requestAndReject(world, RETURN_REASON.OTHER, 'A', 'A');
    const admin = await world.admin();
    await openReturnReviewList(admin);
    await expect(reviewRow(admin, code)).toHaveCount(0);
  });

  test('removes a completed request from the admin list', async ({ world }) => {
    const { code } = await requestApproveAndComplete(world, RETURN_REASON.OTHER, 'A');
    const admin = await world.admin();
    await openReturnReviewList(admin);
    await expect(reviewRow(admin, code)).toHaveCount(0);
  });

  test('shows an empty return list to the admin when nothing is pending or approved', { tag: ISOLATED_TAG }, async ({ world }) => {
    const admin = await world.admin();
    await clearReturnReviewList(admin, 'A');
    await openReturnReviewList(admin);
    await expect(admin.getByTestId(PENDING_TEST_IDS.ADMIN.RETURNS_LIST).getByTestId(PENDING_TEST_IDS.ADMIN.RETURN_ITEM)).toHaveCount(0);
  });

  test('approves a pending request whose reason is defective', async ({ world }) => {
    await expectApprovalMovesOrder(world, RETURN_REASON.DEFECTIVE, ORDER_STATUS.DAMAGED);
  });

  test('approves a pending request whose reason is not received', async ({ world }) => {
    await expectApprovalMovesOrder(world, RETURN_REASON.NOT_RECEIVED, ORDER_STATUS.LOST);
  });

  test('approves a pending request whose reason is other', async ({ world }) => {
    await expectApprovalMovesOrder(world, RETURN_REASON.OTHER, ORDER_STATUS.DELIVERED);
  });

  test('rejects a pending request with the entered reason and keeps the order status', async ({ world }) => {
    await expectRejectionKeepsOrderDelivered(world, RETURN_REASON.OTHER);
  });

  test('rejects a pending request with a 500-character rejection reason', async ({ world }) => {
    const rejectReason = repeatChar('a', MAX_FREE_TEXT_LENGTH);
    const { customer, code } = await requestAndReject(world, RETURN_REASON.OTHER, 'A', rejectReason);
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.REJECTED, rejectReason });
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.DELIVERED);
  });

  test('refuses to reject a request without a rejection reason', async ({ world }) => {
    await expectInvalidRejection(world, '');
  });

  test('treats a whitespace-only rejection reason as empty', async ({ world }) => {
    await expectInvalidRejection(world, repeatChar(' ', 3));
  });

  test('refuses a rejection reason longer than 500 characters', async ({ world }) => {
    await expectInvalidRejection(world, repeatChar('a', MAX_FREE_TEXT_LENGTH + 1));
  });

  test('keeps the order delivered when a defective-reason request is rejected', async ({ world }) => {
    await expectRejectionKeepsOrderDelivered(world, RETURN_REASON.DEFECTIVE);
  });

  test('keeps the order delivered when a not-received request is rejected', async ({ world }) => {
    await expectRejectionKeepsOrderDelivered(world, RETURN_REASON.NOT_RECEIVED);
  });

  test('moves the order to damaged when a defective-reason request is approved', async ({ world }) => {
    await expectApprovalMovesOrder(world, RETURN_REASON.DEFECTIVE, ORDER_STATUS.DAMAGED);
  });

  test('moves the order to lost when a not-received request is approved', async ({ world }) => {
    await expectApprovalMovesOrder(world, RETURN_REASON.NOT_RECEIVED, ORDER_STATUS.LOST);
  });

  test('keeps the order delivered when an other-reason request is approved', async ({ world }) => {
    const { code } = await world.orderWithReturn(RETURN_REASON.OTHER, 'A');
    const admin = await world.admin();
    await openAdminOrder(admin, code);
    const before = await countHistoryEntries(admin);
    await approveReturn(admin, code);
    await openAdminOrder(admin, code);
    await expectOrderStatus(admin, ORDER_STATUS.DELIVERED);
    await expect(historyEntries(admin)).toHaveCount(before);
  });

  test('records an admin history entry when approval moves the order to damaged', async ({ world }) => {
    await expectApprovalHistory(world, RETURN_REASON.DEFECTIVE, ORDER_STATUS.DAMAGED);
  });

  test('records an admin history entry when approval moves the order to lost', async ({ world }) => {
    await expectApprovalHistory(world, RETURN_REASON.NOT_RECEIVED, ORDER_STATUS.LOST);
  });

  test('shows the customer the damaged order status after approval', async ({ world }) => {
    const { customer, code } = await requestAndApprove(world, RETURN_REASON.DEFECTIVE);
    await openOrderByCode(customer.page, code);
    await expectOrderStatus(customer.page, ORDER_STATUS.DAMAGED);
  });

  test('completes an approved request with reason other and keeps the order delivered', async ({ world }) => {
    await expectCompletionKeepsOrder(world, RETURN_REASON.OTHER, ORDER_STATUS.DELIVERED);
  });

  test('completes an approved defective-reason request and keeps the order damaged', async ({ world }) => {
    await expectCompletionKeepsOrder(world, RETURN_REASON.DEFECTIVE, ORDER_STATUS.DAMAGED);
  });

  test('completes an approved not-received request and keeps the order lost', async ({ world }) => {
    await expectCompletionKeepsOrder(world, RETURN_REASON.NOT_RECEIVED, ORDER_STATUS.LOST);
  });

  test('offers only completion on the completion screen', async ({ world }) => {
    const { customer, code } = await requestAndApprove(world, RETURN_REASON.OTHER, 'A');
    const admin = await world.admin();
    const row = await openReview(admin, code);
    await expect(row.getByTestId(PENDING_TEST_IDS.ADMIN.RETURN_COMPLETE_FORM)).toBeVisible();
    await expect(row.getByTestId(ABSENCE_IDS.RETURN_MONEY_FIELD)).toHaveCount(0);
    await row.getByTestId(PENDING_TEST_IDS.ADMIN.RETURN_COMPLETE_BUTTON).click();
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.COMPLETED });
  });

  test('offers only approve and reject on a pending request', async ({ world }) => {
    const { code } = await world.orderWithReturn(RETURN_REASON.OTHER, 'A');
    const row = await openReview(await world.admin(), code);
    await expect(row.getByTestId(TEST_IDS.ADMIN.APPROVE_RETURN_BUTTON)).toHaveCount(1);
    await expect(row.getByTestId(TEST_IDS.ADMIN.REJECT_RETURN_BUTTON)).toHaveCount(1);
    await expect(row.getByTestId(PENDING_TEST_IDS.ADMIN.RETURN_COMPLETE_BUTTON)).toHaveCount(0);
  });

  test('offers only completion on an approved request', async ({ world }) => {
    const { code } = await requestAndApprove(world, RETURN_REASON.OTHER, 'A');
    const row = await openReview(await world.admin(), code);
    await expect(row.getByTestId(PENDING_TEST_IDS.ADMIN.RETURN_COMPLETE_BUTTON)).toHaveCount(1);
    await expect(row.getByTestId(TEST_IDS.ADMIN.APPROVE_RETURN_BUTTON)).toHaveCount(0);
    await expect(row.getByTestId(TEST_IDS.ADMIN.REJECT_RETURN_BUTTON)).toHaveCount(0);
  });

  test('does not list rejected requests for admin action', async ({ world }) => {
    const { code } = await requestAndReject(world, RETURN_REASON.OTHER, 'A', 'A');
    const admin = await world.admin();
    await openReturnReviewList(admin);
    await expect(reviewRow(admin, code)).toHaveCount(0);
  });

  test('does not list completed requests for admin action', async ({ world }) => {
    const { code } = await requestApproveAndComplete(world, RETURN_REASON.OTHER, 'A');
    const admin = await world.admin();
    await openReturnReviewList(admin);
    await expect(reviewRow(admin, code)).toHaveCount(0);
  });
});

test.describe('Order not delivered', () => {
  test('refuses a return request for an order waiting for confirmation', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.PENDING);
  });

  test('refuses a return request for an order waiting for pickup', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.AWAITING_PICKUP);
  });

  test('refuses a return request for a delivering order', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.DELIVERING);
  });

  test('refuses a return request for an order with a failed delivery', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.FAILED_DELIVERY);
  });

  test('refuses a return request for an order that is being returned', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.RETURNING);
  });

  test('refuses a return request for an order returned to the seller', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.RETURNED_TO_SELLER);
  });

  test('refuses a return request for a damaged order', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.DAMAGED);
  });

  test('refuses a return request for a lost order', async ({ world }) => {
    await expectRefusedFor(world, ORDER_STATUS.LOST);
  });

  test('lets the customer choose another delivered order after an order-status refusal', async ({ world }) => {
    const notDelivered = await world.orderAt(ORDER_STATUS.DELIVERING);
    const delivered = await world.orderAt(ORDER_STATUS.DELIVERED, {}, notDelivered.customer);
    await openReturnRequest(notDelivered.customer.page, notDelivered.code);
    await expectReturnRequestRefused(notDelivered.customer.page);
    await openReturnForm(notDelivered.customer.page, delivered.code);
  });

  test('ends the request when the customer cancels after an order-status refusal', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERING);
    await openReturnRequest(customer.page, code);
    await expectReturnRequestRefused(customer.page);
    await customer.page.getByTestId(PENDING_TEST_IDS.RETURN.CANCEL_BUTTON).click();
    await expectNoReturnRequest(customer.page, code);
  });
});

test.describe('Reason missing or description missing', () => {
  test('asks for a return reason when none is chosen', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
    await submitReturnForm(customer.page, null, null);
    await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.REASON_ERROR)).toBeVisible();
    await expectNoReturnRequest(customer.page, code);
  });

  test('asks for a description when the other reason has none', async ({ world }) => {
    await expectInvalidNotes(world, RETURN_REASON.OTHER, '');
  });

  test('treats a whitespace-only description as missing for the other reason', async ({ world }) => {
    await expectInvalidNotes(world, RETURN_REASON.OTHER, repeatChar(' ', 3));
  });

  test('saves the request after the missing description is entered', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
    await submitReturnForm(customer.page, RETURN_REASON.OTHER, '');
    await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.NOTES_ERROR)).toBeVisible();
    await submitReturnForm(customer.page, null, 'A');
    await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.SUCCESS_MESSAGE)).toBeVisible();
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
  });

  test('saves the request after a reason is chosen following a missing-reason error', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
    await submitReturnForm(customer.page, null, null);
    await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.REASON_ERROR)).toBeVisible();
    await submitReturnForm(customer.page, RETURN_REASON.NOT_RECEIVED, null);
    await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.SUCCESS_MESSAGE)).toBeVisible();
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.PENDING });
  });

  test('ends the request when the customer cancels after a reason error', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    await openReturnForm(customer.page, code);
    await submitReturnForm(customer.page, null, null);
    await expect(customer.page.getByTestId(PENDING_TEST_IDS.RETURN.REASON_ERROR)).toBeVisible();
    await customer.page.getByTestId(PENDING_TEST_IDS.RETURN.CANCEL_BUTTON).click();
    await expectNoReturnRequest(customer.page, code);
  });
});

test.describe('Order already has a return request', () => {
  test('refuses a second request for an order that already has a pending request', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.OTHER, 'A');
    await expectSecondRequestRefused(customer.page, code);
  });

  test('refuses a second request for an order whose request was rejected', async ({ world }) => {
    const { customer, code } = await requestAndReject(world, RETURN_REASON.OTHER, 'A', 'A');
    await expectSecondRequestRefused(customer.page, code);
  });

  test('refuses a second request for an order whose request was approved', async ({ world }) => {
    const { customer, code } = await requestAndApprove(world, RETURN_REASON.OTHER, 'A');
    await expectSecondRequestRefused(customer.page, code);
  });

  test('refuses a second request for an order whose request was completed', async ({ world }) => {
    const { customer, code } = await requestApproveAndComplete(world, RETURN_REASON.OTHER, 'A');
    await expectSecondRequestRefused(customer.page, code);
  });

  test('saves only one request when the customer submits twice at once', async ({ world }) => {
    const { customer, code } = await world.orderAt(ORDER_STATUS.DELIVERED);
    const secondPage = await world.newPage();
    await loginWithCredentials(secondPage, 'Customer', customer.email, customer.password);
    await openReturnForm(customer.page, code);
    await openReturnForm(secondPage, code);
    await Promise.all([
      submitReturnForm(customer.page, RETURN_REASON.DEFECTIVE, null),
      submitReturnForm(secondPage, RETURN_REASON.DEFECTIVE, null),
    ]);
    const outcome = (page: Page) =>
      page.getByTestId(PENDING_TEST_IDS.RETURN.SUCCESS_MESSAGE).or(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER));
    await expect(outcome(customer.page)).toBeVisible();
    await expect(outcome(secondPage)).toBeVisible();
    const accepted =
      (await customer.page.getByTestId(PENDING_TEST_IDS.RETURN.SUCCESS_MESSAGE).count()) +
      (await secondPage.getByTestId(PENDING_TEST_IDS.RETURN.SUCCESS_MESSAGE).count());
    expect(accepted).toBe(1);
    await expectMyReturnCount(customer.page, code, 1);
  });

  test('lets the customer choose another order after the one-request-per-order refusal', async ({ world }) => {
    const requested = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const other = await world.orderAt(ORDER_STATUS.DELIVERED, {}, requested.customer);
    await openReturnRequest(requested.customer.page, requested.code);
    await expectReturnRequestRefused(requested.customer.page);
    await openReturnForm(requested.customer.page, other.code);
  });

  test('ends the request when the customer cancels after the one-request-per-order refusal', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    await openReturnRequest(customer.page, code);
    await expectReturnRequestRefused(customer.page);
    await customer.page.getByTestId(PENDING_TEST_IDS.RETURN.CANCEL_BUTTON).click();
    await expectMyReturnCount(customer.page, code, 1);
  });
});

test.describe('Request no longer pending', () => {
  test('refuses the second admin who approves an already approved request', async ({ world }) => {
    const { code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const first = await world.admin();
    const second = await world.secondAdmin();
    const firstRow = await openReview(first, code);
    const secondRow = await openReview(second, code);
    await pressApprove(firstRow);
    await expect(firstRow.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(RETURN_STATUS.APPROVED);
    await pressApprove(secondRow);
    await expect(second.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expectReviewStatus(first, code, RETURN_STATUS.APPROVED);
    await openAdminOrder(first, code);
    await expectOrderStatus(first, ORDER_STATUS.DAMAGED);
    await expect(historyEntries(first).filter({ hasText: ORDER_STATUS.DAMAGED })).toHaveCount(1);
  });

  test('refuses the second admin who rejects an already approved request', async ({ world }) => {
    const { code } = await world.orderWithReturn(RETURN_REASON.OTHER, 'A');
    const first = await world.admin();
    const second = await world.secondAdmin();
    const firstRow = await openReview(first, code);
    const secondRow = await openReview(second, code);
    await pressApprove(firstRow);
    await expect(firstRow.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(RETURN_STATUS.APPROVED);
    await submitRejection(second, secondRow, 'A');
    await expect(second.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expectReviewStatus(first, code, RETURN_STATUS.APPROVED);
  });

  test('refuses the second admin who approves an already rejected request', async ({ world }) => {
    const { customer, code } = await world.orderWithReturn(RETURN_REASON.DEFECTIVE);
    const first = await world.admin();
    const second = await world.secondAdmin();
    const firstRow = await openReview(first, code);
    const secondRow = await openReview(second, code);
    await submitRejection(first, firstRow, 'A');
    await expect(reviewRow(first, code)).toHaveCount(0);
    await pressApprove(secondRow);
    await expect(second.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expectMyReturn(customer.page, code, { status: RETURN_STATUS.REJECTED });
    await expectAdminOrderStatus(await world.admin(), code, ORDER_STATUS.DELIVERED);
  });
});
