import { expect, type Locator, type Page, type Request } from '@playwright/test';
import { TEST_IDS } from '../../../src/constants/test-ids';
import { LOAD_MARKER_KEY } from './constants';
import { ABSENCE_IDS } from './absence-ids';

const ROLE_HOME_TEST_IDS = [TEST_IDS.ORDER.CREATE_BUTTON, TEST_IDS.ADMIN.DASHBOARD_TABLE, TEST_IDS.SHIPPER.ASSIGNED_LIST];

/**
 * Opens a screen by its address while signed out and asserts that the login screen is shown instead.
 */
export async function expectSignedOutBlocked(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT)).toBeVisible();
  for (const testId of ROLE_HOME_TEST_IDS) {
    await expect(page.getByTestId(testId)).toHaveCount(0);
  }
}

/**
 * Opens a screen by its address and asserts that none of the given elements of that screen is shown.
 */
export async function expectScreenUnavailable(page: Page, path: string, testIds: string[]): Promise<void> {
  await page.goto(path);
  await expect(page.getByTestId(TEST_IDS.COMMON.LOADING_SKELETON)).toHaveCount(0);
  for (const testId of testIds) {
    await expect(page.getByTestId(testId)).toHaveCount(0);
  }
}

/**
 * Asserts that none of the given elements exists on the current screen.
 */
export async function expectNoElements(page: Page, testIds: string[]): Promise<void> {
  for (const testId of testIds) {
    await expect(page.getByTestId(testId)).toHaveCount(0);
  }
}

/**
 * Marks the loaded document so that a later reload can be detected.
 */
export async function markLoadedPage(page: Page): Promise<void> {
  await page.evaluate((key) => {
    Reflect.set(window, key, true);
  }, LOAD_MARKER_KEY);
}

/**
 * Asserts that the document marked earlier was not reloaded.
 */
export async function expectPageNotReloaded(page: Page): Promise<void> {
  const marked = await page.evaluate((key) => Reflect.get(window, key) === true, LOAD_MARKER_KEY);
  expect(marked).toBe(true);
}

/**
 * Starts recording page loads and data requests of the page; the returned function stops it and gives the requests.
 */
export function recordRequests(page: Page): () => string[] {
  const seen: string[] = [];
  const listener = (request: Request): void => {
    if (['document', 'xhr', 'fetch'].includes(request.resourceType())) {
      seen.push(`${request.method()} ${request.url()}`);
    }
  };
  page.on('request', listener);
  return () => {
    page.off('request', listener);
    return seen;
  };
}

/**
 * Finds the in-app notifications that mention the order code.
 */
export function notificationsFor(page: Page, code: string): Locator {
  return page.getByTestId(TEST_IDS.COMMON.NOTIFICATION).filter({ hasText: code });
}

/**
 * Asserts that the page shows no handling of money.
 */
export async function expectNoMoneyHandling(page: Page): Promise<void> {
  await expect(page.getByTestId(ABSENCE_IDS.MONEY_FIELD)).toHaveCount(0);
}

/**
 * Counts the notifications that mention the order code once loading is finished.
 */
export async function countNotificationsFor(page: Page, code: string): Promise<number> {
  await expect(page.getByTestId(TEST_IDS.COMMON.LOADING_SKELETON)).toHaveCount(0);
  return notificationsFor(page, code).count();
}
