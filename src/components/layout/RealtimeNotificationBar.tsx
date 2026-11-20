import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { apiClient } from '@/api/client';
import { getOrderStatusMeta } from '@/constants/status-map';
import { TEST_IDS } from '@/constants/test-ids';
import type { UserProfile } from '@/types/api';
import { realtimeClient, type OrderStatusChangedEventPayload } from '@/realtime/event-client';
import { formatDateTimeVi } from '@/utils/date';
import { getCachedOrderMeta, getOrderCode, rememberOrder } from '@/utils/order';

interface StatusNotificationItem {
  key: string;
  orderCode: string;
  message: string;
  timestamp: string;
}

const pendingOrderLookups = new Map<string, Promise<{ code: string; customerId: string } | null>>();

async function resolveNotificationTarget(
  payload: OrderStatusChangedEventPayload,
  currentUserId: string
): Promise<{ code: string; customerId: string } | null> {
  const cached = getCachedOrderMeta(payload.orderId);
  const directOwnerId = payload.customerId ?? cached?.customerId;
  if (directOwnerId && directOwnerId !== currentUserId) {
    return null;
  }

  const directCode = payload.orderCode?.trim() || payload.code?.trim() || cached?.code;
  if (directCode && directOwnerId === currentUserId) {
    return { code: directCode, customerId: directOwnerId };
  }

  let lookup = pendingOrderLookups.get(payload.orderId);
  if (!lookup) {
    lookup = apiClient
      .getOrderDetail(payload.orderId)
      .then((order) => {
        rememberOrder(order);
        return { code: getOrderCode(order), customerId: order.customerId };
      })
      .catch(() => null)
      .finally(() => {
        pendingOrderLookups.delete(payload.orderId);
      });
    pendingOrderLookups.set(payload.orderId, lookup);
  }

  const resolved = await lookup;
  if (!resolved || resolved.customerId !== currentUserId) {
    return null;
  }
  return resolved;
}

interface RealtimeNotificationBarProps {
  token: string | null;
  user: UserProfile | null;
}

// Displays in-app status transition notifications across all customer screens.
export const RealtimeNotificationBar: React.FC<RealtimeNotificationBarProps> = ({
  token,
  user,
}) => {
  const [notifications, setNotifications] = useState<StatusNotificationItem[]>([]);

  useEffect(() => {
    if (!token || user?.role !== 'Customer') {
      setNotifications([]);
      return;
    }

    let isMounted = true;
    const unsubscribe = realtimeClient.subscribe('order.status_changed', (payload) => {
      void (async () => {
        const target = await resolveNotificationTarget(payload, user.id);
        if (!isMounted || !target) {
          return;
        }

        const key = `${payload.orderId}-${payload.newStatus}-${payload.changedAt}`;
        const newLabel = getOrderStatusMeta(payload.newStatus)?.labelVi ?? payload.newStatus;
        const oldLabel = payload.oldStatus
          ? getOrderStatusMeta(payload.oldStatus)?.labelVi ?? payload.oldStatus
          : '';
        const transition = oldLabel ? `${oldLabel} → ${newLabel}` : newLabel;

        setNotifications((prev) => {
          if (prev.some((item) => item.key === key)) {
            return prev;
          }
          return [
            {
              key,
              orderCode: target.code,
              message: `Đơn hàng ${target.code} đã cập nhật trạng thái: ${transition}`,
              timestamp: formatDateTimeVi(payload.changedAt),
            },
            ...prev,
          ];
        });
      })();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [token, user?.id, user?.role]);

  if (!token || user?.role !== 'Customer' || notifications.length === 0) {
    return null;
  }

  return (
    <section
      aria-live="polite"
      aria-label="Thông báo cập nhật đơn hàng"
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3 space-y-2"
    >
      {notifications.map((item) => (
        <div
          key={item.key}
          role="status"
          data-testid={TEST_IDS.COMMON.NOTIFICATION}
          className="bg-card border border-mint-tertiary/35 rounded-xl px-4 py-2.5 shadow-sm flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex items-center gap-2.5 text-mint-primary min-w-0">
            <Bell className="w-4 h-4 text-mint-tertiary flex-shrink-0" />
            <span className="font-medium truncate">{item.message}</span>
            <span className="text-xs font-mono text-mint-secondary flex-shrink-0">
              {item.timestamp}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              setNotifications((prev) => prev.filter((candidate) => candidate.key !== item.key))
            }
            aria-label="Đóng thông báo"
            className="text-mint-secondary hover:text-mint-primary p-1 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </section>
  );
};
