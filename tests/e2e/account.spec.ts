import { expect } from '@playwright/test';
import { TEST_IDS } from '../../src/constants/test-ids';
import { buildEmailOfLength, generatePassword, repeatChar } from './helpers/data';
import { APP_PATHS } from './helpers/flows';
import {
  attemptRegistration,
  buildRegistration,
  expectLoginRejected,
  fillRegistration,
  loginAs,
  loginWithCredentials,
  logout,
  openLoginScreen,
  openRegisterScreen,
  registerCustomer,
  requireEnv,
  signInAsNewCustomer,
  submitLogin,
  submitRegistration,
} from './helpers/session';
import { test } from './helpers/world';

const AUTH_ERRORS = TEST_IDS.AUTH;
const ACCOUNT_VIEW = TEST_IDS.COMMON;

test.describe('Account registration', () => {
  test('registers a customer with valid details and shows the entered name, email and phone after login', async ({ page }) => {
    const values = buildRegistration();
    await signInAsNewCustomer(page, values);
    await expect(page.getByTestId(ACCOUNT_VIEW.ACCOUNT_FULLNAME)).toHaveText(values.fullName);
    await expect(page.getByTestId(ACCOUNT_VIEW.ACCOUNT_EMAIL)).toHaveText(values.email);
    await expect(page.getByTestId(ACCOUNT_VIEW.ACCOUNT_PHONE)).toHaveText(values.phone);
  });

  test('registers a customer with every field at its maximum length without truncating name and email', async ({ page }) => {
    const values = buildRegistration({
      fullName: repeatChar('a', 100),
      email: buildEmailOfLength(254),
      password: generatePassword(64),
      phone: '0912345678',
    });
    await signInAsNewCustomer(page, values);
    await expect(page.getByTestId(ACCOUNT_VIEW.ACCOUNT_FULLNAME)).toHaveText(values.fullName);
    await expect(page.getByTestId(ACCOUNT_VIEW.ACCOUNT_EMAIL)).toHaveText(values.email);
  });

  test('lets a newly registered customer log in with the registered email and password', async ({ page }) => {
    const customer = await registerCustomer(page);
    await loginWithCredentials(page, 'Customer', customer.email, customer.password);
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toBeVisible();
  });

  test('accepts a one-character full name', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration({ fullName: 'A' }));
  });

  test('accepts a full name of 100 characters', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration({ fullName: repeatChar('a', 100) }));
  });

  test('rejects a full name longer than 100 characters', async ({ page }) => {
    const values = buildRegistration({ fullName: repeatChar('a', 101) });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_FULLNAME_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('asks for the full name when it is left empty', async ({ page }) => {
    const values = buildRegistration({ fullName: '' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_FULLNAME_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('treats a whitespace-only full name as missing', async ({ page }) => {
    const values = buildRegistration({ fullName: '   ' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_FULLNAME_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('asks for the email when it is left empty', async ({ page }) => {
    const values = buildRegistration({ email: '' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_EMAIL_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('treats a whitespace-only email as missing', async ({ page }) => {
    const values = buildRegistration({ email: '   ' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_EMAIL_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('asks for the password when it is left empty', async ({ page }) => {
    const values = buildRegistration({ password: '' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PASSWORD_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('treats a password made only of spaces as missing', async ({ page }) => {
    const values = buildRegistration({ password: ' '.repeat(8) });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PASSWORD_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('asks for the phone number when it is left empty', async ({ page }) => {
    const values = buildRegistration({ phone: '' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PHONE_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('treats a whitespace-only phone number as missing', async ({ page }) => {
    const values = buildRegistration({ phone: '   ' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PHONE_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('accepts a well-formed email', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration());
  });

  test('accepts an email of 254 characters and stores it untruncated', async ({ page }) => {
    const values = buildRegistration({ email: buildEmailOfLength(254) });
    await signInAsNewCustomer(page, values);
    await expect(page.getByTestId(ACCOUNT_VIEW.ACCOUNT_EMAIL)).toHaveText(values.email);
  });

  test('rejects an email of 255 characters', async ({ page }) => {
    const values = buildRegistration({ email: buildEmailOfLength(255) });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_EMAIL_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('rejects an email without an at sign', async ({ page }) => {
    const values = buildRegistration({ email: 'khach.moi01example.com' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_EMAIL_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('accepts an email that has no account yet', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration());
  });

  test('rejects an email already used by another customer', async ({ page }) => {
    const existing = await registerCustomer(page);
    await attemptRegistration(page, buildRegistration({ email: existing.email }));
    await expect(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveCount(0);
  });

  test('rejects a duplicate email written with surrounding spaces and different letter case', async ({ page }) => {
    const existing = await registerCustomer(page);
    await attemptRegistration(page, buildRegistration({ email: `  ${existing.email.toUpperCase()} ` }));
    await expect(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveCount(0);
  });

  test('rejects a duplicate email that differs only in letter case', async ({ page }) => {
    const existing = await registerCustomer(page);
    await attemptRegistration(page, buildRegistration({ email: existing.email.toUpperCase() }));
    await expect(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveCount(0);
  });

  test('rejects the email of the seeded admin account', async ({ page }) => {
    await attemptRegistration(page, buildRegistration({ email: requireEnv('E2E_ADMIN_EMAIL') }));
    await expect(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveCount(0);
  });

  test('creates only one account when two sessions register the same email at once', async ({ world }) => {
    const values = buildRegistration();
    const pages = [await world.newPage(), await world.newPage()];
    for (const page of pages) {
      await openRegisterScreen(page);
      await fillRegistration(page, values);
    }
    await Promise.all(pages.map((page) => submitRegistration(page)));
    for (const page of pages) {
      const outcome = page
        .getByTestId(TEST_IDS.COMMON.ERROR_BANNER)
        .or(page.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT))
        .or(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON));
      await expect(outcome).toBeVisible();
    }
    const bannerStates = await Promise.all(pages.map((page) => page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER).isVisible()));
    expect(bannerStates.filter(Boolean)).toHaveLength(1);
    await loginWithCredentials(pages[0], 'Customer', values.email, values.password);
  });

  test('keeps the old password working after a duplicate registration is rejected', async ({ page }) => {
    const owner = await registerCustomer(page);
    let otherPassword = generatePassword(8);
    while (otherPassword === owner.password) {
      otherPassword = generatePassword(8);
    }
    await attemptRegistration(page, buildRegistration({ email: owner.email, password: otherPassword }));
    await expect(page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    await loginWithCredentials(page, 'Customer', owner.email, owner.password);
    await logout(page);
    await expectLoginRejected(page, owner.email, otherPassword);
  });

  test('accepts an 8-character password', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration({ password: generatePassword(8) }));
  });

  test('accepts a 64-character password', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration({ password: generatePassword(64) }));
  });

  test('rejects a 7-character password', async ({ page }) => {
    const values = buildRegistration({ password: generatePassword(7, 'lowercase') });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PASSWORD_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('rejects a 65-character password', async ({ page }) => {
    const values = buildRegistration({ password: generatePassword(65, 'lowercase') });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PASSWORD_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('accepts a password made only of lowercase letters', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration({ password: generatePassword(8, 'lowercase') }));
  });

  test('accepts a phone number of 10 digits starting with 0', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration({ phone: '0123456789' }));
  });

  test('accepts a second valid phone number', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration({ phone: '0912345678' }));
  });

  test('rejects a phone number of 9 digits', async ({ page }) => {
    const values = buildRegistration({ phone: '091234567' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PHONE_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('rejects a phone number of 11 digits', async ({ page }) => {
    const values = buildRegistration({ phone: '09123456789' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PHONE_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('rejects a phone number that does not start with 0', async ({ page }) => {
    const values = buildRegistration({ phone: '1912345678' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PHONE_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('rejects a phone number that contains a letter', async ({ page }) => {
    const values = buildRegistration({ phone: '09123a5678' });
    await attemptRegistration(page, values);
    await expect(page.getByTestId(AUTH_ERRORS.REGISTER_PHONE_ERROR)).toBeVisible();
    await expectLoginRejected(page, values.email, values.password);
  });

  test('gives a newly registered customer only customer screens', async ({ page }) => {
    await signInAsNewCustomer(page, buildRegistration());
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE)).toHaveCount(0);
    await expect(page.getByTestId(TEST_IDS.SHIPPER.ASSIGNED_LIST)).toHaveCount(0);
  });
});

test.describe('Account login', () => {
  test('logs in a customer with the correct email and password', async ({ page }) => {
    const customer = await registerCustomer(page);
    await loginWithCredentials(page, 'Customer', customer.email, customer.password);
    await expect(page.getByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE)).toHaveCount(0);
  });

  test('logs in a customer whose password has the maximum length', async ({ page }) => {
    const customer = await registerCustomer(page, { password: generatePassword(64) });
    await loginWithCredentials(page, 'Customer', customer.email, customer.password);
  });

  test('logs in with an email written in a different letter case', async ({ page }) => {
    const customer = await registerCustomer(page);
    await loginWithCredentials(page, 'Customer', customer.email.toUpperCase(), customer.password);
  });

  test('logs in with an email that has surrounding spaces and a different letter case', async ({ page }) => {
    const customer = await registerCustomer(page);
    await loginWithCredentials(page, 'Customer', `  ${customer.email.toUpperCase()} `, customer.password);
  });

  test('logs in the seeded admin and shows the admin screens', async ({ page }) => {
    await loginAs(page, 'Admin');
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveCount(0);
  });

  test('logs in the seeded shipper and shows the shipper screens', async ({ page }) => {
    await loginAs(page, 'Shipper');
    await expect(page.getByTestId(TEST_IDS.ORDER.CREATE_BUTTON)).toHaveCount(0);
  });

  test('refuses login for an email that has no account', async ({ page }) => {
    await expectLoginRejected(page, 'khong.ton.tai@example.com', generatePassword(12));
  });

  test('refuses login with a wrong password', async ({ page }) => {
    const customer = await registerCustomer(page);
    await expectLoginRejected(page, customer.email, generatePassword(12));
  });

  test('refuses login with a wrong email and the correct password', async ({ page }) => {
    const customer = await registerCustomer(page);
    await expectLoginRejected(page, 'khong.ton.tai@example.com', customer.password);
  });

  test('shows the same failure message for an unknown email, a wrong password and both wrong', async ({ page }) => {
    const customer = await registerCustomer(page);
    const attempts: Array<[string, string]> = [
      ['khong.ton.tai@example.com', generatePassword(12)],
      [customer.email, generatePassword(12)],
      ['khong.ton.tai@example.com', generatePassword(12)],
    ];
    const messages: string[] = [];
    for (const [email, password] of attempts) {
      await openLoginScreen(page);
      await submitLogin(page, email, password);
      const banner = page.getByTestId(TEST_IDS.COMMON.ERROR_BANNER);
      await expect(banner).toBeVisible();
      messages.push((await banner.textContent()) ?? '');
    }
    expect(messages[1]).toBe(messages[0]);
    expect(messages[2]).toBe(messages[0]);
  });

  test('blocks a protected screen opened by address after a failed login', async ({ page }) => {
    await expectLoginRejected(page, 'khong.ton.tai@example.com', generatePassword(12));
    await page.goto(APP_PATHS.orderList);
    await expect(page.getByTestId(TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ORDER.ORDER_LIST_ITEM)).toHaveCount(0);
  });
});
