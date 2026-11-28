import { getOrderStatusMeta, type OrderStatusCode } from '@/constants/status-map';
import type {
  DeliveryIssue,
  Order,
  ReturnRequest,
  StatusHistoryEntry,
} from '@/types/api';

interface CachedOrderMeta {
  id: string;
  code: string;
  customerId: string;
}

const orderMetaCache = new Map<string, CachedOrderMeta>();

// Resolves the display code of an order, falling back to its unique identifier.
export function getOrderCode(order: Pick<Order, 'id' | 'code'>): string {
  const trimmed = order.code?.trim();
  return trimmed ? trimmed : order.id;
}

// Resolves the display code of a return request.
export function getReturnCode(request: Pick<ReturnRequest, 'id' | 'code'>): string {
  const trimmed = request.code?.trim();
  return trimmed ? trimmed : request.id;
}

// Resolves the associated order code of a return request.
export function getReturnOrderCode(request: Pick<ReturnRequest, 'orderId' | 'orderCode'>): string {
  const trimmed = request.orderCode?.trim();
  return trimmed ? trimmed : request.orderId;
}

// Resolves the display code of a delivery issue.
export function getIssueCode(issue: Pick<DeliveryIssue, 'id' | 'code'>): string {
  const trimmed = issue.code?.trim();
  return trimmed ? trimmed : issue.id;
}

// Resolves the associated order code of a delivery issue.
export function getIssueOrderCode(issue: Pick<DeliveryIssue, 'orderId' | 'orderCode'>): string {
  const trimmed = issue.orderCode?.trim();
  return trimmed ? trimmed : issue.orderId;
}

// Finds the timestamp when an order reached DELIVERED status.
export function getDeliveredTimestamp(order: Order): string | null {
  const history = order.history ?? [];
  const deliveredEntries = sortStatusHistoryAsc(history).filter(
    (entry) => entry.newStatus === 'DELIVERED'
  );
  if (deliveredEntries.length > 0) {
    return deliveredEntries[deliveredEntries.length - 1].changedAt;
  }
  if (order.status === 'DELIVERED' && order.updatedAt) {
    return order.updatedAt;
  }
  return null;
}

// Sorts status history entries chronologically from oldest to newest.
export function sortStatusHistoryAsc(entries: StatusHistoryEntry[]): StatusHistoryEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const timeA = Date.parse(a.entry.changedAt);
      const timeB = Date.parse(b.entry.changedAt);
      if (Number.isNaN(timeA) || Number.isNaN(timeB) || timeA === timeB) {
        return a.index - b.index;
      }
      return timeA - timeB;
    })
    .map((item) => item.entry);
}

// Caches basic order identity metadata in memory for real-time lookup reuse.
export function rememberOrder(order: Pick<Order, 'id' | 'code' | 'customerId'>): void {
  const code = getOrderCode(order);
  const meta: CachedOrderMeta = {
    id: order.id,
    code,
    customerId: order.customerId,
  };
  orderMetaCache.set(order.id, meta);
  orderMetaCache.set(code, meta);
}

// Caches a list of orders in memory for real-time lookup reuse.
export function rememberOrders(orders: Array<Pick<Order, 'id' | 'code' | 'customerId'>>): void {
  for (const order of orders) {
    rememberOrder(order);
  }
}

// Looks up cached order metadata by identifier or code.
export function getCachedOrderMeta(identifier: string): CachedOrderMeta | undefined {
  return orderMetaCache.get(identifier);
}

// Clears the in-memory order metadata cache.
export function clearOrderMetaCache(): void {
  orderMetaCache.clear();
}

// Formats a human-readable order transition text in Vietnamese.
export function formatStatusTransitionText(
  oldStatus: OrderStatusCode | null,
  newStatus: OrderStatusCode
): string {
  const newLabel = getOrderStatusMeta(newStatus).labelVi;
  if (!oldStatus) {
    return newLabel;
  }
  const oldLabel = getOrderStatusMeta(oldStatus).labelVi;
  return `${oldLabel} → ${newLabel}`;
}
