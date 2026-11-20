import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../../src/constants/test-ids';
import { ORDER_STATUS } from './helpers/constants';
import { repeatChar } from './helpers/data';
import {
  buildOrderDraft,
  confirmReviewedOrder,
  createOrder,
  enterOrder,
  enterOrderUntilRejected,
  expectNoSavedOrder,
  expectOrderFieldRejected,
  expectOrderStatus,
  expectReviewShows,
  goToNextStep,
  historyEntries,
  expectHistoryEntry,
  openOrderByCode,
  openOrderCreation,
  readOptionLabels,
  readSelectedProductLabel,
} from './helpers/flows';
import { signInAsNewCustomer } from './helpers/session';

test.describe('Order creation fields', () => {
  test('lists the store products on the order creation screen and lets the customer pick one', async ({ page }) => {
    await signInAsNewCustomer(page);
    await openOrderCreation(page);
    const select = page.getByTestId(TEST_IDS.ORDER.STEP_PRODUCT).getByTestId(TEST_IDS.ORDER.PRODUCT_SELECT).first();
    await expect(select).toBeVisible();
    await expect.poll(() => readOptionLabels(select)).not.toHaveLength(0);
    const listedProducts = await readOptionLabels(select);
    await select.selectOption({ index: 1 });
    expect(listedProducts).toContain(await readSelectedProductLabel(select));
  });

  test('accepts an order with one product line and shows it again for review', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft();
    const labels = await enterOrder(page, draft);
    await expectReviewShows(page, draft, labels);
  });

  test('accepts an order with two different products and shows both lines for review', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({
      lines: [
        { product: 1, quantity: '1' },
        { product: 2, quantity: '1' },
      ],
    });
    const labels = await enterOrder(page, draft);
    await expectReviewShows(page, draft, labels);
  });

  test('rejects an order that lists the same product on two lines', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(
      page,
      buildOrderDraft({
        lines: [
          { product: 1, quantity: '1' },
          { product: 1, quantity: '1' },
        ],
      }),
    );
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.PRODUCT_ERROR);
    await expectNoSavedOrder(page);
  });

  test('accepts a quantity of 1', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ lines: [{ product: 1, quantity: '1' }] });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('accepts a quantity of 2', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ lines: [{ product: 1, quantity: '2' }] });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('accepts a quantity of 1000 because there is no upper limit', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ lines: [{ product: 1, quantity: '1000' }] });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('accepts a one-character recipient name', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ recipientName: 'A' });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('accepts a recipient name of 100 characters', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ recipientName: repeatChar('a', 100) });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('rejects a recipient name longer than 100 characters', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientName: repeatChar('a', 101) }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_NAME_ERROR);
    await expectNoSavedOrder(page);
  });

  test('accepts a recipient phone number of 10 digits starting with 0', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ recipientPhone: '0123456789' });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('accepts a second valid recipient phone number', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ recipientPhone: '0912345678' });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('accepts a one-character delivery address', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ deliveryAddress: 'A' });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('accepts a delivery address of 255 characters', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ deliveryAddress: repeatChar('a', 255) });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('rejects a delivery address longer than 255 characters', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ deliveryAddress: repeatChar('a', 256) }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.DELIVERY_ADDRESS_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects an order without any product line', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ lines: [] }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.PRODUCT_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects an order whose quantity is left empty', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ lines: [{ product: 1, quantity: '' }] }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.QUANTITY_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects an order whose recipient name is left empty', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientName: '' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_NAME_ERROR);
    await expectNoSavedOrder(page);
  });

  test('treats a whitespace-only recipient name as missing', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientName: '   ' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_NAME_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects an order whose recipient phone number is left empty', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientPhone: '' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects an order whose delivery address is left empty', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ deliveryAddress: '' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.DELIVERY_ADDRESS_ERROR);
    await expectNoSavedOrder(page);
  });

  test('treats a whitespace-only delivery address as missing', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ deliveryAddress: '   ' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.DELIVERY_ADDRESS_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a quantity of zero', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ lines: [{ product: 1, quantity: '0' }] }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.QUANTITY_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a negative quantity', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ lines: [{ product: 1, quantity: '-1' }] }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.QUANTITY_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a decimal quantity', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ lines: [{ product: 1, quantity: '1.5' }] }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.QUANTITY_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a quantity written as text', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ lines: [{ product: 1, quantity: 'abc' }] }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.QUANTITY_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a recipient phone number of 9 digits', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientPhone: '091234567' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a recipient phone number of 11 digits', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientPhone: '09123456789' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a recipient phone number that does not start with 0', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientPhone: '1912345678' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR);
    await expectNoSavedOrder(page);
  });

  test('rejects a recipient phone number that contains a letter', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientPhone: '09123a5678' }));
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR);
    await expectNoSavedOrder(page);
  });
});

test.describe('Order review and confirmation', () => {
  test('shows a two-line order exactly as entered before it is saved', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({
      lines: [
        { product: 1, quantity: '1' },
        { product: 2, quantity: '1' },
      ],
    });
    const labels = await enterOrder(page, draft);
    await expectReviewShows(page, draft, labels);
    await expectNoSavedOrder(page);
  });

  test('shows the longest recipient name and delivery address exactly as entered before saving', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({ recipientName: repeatChar('a', 100), deliveryAddress: repeatChar('a', 255) });
    await enterOrder(page, draft);
    await expectReviewShows(page, draft);
  });

  test('offers confirming, editing or cancelling once the order is shown again', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrder(page, buildOrderDraft());
    await expect(page.getByTestId(TEST_IDS.ORDER.SUBMIT_ORDER_BUTTON)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ORDER.EDIT_BUTTON)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.ORDER.CANCEL_ORDER_CREATION_BUTTON)).toBeVisible();
  });

  test('moves on to saving the order when the customer confirms it', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrder(page, buildOrderDraft());
    const code = await confirmReviewedOrder(page);
    expect(code).not.toBe('');
  });

  test('returns to the entered data for editing and shows the corrected quantity after review', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrder(page, buildOrderDraft());
    await page.getByTestId(TEST_IDS.ORDER.EDIT_BUTTON).click();
    const productStep = page.getByTestId(TEST_IDS.ORDER.STEP_PRODUCT);
    await expect(productStep).toBeVisible();
    await expect(productStep.getByTestId(TEST_IDS.ORDER.QUANTITY_INPUT).first()).toHaveValue('1');
    await productStep.getByTestId(TEST_IDS.ORDER.QUANTITY_INPUT).first().fill('2');
    await goToNextStep(page, 'product');
    await expect(page.getByTestId(TEST_IDS.ORDER.STEP_RECIPIENT).getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_INPUT)).toHaveValue('A');
    await goToNextStep(page, 'recipient');
    await expectReviewShows(page, buildOrderDraft({ lines: [{ product: 1, quantity: '2' }] }));
  });

  test('saves nothing when the customer cancels order creation at the review step', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrder(page, buildOrderDraft());
    await page.getByTestId(TEST_IDS.ORDER.CANCEL_ORDER_CREATION_BUTTON).click();
    await expectNoSavedOrder(page);
  });
});

test.describe('Order saving', () => {
  test('saves a confirmed order with a code and the pending status', async ({ page }) => {
    await signInAsNewCustomer(page);
    const code = await createOrder(page);
    await openOrderByCode(page, code);
    await expect(page.getByTestId(TEST_IDS.ORDER.DETAILS_CODE)).toContainText(code);
    await expectOrderStatus(page, ORDER_STATUS.PENDING);
  });

  test('saves a two-line order with its recipient, address and the pending status', async ({ page }) => {
    await signInAsNewCustomer(page);
    const draft = buildOrderDraft({
      lines: [
        { product: 1, quantity: '1' },
        { product: 2, quantity: '1' },
      ],
    });
    const code = await createOrder(page, draft);
    await openOrderByCode(page, code);
    await expect(page.getByTestId(TEST_IDS.ORDER.DETAILS_LINE)).toHaveCount(2);
    const details = page.getByTestId(TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER);
    await expect(details).toContainText(draft.recipientName);
    await expect(details).toContainText(draft.deliveryAddress);
    await expectOrderStatus(page, ORDER_STATUS.PENDING);
  });

  test('gives two consecutive orders of the same customer different order codes', async ({ page }) => {
    await signInAsNewCustomer(page);
    const first = await createOrder(page);
    const second = await createOrder(page);
    expect(second).not.toBe(first);
  });

  test('records one first history entry made by the customer when an order is created', async ({ page }) => {
    const customer = await signInAsNewCustomer(page);
    const code = await createOrder(page);
    await openOrderByCode(page, code);
    await expect(historyEntries(page)).toHaveCount(1);
    await expectHistoryEntry(historyEntries(page).first(), {
      actorEmail: customer.email,
      oldStatus: '',
      newStatus: ORDER_STATUS.PENDING,
    });
  });

  test('records the second customer as the creator in the first history entry of their order', async ({ page }) => {
    const customer = await signInAsNewCustomer(page);
    const code = await createOrder(page);
    await openOrderByCode(page, code);
    await expectHistoryEntry(historyEntries(page).first(), {
      actorEmail: customer.email,
      oldStatus: '',
      newStatus: ORDER_STATUS.PENDING,
    });
  });

  test('shows a success notice with the code of the order that was just saved', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrder(page, buildOrderDraft());
    await page.getByTestId(TEST_IDS.ORDER.SUBMIT_ORDER_BUTTON).click();
    await expect(page.getByTestId(TEST_IDS.ORDER.SUCCESS_MESSAGE)).toBeVisible();
    const shownCode = (await page.getByTestId(TEST_IDS.ORDER.SUCCESS_CODE).textContent())?.trim() ?? '';
    expect(shownCode).not.toBe('');
    await openOrderByCode(page, shownCode);
    await expect(page.getByTestId(TEST_IDS.ORDER.DETAILS_CODE)).toContainText(shownCode);
  });
});

test.describe('Order creation errors and recovery', () => {
  test('points to the missing recipient name when it is left empty', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientName: '' }));
    await expect(page.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_ERROR)).toBeVisible();
  });

  test('points to the recipient phone number when it is one digit short', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientPhone: '091234567' }));
    await expect(page.getByTestId(TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR)).toBeVisible();
  });

  test('points to the quantity when it breaks the constraint', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ lines: [{ product: 1, quantity: '0' }] }));
    await expect(page.getByTestId(TEST_IDS.ORDER.QUANTITY_ERROR)).toBeVisible();
  });

  test('goes back to review without errors once the missing recipient name is filled in', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientName: '' }));
    await expect(page.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_ERROR)).toBeVisible();
    await page.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_INPUT).fill('A');
    await goToNextStep(page, 'recipient');
    await expectReviewShows(page, buildOrderDraft());
  });

  test('keeps pointing to the phone number when the corrected value is still wrong', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientPhone: '091234567' }));
    await expect(page.getByTestId(TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR)).toBeVisible();
    await page.getByTestId(TEST_IDS.ORDER.RECIPIENT_PHONE_INPUT).fill('09123456789');
    await goToNextStep(page, 'recipient');
    await expectOrderFieldRejected(page, TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR);
    await expectNoSavedOrder(page);
  });

  test('saves nothing when the customer cancels after an error', async ({ page }) => {
    await signInAsNewCustomer(page);
    await enterOrderUntilRejected(page, buildOrderDraft({ recipientName: '' }));
    await expect(page.getByTestId(TEST_IDS.ORDER.RECIPIENT_NAME_ERROR)).toBeVisible();
    await page.getByTestId(TEST_IDS.ORDER.CANCEL_ORDER_CREATION_BUTTON).click();
    await expectNoSavedOrder(page);
  });
});
