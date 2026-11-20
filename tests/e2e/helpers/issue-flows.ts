import { expect, type Locator, type Page } from '@playwright/test';
import { TEST_IDS } from '../../../src/constants/test-ids';
import { INCIDENT_TYPE, TIMESTAMP_FORMAT } from './constants';
import {
  confirmDialog,
  dismissDialog,
  openAdminOrder,
  openAssignedList,
  expectShipmentStatus,
  readOptionLabels,
  shipmentCardByCode,
  waitForListLoaded,
} from './flows';

const ADMIN_FIELDS = TEST_IDS.ADMIN;

/**
 * Opens the incident report form of the order from its shipment card.
 */
export async function openIncidentForm(page: Page, code: string): Promise<void> {
  await openAssignedList(page);
  await shipmentCardByCode(page, code).getByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON).click();
  await expect(page.getByTestId(TEST_IDS.SHIPPER.ISSUE_TYPE_SELECT)).toBeVisible();
}

/**
 * Reads the incident types the shipper can choose for the order.
 */
export async function readIncidentTypeOptions(page: Page, code: string): Promise<string[]> {
  await openIncidentForm(page, code);
  return readOptionLabels(page.getByTestId(TEST_IDS.SHIPPER.ISSUE_TYPE_SELECT));
}

/**
 * Chooses the incident type and stops at the confirmation dialog.
 */
export async function startIncidentReport(page: Page, code: string, type: string): Promise<void> {
  await openIncidentForm(page, code);
  await page.getByTestId(TEST_IDS.SHIPPER.ISSUE_TYPE_SELECT).selectOption({ label: type });
  await page.getByTestId(TEST_IDS.SHIPPER.SUBMIT_ISSUE_BUTTON).click();
  await expect(page.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG)).toBeVisible();
}

/**
 * Reports an incident of the given type for the order and confirms it.
 */
export async function reportIncident(page: Page, code: string, type: string): Promise<void> {
  await startIncidentReport(page, code, type);
  await confirmDialog(page);
}

/**
 * Chooses the incident type and closes the confirmation dialog without confirming.
 */
export async function abandonIncidentReport(page: Page, code: string, type: string): Promise<void> {
  await startIncidentReport(page, code, type);
  await dismissDialog(page);
}

/**
 * Asserts that the shipper cannot report any incident for the order.
 */
export async function expectIncidentReportUnavailable(page: Page, code: string): Promise<void> {
  await openAssignedList(page);
  const card = shipmentCardByCode(page, code);
  await expect(card).toBeVisible();
  const button = card.getByTestId(TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON);
  if ((await button.count()) > 0) {
    await expect(button).toBeDisabled();
  }
  await expect(page.getByTestId(TEST_IDS.SHIPPER.ISSUE_TYPE_SELECT)).toHaveCount(0);
}

/**
 * Asserts that incident reporting is blocked for the order, the status is unchanged and no incident was stored.
 */
export async function expectIncidentReportBlocked(
  shipperPage: Page,
  adminPage: Page,
  code: string,
  status: string,
): Promise<void> {
  await expectIncidentReportUnavailable(shipperPage, code);
  await expectShipmentStatus(shipperPage, code, status);
  await openIssuesList(adminPage);
  await expect(issueRows(adminPage, code)).toHaveCount(0);
}

/**
 * Opens the admin list of incidents that have no resolution result yet.
 */
export async function openIssuesList(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.ADMIN.ISSUES_TAB).click();
  const list = page.getByTestId(ADMIN_FIELDS.ISSUES_LIST);
  await expect(list).toBeVisible();
  await waitForListLoaded(page, list.getByTestId(ADMIN_FIELDS.ISSUE_ITEM));
}

/**
 * Finds the incidents of the order in the admin list, optionally of one type.
 */
export function issueRows(page: Page, code: string, type?: string): Locator {
  const rows = page.getByTestId(ADMIN_FIELDS.ISSUES_LIST).getByTestId(ADMIN_FIELDS.ISSUE_ITEM).filter({ hasText: code });
  return type === undefined ? rows : rows.filter({ hasText: type });
}

/**
 * Opens the unresolved incident list and returns the single incident of the order and type.
 */
export async function openIssue(page: Page, code: string, type: string): Promise<Locator> {
  await openIssuesList(page);
  const row = issueRows(page, code, type).first();
  await expect(row).toBeVisible();
  return row;
}

/**
 * Asserts the stored fields of an incident: type, reporter and time format.
 */
export async function expectIncidentFields(row: Locator, type: string, reporterEmail: string): Promise<void> {
  await expect(row.getByTestId(ADMIN_FIELDS.ISSUE_TYPE)).toHaveText(type);
  await expect(row.getByTestId(ADMIN_FIELDS.ISSUE_REPORTER)).toContainText(reporterEmail);
  await expect(row.getByTestId(ADMIN_FIELDS.ISSUE_REPORTED_AT)).toHaveText(TIMESTAMP_FORMAT);
}

/**
 * Reads the incident code shown on an incident row.
 */
export async function readIssueCode(row: Locator): Promise<string> {
  const text = (await row.getByTestId(ADMIN_FIELDS.ISSUE_CODE).textContent())?.trim() ?? '';
  expect(text).not.toBe('');
  return text;
}

/**
 * Types the resolution result and presses save without waiting for the outcome.
 */
export async function submitIssueResult(row: Locator, result: string): Promise<void> {
  await row.getByTestId(ADMIN_FIELDS.ISSUE_RESULT_INPUT).fill(result);
  await row.getByTestId(ADMIN_FIELDS.ISSUE_RESULT_SAVE_BUTTON).click();
}

/**
 * Saves a resolution result for the incident and asserts that the result is shown as saved.
 */
export async function saveIssueResult(row: Locator, result: string): Promise<void> {
  await submitIssueResult(row, result);
  await expect(row.getByTestId(ADMIN_FIELDS.ISSUE_RESULT_TEXT)).toHaveText(result);
}

/**
 * Moves the order of the selected failed-delivery incident to the returning status.
 */
export async function moveIssueOrderToReturning(row: Locator): Promise<void> {
  await row.getByTestId(ADMIN_FIELDS.ISSUE_RETURN_BUTTON).click();
}

/**
 * Confirms from the admin order details that a delivering order is lost.
 */
export async function adminConfirmLost(page: Page, code: string): Promise<void> {
  await openAdminOrder(page, code);
  await page.getByTestId(ADMIN_FIELDS.CONFIRM_LOST_BUTTON).click();
}

/**
 * Asserts that the open admin order details offer no way to confirm the order as lost.
 */
export async function expectConfirmLostUnavailable(page: Page): Promise<void> {
  await expect(page.getByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER)).toBeVisible();
  await expect(page.getByTestId(TEST_IDS.COMMON.LOADING_SKELETON)).toHaveCount(0);
  const button = page.getByTestId(ADMIN_FIELDS.CONFIRM_LOST_BUTTON);
  if ((await button.count()) > 0) {
    await expect(button).toBeDisabled();
  }
}

/**
 * Confirms from the admin order details that the returned goods were received back.
 */
export async function adminConfirmReturnedGoods(page: Page, code: string): Promise<void> {
  await openAdminOrder(page, code);
  await page.getByTestId(ADMIN_FIELDS.CONFIRM_RETURNED_BUTTON).click();
}

/**
 * Drives an order whose third failed delivery was reported to the returning status through the incident list.
 */
export async function adminMoveToReturning(page: Page, code: string): Promise<void> {
  const row = await openIssue(page, code, INCIDENT_TYPE.FAILED_DELIVERY);
  await moveIssueOrderToReturning(row);
}

/**
 * Gives every unresolved incident a result, one attempt per row, so that the unresolved list can be checked empty.
 */
export async function resolveAllIssues(page: Page, result: string): Promise<void> {
  await openIssuesList(page);
  const rows = page.getByTestId(ADMIN_FIELDS.ISSUES_LIST).getByTestId(ADMIN_FIELDS.ISSUE_ITEM);
  let position = 0;
  while ((await rows.count()) > position) {
    const before = await rows.count();
    await submitIssueResult(rows.nth(position), result);
    await openIssuesList(page);
    if ((await rows.count()) >= before) {
      position += 1;
    }
  }
}
