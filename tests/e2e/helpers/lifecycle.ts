import { expect, type Page } from '@playwright/test';
import { expectHistoryEntry, historyEntries, openOrderByCode, expectOrderStatus } from './flows';
import { expectNoMoneyHandling } from './nfr-flows';
import { emailOf } from './session';
import type { Customer } from './world';

export type Actor = 'Customer' | 'Admin' | 'Shipper';

export interface LifecycleStep {
  oldStatus: string;
  newStatus: string;
  actor: Actor;
}

function actorEmail(customer: Customer, actor: Actor): string {
  return actor === 'Customer' ? customer.email : emailOf(actor);
}

/**
 * Opens the order as its customer and asserts the whole history: one entry per step with actor, old status and new status.
 */
export async function expectLifecycle(customer: Customer, code: string, steps: LifecycleStep[]): Promise<void> {
  const page: Page = customer.page;
  await openOrderByCode(page, code);
  await expectOrderStatus(page, steps[steps.length - 1].newStatus);
  await expect(historyEntries(page)).toHaveCount(steps.length);
  for (const [position, step] of steps.entries()) {
    await expectHistoryEntry(historyEntries(page).nth(position), {
      oldStatus: step.oldStatus,
      newStatus: step.newStatus,
      actorEmail: actorEmail(customer, step.actor),
    });
  }
  await expectNoMoneyHandling(page);
}

/**
 * Runs one lifecycle action, records its history step and asserts the whole history afterwards.
 */
export async function advance(
  customer: Customer,
  code: string,
  steps: LifecycleStep[],
  step: LifecycleStep | null,
  action: () => Promise<void>,
): Promise<void> {
  await action();
  if (step !== null) {
    steps.push(step);
  }
  await expectLifecycle(customer, code, steps);
}
