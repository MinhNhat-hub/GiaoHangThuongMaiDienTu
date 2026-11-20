import React from 'react';
import { Clock, User } from 'lucide-react';
import { getOrderStatusMeta } from '@/constants/status-map';
import { TEST_IDS } from '@/constants/test-ids';
import type { StatusHistoryEntry } from '@/types/api';
import { formatDateTimeVi } from '@/utils/date';
import { sortStatusHistoryAsc } from '@/utils/order';

interface OrderStatusTimelineProps {
  entries?: StatusHistoryEntry[];
  className?: string;
}

// Displays an immutable, chronologically sorted timeline of order status transitions.
export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  entries = [],
  className = '',
}) => {
  const sortedEntries = sortStatusHistoryAsc(entries);

  return (
    <div
      data-testid={TEST_IDS.ORDER.ORDER_STATUS_TIMELINE}
      className={`space-y-3 ${className}`}
    >
      {sortedEntries.length === 0 ? (
        <p className="text-xs text-mint-secondary">Chưa có lịch sử cập nhật trạng thái.</p>
      ) : (
        <ol className="relative border-l-2 border-mint-secondary/25 pl-4 space-y-4">
          {sortedEntries.map((entry, index) => {
            const oldLabel = entry.oldStatus
              ? getOrderStatusMeta(entry.oldStatus)?.labelVi ?? entry.oldStatus
              : '';
            const newMeta = getOrderStatusMeta(entry.newStatus);
            const actorText =
              entry.changedByName && entry.changedByEmail
                ? `${entry.changedByName} (${entry.changedByEmail})`
                : entry.changedByEmail || entry.changedByName || entry.changedBy;

            return (
              <li
                key={entry.id ?? `${entry.newStatus}-${entry.changedAt}-${index}`}
                data-testid={TEST_IDS.ORDER.TIMELINE_ENTRY}
                className="relative bg-card rounded-xl border border-mint-secondary/15 p-3.5 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[22px] top-4 w-2.5 h-2.5 rounded-full bg-mint-tertiary ring-4 ring-canvas"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-mint-primary">
                    <span data-testid={TEST_IDS.ORDER.TIMELINE_ENTRY_OLD_STATUS}>{oldLabel}</span>
                    {oldLabel ? (
                      <span aria-hidden="true" className="text-mint-secondary">
                        →
                      </span>
                    ) : null}
                    <span
                      data-testid={TEST_IDS.ORDER.TIMELINE_ENTRY_NEW_STATUS}
                      className="text-mint-primary"
                    >
                      {newMeta?.labelVi ?? entry.newStatus}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-mono text-mint-secondary">
                    <Clock className="w-3.5 h-3.5" />
                    <span data-testid={TEST_IDS.ORDER.TIMELINE_ENTRY_TIME}>
                      {formatDateTimeVi(entry.changedAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-mint-secondary">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span data-testid={TEST_IDS.ORDER.TIMELINE_ENTRY_ACTOR}>{actorText}</span>
                </div>

                {entry.notes && (
                  <p className="mt-1.5 text-xs text-mint-secondary-dark bg-mint-neutral/60 rounded-md px-2.5 py-1.5">
                    {entry.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
