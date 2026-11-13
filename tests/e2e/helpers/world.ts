import { test as base, type Browser, type BrowserContext, type Page } from '@playwright/test';
import {
  FAILED_DELIVERY_LIMIT,
  INCIDENT_TYPE,
  ORDER_STATUS,
  type OrderStatusName,
} from './constants';
import {
  assignOrderToShipper,
  createOrder,
  shipperDeliver,
  shipperPickUp,
  type OrderDraft,
} from './flows';
import { adminConfirmReturnedGoods, adminMoveToReturning, reportIncident } from './issue-flows';
import { requestReturn } from './return-flows';
import { loginAs, signInAsNewCustomer, type AccountSlot, type RegisteredCustomer } from './session';

export type StaffRole = 'Admin' | 'Shipper';

export interface Customer extends RegisteredCustomer {
  page: Page;
}

export interface DriveOptions {
  slot?: AccountSlot;
  failedDeliveries?: number;
}

/**
 * Holds the isolated browser sessions of one test and drives orders through their lifecycle across them.
 */
export class World {
  private readonly contexts: BrowserContext[] = [];
  private readonly staffPages = new Map<string, Page>();

  private readonly browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  /**
   * Opens a page in a new isolated context; the test runner gives the context the project options (base address, device, trace).
   */
  async newPage(): Promise<Page> {
    const context = await this.browser.newContext();
    this.contexts.push(context);
    return context.newPage();
  }

  async staff(role: StaffRole, slot: AccountSlot = 'primary'): Promise<Page> {
    const key = `${role}:${slot}`;
    const cached = this.staffPages.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const page = await this.newPage();
    await loginAs(page, role, slot);
    this.staffPages.set(key, page);
    return page;
  }

  admin(): Promise<Page> {
    return this.staff('Admin');
  }

  secondAdmin(): Promise<Page> {
    return this.staff('Admin', 'secondary');
  }

  shipperA(): Promise<Page> {
    return this.staff('Shipper');
  }

  shipperB(): Promise<Page> {
    return this.staff('Shipper', 'secondary');
  }

  unassignedShipper(): Promise<Page> {
    return this.staff('Shipper', 'tertiary');
  }

  async newCustomer(): Promise<Customer> {
    const page = await this.newPage();
    const customer = await signInAsNewCustomer(page);
    return { ...customer, page };
  }

  async placeOrder(customer: Customer, draft?: OrderDraft): Promise<string> {
    return createOrder(customer.page, draft);
  }

  async assign(code: string, slot: AccountSlot = 'primary'): Promise<void> {
    await assignOrderToShipper(await this.admin(), code, slot);
  }

  async pickUp(code: string, slot: AccountSlot = 'primary'): Promise<void> {
    await shipperPickUp(await this.staff('Shipper', slot), code);
  }

  async deliver(code: string, slot: AccountSlot = 'primary'): Promise<void> {
    await shipperDeliver(await this.staff('Shipper', slot), code);
  }

  async report(code: string, type: string, slot: AccountSlot = 'primary'): Promise<void> {
    await reportIncident(await this.staff('Shipper', slot), code, type);
  }

  private async runFailedDeliveries(code: string, slot: AccountSlot, count: number): Promise<void> {
    for (let attempt = 0; attempt < count; attempt += 1) {
      await this.pickUp(code, slot);
      await this.report(code, INCIDENT_TYPE.FAILED_DELIVERY, slot);
    }
  }

  /**
   * Moves a freshly placed order to the target status through the screens of the roles involved.
   * For delivering and delivered, failedDeliveries is the number of failed deliveries before the last handover.
   */
  async driveTo(code: string, target: OrderStatusName, options: DriveOptions = {}): Promise<void> {
    const slot = options.slot ?? 'primary';
    if (target === ORDER_STATUS.PENDING) {
      return;
    }
    await this.assign(code, slot);
    switch (target) {
      case ORDER_STATUS.AWAITING_PICKUP:
        return;
      case ORDER_STATUS.DELIVERING:
        await this.runFailedDeliveries(code, slot, options.failedDeliveries ?? 0);
        await this.pickUp(code, slot);
        return;
      case ORDER_STATUS.DELIVERED:
        await this.runFailedDeliveries(code, slot, options.failedDeliveries ?? 0);
        await this.pickUp(code, slot);
        await this.deliver(code, slot);
        return;
      case ORDER_STATUS.FAILED_DELIVERY:
        await this.runFailedDeliveries(code, slot, options.failedDeliveries ?? 1);
        return;
      case ORDER_STATUS.DAMAGED:
        await this.pickUp(code, slot);
        await this.report(code, INCIDENT_TYPE.DAMAGED, slot);
        return;
      case ORDER_STATUS.LOST:
        await this.pickUp(code, slot);
        await this.report(code, INCIDENT_TYPE.LOST, slot);
        return;
      case ORDER_STATUS.RETURNING:
      case ORDER_STATUS.RETURNED_TO_SELLER:
        await this.runFailedDeliveries(code, slot, FAILED_DELIVERY_LIMIT);
        await adminMoveToReturning(await this.admin(), code);
        if (target === ORDER_STATUS.RETURNED_TO_SELLER) {
          await adminConfirmReturnedGoods(await this.admin(), code);
        }
        return;
    }
  }

  /**
   * Registers a new customer, places an order and drives it to the target status.
   */
  async orderAt(
    target: OrderStatusName,
    options: DriveOptions = {},
    customer?: Customer,
  ): Promise<{ customer: Customer; code: string }> {
    const owner = customer ?? (await this.newCustomer());
    const code = await this.placeOrder(owner);
    await this.driveTo(code, target, options);
    return { customer: owner, code };
  }

  /**
   * Places an order, drives it to delivered and sends a return request for it as its customer.
   */
  async orderWithReturn(
    reason: string,
    notes: string | null = null,
    customer?: Customer,
  ): Promise<{ customer: Customer; code: string }> {
    const placed = await this.orderAt(ORDER_STATUS.DELIVERED, {}, customer);
    await requestReturn(placed.customer.page, placed.code, reason, notes);
    return placed;
  }

  async dispose(): Promise<void> {
    for (const context of this.contexts) {
      await context.close();
    }
  }
}

export const test = base.extend<{ world: World }>({
  world: async ({ browser }, use) => {
    const world = new World(browser);
    await use(world);
    await world.dispose();
  },
});

export { expect } from '@playwright/test';
