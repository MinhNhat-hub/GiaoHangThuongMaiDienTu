import { expect, type Locator, type Page } from '@playwright/test';
import { TEST_IDS } from '../../../src/constants/test-ids';
import { APP_PATHS, TIMESTAMP_FORMAT } from './constants';
import { PENDING_TEST_IDS } from './pending-test-ids';
import { readCredentials, type AccountSlot } from './session';

export { APP_PATHS };

export interface OrderLineDraft {
  product: number | null;
  quantity: string;
}

export interface OrderDraft {
  lines: OrderLineDraft[];
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
}

/**
 * Builds the base order: one line with product 1 and quantity 1, and the first valid value of every other field.
 */
export function buildOrderDraft(overrides: Partial<OrderDraft> = {}): OrderDraft {
  return {
    lines: [{ product: 1, quantity: '1' }],
    recipientName: 'A',
    recipientPhone: '0123456789',
    deliveryAddress: 'A',
    ...overrides,
  };
}

/**
 * Opens the order creation screen from the customer home screen.
 */
export async function openOrderCreation(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON).click();
  await expect(page.getByTestId(TEST_IDS.ORDER.STEP_PRODUCT)).toBeVisible();
}

const ORDER_STEP_TEST_ID = {
  product: TEST_IDS.ORDER.STEP_PRODUCT,
  recipient: TEST_IDS.ORDER.STEP_RECIPIENT,
} as const;

export type OrderStep = keyof typeof ORDER_STEP_TEST_ID;

/**
 * Fills the line at the given position of the product step; the product is chosen by its 1-based position in the product list.
 */
async function fillOrderLine(step: Locator, position: number, line: OrderLineDraft): Promise<void> {
  if (position > 0) {
    await step.getByTestId(PENDING_TEST_IDS.ORDER.ADD_LINE_BUTTON).click();
  }
  if (line.product !== null) {
    await step.getByTestId(TEST_IDS.ORDER.PRODUCT_SELECT).nth(position).selectOption({ index: line.product });
  }
  await step.getByTestId(TEST_IDS.ORDER.QUANTITY_INPUT).nth(position).fill(line.quantity);
}

/**
 * Fills the product step (products and quantities) and returns the labels of the chosen products in line order.
 */
export async function fillProductStep(page: Page, draft: OrderDraft): Promise<string[]> {
  const step = page.getByTestId(ORDER_STEP_TEST_ID.product);
  await expect(step).toBeVisible();
  const labels: string[] = [];
  for (const [position, line] of draft.lines.entries()) {
    await fillOrderLine(step, position, line);
    if (line.product !== null) {
      labels.push(await readSelectedProductLabel(step.getByTestId(TEST_IDS.ORDER.PRODUCT_SELECT).nth(position)));
    }
  }
  return labels;
}

/**
 * Fills the recipient step (name, phone number and delivery address).
 */
export async function fillRecipientStep(page: Page, draft: OrderDraft): Promise<void> {
  const step = page.getByTestId(ORDER_STEP_TEST_ID.recipient);
  await expect(step).toBeVisible();
  await step.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_INPUT).fill(draft.recipientName);
  await step.getByTestId(TEST_IDS.ORDER.RECIPIENT_PHONE_INPUT).fill(draft.recipientPhone);
  await step.getByTestId(TEST_IDS.ORDER.DELIVERY_ADDRESS_INPUT).fill(draft.deliveryAddress);
}

/**
 * Tells the system that the data of the given step is entered, which validates it and moves to the next step when it is valid.
 */
export async function goToNextStep(page: Page, step: OrderStep): Promise<void> {
  await page.getByTestId(ORDER_STEP_TEST_ID[step]).getByTestId(PENDING_TEST_IDS.ORDER.NEXT_STEP_BUTTON).click();
}

/**
 * Opens the order form and goes through the product and recipient steps with a valid draft.
 * Returns the labels of the chosen products.
 */
export async function enterOrder(page: Page, draft: OrderDraft): Promise<string[]> {
  await openOrderCreation(page);
  const labels = await fillProductStep(page, draft);
  await goToNextStep(page, 'product');
  await fillRecipientStep(page, draft);
  await goToNextStep(page, 'recipient');
  return labels;
}

/**
 * Opens the order form and goes through the steps with a draft that may be invalid.
 * Stops at the first step that rejects its data and returns the labels of the chosen products.
 */
export async function enterOrderUntilRejected(page: Page, draft: OrderDraft): Promise<string[]> {
  await openOrderCreation(page);
  const labels = await fillProductStep(page, draft);
  await goToNextStep(page, 'product');
  const recipientStep = page.getByTestId(ORDER_STEP_TEST_ID.recipient);
  const productStepErrors = page
    .getByTestId(PENDING_TEST_IDS.ORDER.PRODUCT_ERROR)
    .or(page.getByTestId(PENDING_TEST_IDS.ORDER.QUANTITY_ERROR));
  await expect(recipientStep.or(productStepErrors).first()).toBeVisible();
  if (await recipientStep.isVisible()) {
    await fillRecipientStep(page, draft);
    await goToNextStep(page, 'recipient');
  }
  return labels;
}

/**
 * Confirms the reviewed order and returns the order code shown by the success notice.
 */
export async function confirmReviewedOrder(page: Page): Promise<string> {
  await page.getByTestId(TEST_IDS.ORDER.SUBMIT_ORDER_BUTTON).click();
  const code = page.getByTestId(PENDING_TEST_IDS.ORDER.SUCCESS_CODE);
  await expect(code).toBeVisible();
  const text = (await code.textContent())?.trim() ?? '';
  expect(text).not.toBe('');
  return text;
}

/**
 * Creates an order through the whole customer flow and returns its code.
 */
export async function createOrder(page: Page, draft: OrderDraft = buildOrderDraft()): Promise<string> {
  await enterOrder(page, draft);
  await expect(page.getByTestId(TEST_IDS.ORDER.STEP_CONFIRM)).toBeVisible();
  return confirmReviewedOrder(page);
}

/**
 * Reads the label of the option currently selected in a product select.
 */
export async function readSelectedProductLabel(select: Locator): Promise<string> {
  const label = await select.evaluate((element) => {
    const options = (element as HTMLSelectElement).selectedOptions;
    return options.length > 0 ? (options[0].textContent ?? '') : '';
  });
  return label.trim();
}

/**
 * Waits until a list has finished loading: its first item or the empty state is shown and no loading skeleton is left.
 */
export async function waitForListLoaded(page: Page, items: Locator): Promise<void> {
  await expect(items.first().or(page.getByTestId(TEST_IDS.COMMON.EMPTY_STATE).first())).toBeVisible();
  await expect(page.getByTestId(TEST_IDS.COMMON.LOADING_SKELETON)).toHaveCount(0);
}

/**
 * Opens the customer order list and waits until it has loaded.
 */
export async function openOrderList(page: Page): Promise<void> {
  await page.getByTestId(PENDING_TEST_IDS.COMMON.NAV_ORDER_LIST_LINK).click();
  await waitForListLoaded(page, page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM));
}

/**
 * Finds the entries of the customer order list that show the given order code.
 */
export function listedOrder(page: Page, code: string): Locator {
  return page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM).filter({ hasText: code });
}

/**
 * Opens the order list and asserts how many orders it shows.
 */
export async function expectListedOrderCount(page: Page, count: number): Promise<void> {
  await openOrderList(page);
  await expect(page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM)).toHaveCount(count);
}

/**
 * Opens the details of the order with the given code from the customer order list.
 */
export async function openOrderByCode(page: Page, code: string): Promise<void> {
  await openOrderList(page);
  await listedOrder(page, code).click();
  await expect(page.getByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER)).toBeVisible();
}

/**
 * Asserts the current status shown by the status badge of the opened order.
 */
export async function expectOrderStatus(page: Page, status: string, timeout?: number): Promise<void> {
  await expect(
    page.getByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER).getByTestId(TEST_IDS.COMMON.STATUS_BADGE),
  ).toHaveText(status, { timeout });
}

/**
 * Reads the labels of the non-empty options of a native select.
 */
export async function readOptionLabels(select: Locator): Promise<string[]> {
  const labels = await select.evaluate((element) =>
    Array.from((element as HTMLSelectElement).options)
      .filter((option) => option.value !== '')
      .map((option) => (option.textContent ?? '').trim()),
  );
  return labels;
}

/**
 * Selects the option of a native select whose label contains the given text.
 */
export async function selectOptionContaining(select: Locator, text: string): Promise<void> {
  const labels = await readOptionLabels(select);
  const label = labels.find((candidate) => candidate.includes(text));
  if (label === undefined) {
    throw new Error(`No option contains ${text}`);
  }
  await select.selectOption({ label });
}

/**
 * Opens the admin list of orders waiting for assignment and waits until loading is finished.
 */
export async function openAssignmentList(page: Page): Promise<void> {
  await page.getByTestId(PENDING_TEST_IDS.ADMIN.ASSIGNMENT_TAB).click();
  const table = page.getByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE);
  await expect(table).toBeVisible();
  await waitForListLoaded(page, table.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM));
}

/**
 * Finds the row of the order with the given code in the admin assignment list.
 */
export function assignmentRow(page: Page, code: string): Locator {
  return page
    .getByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE)
    .getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM)
    .filter({ hasText: code });
}

/**
 * Opens the assignment dialog of the order and chooses the shipper of the given account slot without saving.
 */
export async function chooseShipperForOrder(page: Page, code: string, slot: AccountSlot = 'primary'): Promise<Locator> {
  await assignmentRow(page, code).getByTestId(PENDING_TEST_IDS.ADMIN.ASSIGN_BUTTON).click();
  const dialog = page.getByTestId(TEST_IDS.ADMIN.ASSIGN_SHIPPER_DIALOG);
  await expect(dialog).toBeVisible();
  await selectOptionContaining(dialog.getByTestId(TEST_IDS.ADMIN.SHIPPER_SELECT), readCredentials('Shipper', slot).email);
  return dialog;
}

/**
 * Presses the save button of the open assignment dialog without waiting for the outcome.
 */
export async function pressSaveAssignment(dialog: Locator): Promise<void> {
  await dialog.getByTestId(TEST_IDS.ADMIN.CONFIRM_ASSIGN_BUTTON).click();
}

/**
 * Saves the assignment in the open dialog and waits until the dialog closes.
 */
export async function saveAssignment(dialog: Locator): Promise<void> {
  await pressSaveAssignment(dialog);
  await expect(dialog).toBeHidden();
}

/**
 * Assigns the order with the given code to the shipper of the given account slot from the admin assignment list.
 */
export async function assignOrderToShipper(page: Page, code: string, slot: AccountSlot = 'primary'): Promise<void> {
  await openAssignmentList(page);
  await saveAssignment(await chooseShipperForOrder(page, code, slot));
}

/**
 * Opens the admin order tracking list, which shows orders of every status.
 */
export async function openTrackingList(page: Page): Promise<void> {
  await page.getByTestId(PENDING_TEST_IDS.ADMIN.TRACKING_TAB).click();
  const table = page.getByTestId(PENDING_TEST_IDS.ADMIN.TRACKING_TABLE);
  await expect(table).toBeVisible();
  await waitForListLoaded(page, table.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM));
}

/**
 * Finds the row of the order with the given code in the admin tracking list.
 */
export function trackingRow(page: Page, code: string): Locator {
  return page
    .getByTestId(PENDING_TEST_IDS.ADMIN.TRACKING_TABLE)
    .getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM)
    .filter({ hasText: code });
}

/**
 * Opens the details of the order with the given code from the admin tracking list.
 */
export async function openAdminOrder(page: Page, code: string): Promise<void> {
  await openTrackingList(page);
  await trackingRow(page, code).click();
  await expect(page.getByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER)).toBeVisible();
}

/**
 * Opens the order in the admin tracking list and asserts its current status.
 */
export async function expectAdminOrderStatus(page: Page, code: string, status: string): Promise<void> {
  await openAdminOrder(page, code);
  await expectOrderStatus(page, status);
}

/**
 * Opens the shipment of the order with the given code from the admin order details.
 */
export async function openAdminShipment(page: Page, code: string): Promise<void> {
  await openAdminOrder(page, code);
  await page.getByTestId(TEST_IDS.ORDER.TAB_TRACKING).click();
  await expect(page.getByTestId(PENDING_TEST_IDS.SHIPMENT.CODE)).toBeVisible();
}

/**
 * Opens the shipment tracking tab of the order that is already open and waits for its timeline.
 */
export async function openTrackingTab(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.ORDER.TAB_TRACKING).click();
  await expect(page.getByTestId(TEST_IDS.SHIPMENT.TIMELINE_CONTAINER)).toBeVisible();
}

/**
 * Finds the shipment card of the order with the given code in the shipper list.
 */
export function shipmentCardByCode(page: Page, code: string): Locator {
  return page
    .getByTestId(TEST_IDS.SHIPPER.ASSIGNED_LIST)
    .getByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD)
    .filter({ hasText: code });
}

/**
 * Opens the shipper list of assigned orders and waits until loading is finished.
 */
export async function openAssignedList(page: Page): Promise<void> {
  await page.getByTestId(PENDING_TEST_IDS.SHIPPER.NAV_ASSIGNED_LINK).click();
  const list = page.getByTestId(TEST_IDS.SHIPPER.ASSIGNED_LIST);
  await expect(list).toBeVisible();
  await waitForListLoaded(page, list.getByTestId(TEST_IDS.SHIPPER.SHIPMENT_CARD));
}

/**
 * Confirms the open confirmation dialog.
 */
export async function confirmDialog(page: Page): Promise<void> {
  const dialog = page.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG);
  await expect(dialog).toBeVisible();
  await page.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM).click();
  await expect(dialog).toBeHidden();
}

/**
 * Closes the open confirmation dialog without confirming.
 */
export async function dismissDialog(page: Page): Promise<void> {
  const dialog = page.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG);
  await expect(dialog).toBeVisible();
  await page.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG_CANCEL).click();
  await expect(dialog).toBeHidden();
}

export const SHIPPER_ACTION_IDS: string[] = [
  TEST_IDS.SHIPPER.PICKUP_BUTTON,
  TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON,
  TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON,
];

export type ShipperAction = 'pickup' | 'deliver';

const SHIPPER_ACTION_TEST_ID: Record<ShipperAction, string> = {
  pickup: TEST_IDS.SHIPPER.PICKUP_BUTTON,
  deliver: TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON,
};

/**
 * Chooses the next status for the order and stops at the confirmation dialog.
 */
export async function startStatusChange(page: Page, code: string, action: ShipperAction): Promise<void> {
  await openAssignedList(page);
  await shipmentCardByCode(page, code).getByTestId(SHIPPER_ACTION_TEST_ID[action]).click();
  await expect(page.getByTestId(TEST_IDS.COMMON.CONFIRM_DIALOG)).toBeVisible();
}

/**
 * Lets the shipper pick up the order, moving it to the delivering status.
 */
export async function shipperPickUp(page: Page, code: string): Promise<void> {
  await startStatusChange(page, code, 'pickup');
  await confirmDialog(page);
}

/**
 * Lets the shipper mark the order as delivered.
 */
export async function shipperDeliver(page: Page, code: string): Promise<void> {
  await startStatusChange(page, code, 'deliver');
  await confirmDialog(page);
}

/**
 * Asserts which next-status choices the shipper has for the order.
 */
export async function expectNextStatusChoices(
  page: Page,
  code: string,
  choices: { pickup: boolean; deliver: boolean },
): Promise<void> {
  await openAssignedList(page);
  const card = shipmentCardByCode(page, code);
  await expect(card).toBeVisible();
  await expect(card.getByTestId(TEST_IDS.SHIPPER.PICKUP_BUTTON)).toHaveCount(choices.pickup ? 1 : 0);
  await expect(card.getByTestId(TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON)).toHaveCount(choices.deliver ? 1 : 0);
}

/**
 * Asserts the status shown on the shipment card of the order in the shipper list.
 */
export async function expectShipmentStatus(page: Page, code: string, status: string): Promise<void> {
  await openAssignedList(page);
  await expect(shipmentCardByCode(page, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(status);
}

/**
 * Opens the status history of the order from its shipment card in the shipper list.
 */
export async function openShipperHistory(page: Page, code: string): Promise<void> {
  await openAssignedList(page);
  await shipmentCardByCode(page, code).getByTestId(PENDING_TEST_IDS.SHIPPER.HISTORY_BUTTON).click();
  await expect(page.getByTestId(TEST_IDS.ORDER.ORDER_STATUS_TIMELINE)).toBeVisible();
}

/**
 * Returns every entry of the status history shown on the open screen, from oldest to newest.
 */
export function historyEntries(page: Page): Locator {
  return page.getByTestId(TEST_IDS.ORDER.ORDER_STATUS_TIMELINE).getByTestId(PENDING_TEST_IDS.ORDER.TIMELINE_ENTRY);
}

export interface HistoryEntryExpectation {
  oldStatus: string;
  newStatus: string;
  actorEmail?: string;
}

/**
 * Asserts the content of one history entry: actor, time format, old status and new status.
 */
export async function expectHistoryEntry(entry: Locator, expected: HistoryEntryExpectation): Promise<void> {
  const fields = PENDING_TEST_IDS.ORDER;
  if (expected.actorEmail !== undefined) {
    await expect(entry.getByTestId(fields.TIMELINE_ENTRY_ACTOR)).toContainText(expected.actorEmail);
  }
  await expect(entry.getByTestId(fields.TIMELINE_ENTRY_TIME)).toHaveText(TIMESTAMP_FORMAT);
  await expect(entry.getByTestId(fields.TIMELINE_ENTRY_OLD_STATUS)).toHaveText(expected.oldStatus);
  await expect(entry.getByTestId(fields.TIMELINE_ENTRY_NEW_STATUS)).toHaveText(expected.newStatus);
}

/**
 * Asserts the newest history entry on the open screen.
 */
export async function expectLatestHistoryEntry(page: Page, expected: HistoryEntryExpectation): Promise<void> {
  await expectHistoryEntry(historyEntries(page).last(), expected);
}

/**
 * Asserts the new statuses of the whole history on the open screen, from oldest to newest.
 */
export async function expectHistoryStatuses(page: Page, statuses: string[]): Promise<void> {
  const newStatuses = historyEntries(page).getByTestId(PENDING_TEST_IDS.ORDER.TIMELINE_ENTRY_NEW_STATUS);
  await expect(newStatuses).toHaveText(statuses);
}

/**
 * Counts the history entries on the open screen after the history has loaded.
 */
export async function countHistoryEntries(page: Page): Promise<number> {
  await expect(historyEntries(page).first()).toBeVisible();
  return historyEntries(page).count();
}

/**
 * Asserts that every row of the table shows the given status.
 */
export async function expectEveryRowHasStatus(table: Locator, status: string): Promise<void> {
  const rows = table.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM);
  await expect(rows.first()).toBeVisible();
  const rowsWithOtherStatus = rows.filter({
    hasNot: table.page().getByTestId(TEST_IDS.COMMON.STATUS_BADGE).filter({ hasText: status }),
  });
  await expect(rowsWithOtherStatus).toHaveCount(0);
}

/**
 * Asserts the status of the order in the admin tracking list after reopening it.
 */
export async function expectTrackedStatus(page: Page, code: string, status: string): Promise<void> {
  await openTrackingList(page);
  await expect(trackingRow(page, code).getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveText(status);
}

/**
 * Reads the shipment code shown on the open shipment screen.
 */
export async function readShipmentCode(page: Page): Promise<string> {
  const text = (await page.getByTestId(PENDING_TEST_IDS.SHIPMENT.CODE).textContent())?.trim() ?? '';
  expect(text).not.toBe('');
  return text;
}

/**
 * Asserts that every entry of the open status history shows its time in the required format.
 */
export async function expectHistoryTimestamps(page: Page): Promise<void> {
  const entries = historyEntries(page);
  await expect(entries.first()).toBeVisible();
  const entriesWithOtherTime = entries.filter({
    hasNot: page.getByTestId(PENDING_TEST_IDS.ORDER.TIMELINE_ENTRY_TIME).filter({ hasText: TIMESTAMP_FORMAT }),
  });
  await expect(entriesWithOtherTime).toHaveCount(0);
}

/**
 * Asserts the status shown for an order in the customer order list.
 */
export async function expectListedOrderStatus(page: Page, code: string, status: string): Promise<void> {
  await openOrderList(page);
  await expect(
    page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM).filter({ hasText: code }).getByTestId(TEST_IDS.COMMON.STATUS_BADGE),
  ).toHaveText(status);
}

/**
 * Asserts that none of the order field errors is shown.
 */
export async function expectNoOrderFieldErrors(page: Page): Promise<void> {
  const errors = PENDING_TEST_IDS.ORDER;
  for (const errorId of [
    errors.PRODUCT_ERROR,
    errors.QUANTITY_ERROR,
    errors.RECIPIENT_NAME_ERROR,
    errors.RECIPIENT_PHONE_ERROR,
    errors.DELIVERY_ADDRESS_ERROR,
  ]) {
    await expect(page.getByTestId(errorId)).toHaveCount(0);
  }
}

/**
 * Asserts that the review step is shown without errors and repeats the entered data.
 */
export async function expectReviewShows(page: Page, draft: OrderDraft, productLabels: string[] = []): Promise<void> {
  const review = page.getByTestId(TEST_IDS.ORDER.STEP_CONFIRM);
  await expect(review).toBeVisible();
  await expectNoOrderFieldErrors(page);
  for (const line of draft.lines) {
    await expect(review).toContainText(line.quantity);
  }
  for (const label of productLabels) {
    await expect(review).toContainText(label);
  }
  await expect(review).toContainText(draft.recipientName);
  await expect(review).toContainText(draft.recipientPhone);
  await expect(review).toContainText(draft.deliveryAddress);
}

/**
 * Asserts that the review step is not reached and the given field error is shown.
 */
export async function expectOrderFieldRejected(page: Page, errorTestId: string): Promise<void> {
  await expect(page.getByTestId(errorTestId)).toBeVisible();
  await expect(page.getByTestId(TEST_IDS.ORDER.STEP_CONFIRM)).toHaveCount(0);
}

/**
 * Asserts that the signed-in customer has no saved order.
 */
export async function expectNoSavedOrder(page: Page): Promise<void> {
  await expectListedOrderCount(page, 0);
}
