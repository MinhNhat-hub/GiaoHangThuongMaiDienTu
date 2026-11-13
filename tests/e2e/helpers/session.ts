import { expect, type Page } from '@playwright/test';
import { TEST_IDS } from '../../../src/constants/test-ids';
import { APP_PATHS } from './constants';
import { buildEmail, generatePassword } from './data';
import { PENDING_TEST_IDS } from './pending-test-ids';

export type Role = 'Admin' | 'Shipper' | 'Customer';
export type AccountSlot = 'primary' | 'secondary' | 'tertiary';

export interface RegistrationValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export type RegisteredCustomer = RegistrationValues;

const ROLE_ENV_PREFIX: Record<Role, string> = {
  Admin: 'E2E_ADMIN',
  Shipper: 'E2E_SHIPPER',
  Customer: 'E2E_CUSTOMER',
};

const ROLE_HOME_TEST_ID: Record<Role, string> = {
  Admin: TEST_IDS.ADMIN.DASHBOARD_TABLE,
  Shipper: TEST_IDS.SHIPPER.ASSIGNED_LIST,
  Customer: TEST_IDS.ORDER.CREATE_BUTTON,
};

/**
 * Reads a required environment variable and throws when it is missing or empty.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

const SLOT_ENV_SUFFIX: Record<AccountSlot, string> = {
  primary: '',
  secondary: '_2',
  tertiary: '_3',
};

/**
 * Returns the email and password configured for a role; the secondary and tertiary slots read the variables with a _2 or _3 infix.
 */
export function readCredentials(role: Role, slot: AccountSlot = 'primary'): { email: string; password: string } {
  const prefix = `${ROLE_ENV_PREFIX[role]}${SLOT_ENV_SUFFIX[slot]}`;
  return { email: requireEnv(`${prefix}_EMAIL`), password: requireEnv(`${prefix}_PASSWORD`) };
}

/**
 * Returns the email of the account configured for the role and slot.
 */
export function emailOf(role: Role, slot: AccountSlot = 'primary'): string {
  return readCredentials(role, slot).email;
}

/**
 * Opens the login screen, signing out first when a session is still active.
 */
export async function openLoginScreen(page: Page): Promise<void> {
  await page.goto(APP_PATHS.login);
  const loginEmail = page.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT);
  const logout = page.getByTestId(TEST_IDS.AUTH.LOGOUT_BUTTON);
  await expect(loginEmail.or(logout)).toBeVisible();
  if (await logout.isVisible()) {
    await logout.click();
  }
  await expect(loginEmail).toBeVisible();
}

/**
 * Fills the login form and submits it without checking the outcome.
 */
export async function submitLogin(page: Page, email: string, password: string): Promise<void> {
  await page.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT).fill(email);
  await page.getByTestId(TEST_IDS.AUTH.LOGIN_PASSWORD_INPUT).fill(password);
  await page.getByTestId(TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON).click();
}

/**
 * Logs in with explicit credentials and waits for the home screen of the given role.
 */
export async function loginWithCredentials(page: Page, role: Role, email: string, password: string): Promise<void> {
  await openLoginScreen(page);
  await submitLogin(page, email, password);
  await expect(page.getByTestId(ROLE_HOME_TEST_ID[role])).toBeVisible();
}

/**
 * Logs in with the account configured in the E2E environment variables for the role.
 */
export async function loginAs(page: Page, role: Role, slot: AccountSlot = 'primary'): Promise<void> {
  const { email, password } = readCredentials(role, slot);
  await loginWithCredentials(page, role, email, password);
}

/**
 * Signs out when the logout control is available.
 */
export async function logout(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.AUTH.LOGOUT_BUTTON).click();
  await expect(page.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT)).toBeVisible();
}

/**
 * Builds registration values that are valid, with the email unique per call and a freshly generated password.
 */
export function buildRegistration(overrides: Partial<RegistrationValues> = {}): RegistrationValues {
  return {
    fullName: 'A',
    email: buildEmail(),
    phone: '0123456789',
    password: generatePassword(8),
    ...overrides,
  };
}

/**
 * Opens the registration screen from the login screen.
 */
export async function openRegisterScreen(page: Page): Promise<void> {
  await openLoginScreen(page);
  await page.getByTestId(PENDING_TEST_IDS.AUTH.OPEN_REGISTER_LINK).click();
  await expect(page.getByTestId(TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON)).toBeVisible();
}

/**
 * Fills the registration form from the given values without submitting it.
 */
export async function fillRegistration(page: Page, values: RegistrationValues): Promise<void> {
  await page.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT).fill(values.fullName);
  await page.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT).fill(values.email);
  await page.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT).fill(values.password);
  await page.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT).fill(values.phone);
}

/**
 * Submits the registration form that is already filled.
 */
export async function submitRegistration(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON).click();
}

/**
 * Waits until registration was accepted, which lands either on the login screen or on the customer home screen.
 */
export async function expectRegistrationAccepted(page: Page): Promise<void> {
  const accepted = page
    .getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT)
    .or(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON));
  await expect(accepted).toBeVisible();
}

/**
 * Registers a new customer through the registration form and leaves the browser signed out.
 */
export async function registerCustomer(
  page: Page,
  overrides: Partial<RegistrationValues> = {},
): Promise<RegisteredCustomer> {
  const values = buildRegistration(overrides);
  await openRegisterScreen(page);
  await fillRegistration(page, values);
  await submitRegistration(page);
  await expectRegistrationAccepted(page);
  await openLoginScreen(page);
  return values;
}

/**
 * Registers a new customer and signs in as that customer.
 */
export async function signInAsNewCustomer(page: Page, overrides: Partial<RegistrationValues> = {}): Promise<RegisteredCustomer> {
  const customer = await registerCustomer(page, overrides);
  await loginWithCredentials(page, 'Customer', customer.email, customer.password);
  return customer;
}

/**
 * Asserts that logging in with the given credentials is refused and the user stays signed out.
 */
export async function expectLoginRejected(page: Page, email: string, password: string): Promise<void> {
  await openLoginScreen(page);
  await submitLogin(page, email, password);
  if (email.trim() !== '') {
    await expect(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
  }
  await expect(page.getByTestId(TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON)).toBeVisible();
  await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveCount(0);
}

/**
 * Registers with the given values and returns after the submit without checking the outcome.
 */
export async function attemptRegistration(page: Page, values: RegistrationValues): Promise<void> {
  await openRegisterScreen(page);
  await fillRegistration(page, values);
  await submitRegistration(page);
}
