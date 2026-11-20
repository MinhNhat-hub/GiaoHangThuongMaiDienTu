import { expect, type Locator, type Page } from '@playwright/test';
import { TEST_IDS } from '../../../src/constants/test-ids';
import { RETURN_STATUS, TIMESTAMP_FORMAT } from './constants';
import { openOrderByCode, waitForListLoaded } from './flows';

const RETURN_FIELDS = TEST_IDS.RETURN;
const ADMIN_FIELDS = TEST_IDS.ADMIN;

/**
 * Opens the return request screen of the order from the customer order list.
 */
export async function openReturnRequest(page: Page, code: string): Promise<void> {
  await openOrderByCode(page, code);
  await page.getByTestId(TEST_IDS.ORDER.REQUEST_RETURN_BUTTON).click();
}

/**
 * Asserts that the request was accepted for filling: the form and its reason choices are shown.
 */
export async function expectReturnFormOpen(page: Page): Promise<void> {
  await expect(page.getByTestId(TEST_IDS.RETURN.REQUEST_FORM)).toBeVisible();
  await expect(page.getByTestId(TEST_IDS.RETURN.REASON_SELECT)).toBeVisible();
}

/**
 * Asserts that the system refused to open the return request form and told the customer why.
 */
export async function expectReturnRequestRefused(page: Page): Promise<void> {
  await expect(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
  await expect(page.getByTestId(TEST_IDS.RETURN.REQUEST_FORM)).toHaveCount(0);
}

/**
 * Opens the return request of the order and asserts that the form is available.
 */
export async function openReturnForm(page: Page, code: string): Promise<void> {
  await openReturnRequest(page, code);
  await expectReturnFormOpen(page);
}

/**
 * Fills the reason and the optional description and presses send without waiting for the outcome.
 */
export async function submitReturnForm(page: Page, reason: string | null, notes: string | null): Promise<void> {
  if (reason !== null) {
    await page.getByTestId(TEST_IDS.RETURN.REASON_SELECT).selectOption({ label: reason });
  }
  if (notes !== null) {
    await page.getByTestId(TEST_IDS.RETURN.NOTES_INPUT).fill(notes);
  }
  await page.getByTestId(TEST_IDS.RETURN.SUBMIT_BUTTON).click();
}

/**
 * Sends a return request for the order and asserts that it was accepted.
 */
export async function requestReturn(page: Page, code: string, reason: string, notes: string | null = null): Promise<void> {
  await openReturnForm(page, code);
  await submitReturnForm(page, reason, notes);
  await expect(page.getByTestId(RETURN_FIELDS.SUCCESS_MESSAGE)).toBeVisible();
}

/**
 * Opens the list of return requests the customer has sent.
 */
export async function openMyReturns(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.COMMON.NAV_RETURN_LIST_LINK).click();
  const list = page.getByTestId(RETURN_FIELDS.LIST);
  await expect(list).toBeVisible();
  await waitForListLoaded(page, list.getByTestId(RETURN_FIELDS.LIST_ITEM));
}

/**
 * Finds the return requests of the order in the customer list.
 */
export function myReturnRows(page: Page, code: string): Locator {
  return page.getByTestId(RETURN_FIELDS.LIST).getByTestId(RETURN_FIELDS.LIST_ITEM).filter({ hasText: code });
}

/**
 * Asserts the number of return requests the customer has for the order.
 */
export async function expectMyReturnCount(page: Page, code: string, count: number): Promise<void> {
  await openMyReturns(page);
  await expect(myReturnRows(page, code)).toHaveCount(count);
}

export interface ReturnExpectation {
  status: string;
  reason?: string;
  notes?: string;
  rejectReason?: string;
}

/**
 * Asserts the stored request of the order in the customer list.
 */
export async function expectMyReturn(page: Page, code: string, expected: ReturnExpectation): Promise<Locator> {
  await openMyReturns(page);
  const row = myReturnRows(page, code);
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(expected.status);
  if (expected.reason !== undefined) {
    await expect(row.getByTestId(RETURN_FIELDS.ITEM_REASON)).toHaveText(expected.reason);
  }
  if (expected.notes !== undefined) {
    await expect(row.getByTestId(RETURN_FIELDS.ITEM_NOTES)).toHaveText(expected.notes);
  }
  if (expected.rejectReason !== undefined) {
    await expect(row.getByTestId(RETURN_FIELDS.ITEM_REJECT_REASON)).toHaveText(expected.rejectReason);
  }
  return row;
}

/**
 * Asserts that the order has no return request in the customer list.
 */
export async function expectNoReturnRequest(page: Page, code: string): Promise<void> {
  await expectMyReturnCount(page, code, 0);
}

/**
 * Asserts the submit time format of the customer's request for the order.
 */
export async function expectReturnSubmitTime(row: Locator): Promise<void> {
  await expect(row.getByTestId(RETURN_FIELDS.ITEM_SUBMITTED_AT)).toHaveText(TIMESTAMP_FORMAT);
}

/**
 * Opens the admin list of return requests that wait for a decision or for completion.
 */
export async function openReturnReviewList(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.ADMIN.RETURNS_TAB).click();
  const list = page.getByTestId(ADMIN_FIELDS.RETURNS_LIST);
  await expect(list).toBeVisible();
  await waitForListLoaded(page, list.getByTestId(ADMIN_FIELDS.RETURN_ITEM));
}

/**
 * Finds the return requests of the order in the admin list.
 */
export function reviewRow(page: Page, code: string): Locator {
  return page.getByTestId(ADMIN_FIELDS.RETURNS_LIST).getByTestId(ADMIN_FIELDS.RETURN_ITEM).filter({ hasText: code });
}

/**
 * Opens the admin return list and returns the single request of the order.
 */
export async function openReview(page: Page, code: string): Promise<Locator> {
  await openReturnReviewList(page);
  const row = reviewRow(page, code);
  await expect(row).toHaveCount(1);
  return row;
}

/**
 * Presses approve on the request without waiting for the outcome.
 */
export async function pressApprove(row: Locator): Promise<void> {
  await row.getByTestId(TEST_IDS.ADMIN.APPROVE_RETURN_BUTTON).click();
}

/**
 * Approves the pending request of the order and asserts that it stays in the list as approved.
 */
export async function approveReturn(page: Page, code: string): Promise<void> {
  const row = await openReview(page, code);
  await pressApprove(row);
  await expect(row.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(RETURN_STATUS.APPROVED);
}

/**
 * Chooses reject for the request, enters the reason and confirms, without waiting for the outcome.
 */
export async function submitRejection(page: Page, row: Locator, reason: string): Promise<void> {
  await row.getByTestId(TEST_IDS.ADMIN.REJECT_RETURN_BUTTON).click();
  await page.getByTestId(TEST_IDS.ADMIN.REJECT_REASON_INPUT).fill(reason);
  await page.getByTestId(ADMIN_FIELDS.REJECT_CONFIRM_BUTTON).click();
}

/**
 * Rejects the pending request of the order with the reason and asserts that it leaves the list.
 */
export async function rejectReturn(page: Page, code: string, reason: string): Promise<void> {
  const row = await openReview(page, code);
  await submitRejection(page, row, reason);
  await expect(reviewRow(page, code)).toHaveCount(0);
}

/**
 * Records completion of the approved request of the order and asserts that it leaves the list.
 */
export async function completeReturn(page: Page, code: string): Promise<void> {
  const row = await openReview(page, code);
  await row.getByTestId(ADMIN_FIELDS.RETURN_COMPLETE_BUTTON).click();
  await expect(reviewRow(page, code)).toHaveCount(0);
}

/**
 * Asserts the status shown for the request in the admin list after reopening it.
 */
export async function expectReviewStatus(page: Page, code: string, status: string): Promise<void> {
  const row = await openReview(page, code);
  await expect(row.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(status);
}

/**
 * Reads the request code shown on a request row of the customer list.
 */
export async function readReturnCode(row: Locator): Promise<string> {
  const text = (await row.getByTestId(RETURN_FIELDS.ITEM_CODE).textContent())?.trim() ?? '';
  expect(text).not.toBe('');
  return text;
}

/**
 * Handles every request of the admin list, one attempt per row, so that the list can be checked empty.
 */
export async function clearReturnReviewList(page: Page, reason: string): Promise<void> {
  await openReturnReviewList(page);
  const rows = page.getByTestId(ADMIN_FIELDS.RETURNS_LIST).getByTestId(ADMIN_FIELDS.RETURN_ITEM);
  let position = 0;
  while ((await rows.count()) > position) {
    const before = await rows.count();
    const row = rows.nth(position);
    if ((await row.getByTestId(ADMIN_FIELDS.RETURN_COMPLETE_BUTTON).count()) > 0) {
      await row.getByTestId(ADMIN_FIELDS.RETURN_COMPLETE_BUTTON).click();
    } else {
      await submitRejection(page, row, reason);
    }
    await openReturnReviewList(page);
    if ((await rows.count()) >= before) {
      position += 1;
    }
  }
}
