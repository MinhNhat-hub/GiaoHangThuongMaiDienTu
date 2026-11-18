import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { APP_PATHS } from '@/constants/routes';
import { getReturnReasonLabel } from '@/constants/status-map';
import { TEST_IDS } from '@/constants/test-ids';
import { realtimeClient } from '@/realtime/event-client';
import type { ReturnRequest } from '@/types/api';
import { formatDateTimeVi } from '@/utils/date';
import { getReturnCode, getReturnOrderCode } from '@/utils/order';

// Lists return requests submitted by the authenticated customer.
export const CustomerReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );

  const loadReturns = useCallback(async () => {
    setError(null);
    try {
      const data = await apiClient.listReturns();
      setReturns(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể tải danh sách yêu cầu hoàn hàng.' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReturns();
  }, [loadReturns]);

  useEffect(() => {
    const unsubscribeReturn = realtimeClient.subscribe('return.status_changed', () => {
      void loadReturns();
    });
    const unsubscribeReconnect = realtimeClient.subscribe('realtime:reconnected', () => {
      void loadReturns();
    });

    return () => {
      unsubscribeReturn();
      unsubscribeReconnect();
    };
  }, [loadReturns]);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
            className="text-2xl font-bold text-mint-primary"
          >
            Yêu cầu hoàn hàng đã gửi
          </h1>
          <p className="text-xs text-mint-secondary">
            Theo dõi kết quả xét duyệt và tiến trình xử lý hoàn hàng của bạn.
          </p>
        </div>

        <Link
          to={APP_PATHS.orderList}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
        >
          Danh sách đơn hàng
        </Link>
      </div>

      {error && (
        <ErrorBanner
          message={error.message}
          code={error.code}
          traceId={error.traceId}
          onDismiss={() => setError(null)}
        />
      )}

      <div data-testid={TEST_IDS.RETURN.LIST} className="space-y-3">
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : returns.length === 0 ? (
          <EmptyState
            title="Chưa có yêu cầu hoàn hàng nào"
            description="Các yêu cầu hoàn hàng bạn gửi sẽ được hiển thị tại đây."
          />
        ) : (
          returns.map((item) => {
            const returnCode = getReturnCode(item);
            const orderCode = getReturnOrderCode(item);

            return (
              <div
                key={item.id}
                data-testid={TEST_IDS.RETURN.LIST_ITEM}
                className="bg-card rounded-xl border border-mint-secondary/20 p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 font-bold font-mono text-sm text-mint-primary">
                      <RotateCcw className="w-4 h-4 text-mint-tertiary" />
                      <span data-testid={TEST_IDS.RETURN.ITEM_CODE}>{returnCode}</span>
                    </span>
                    <StatusBadge status={item.status} showDot />
                  </div>
                  <span
                    data-testid={TEST_IDS.RETURN.ITEM_SUBMITTED_AT}
                    className="text-xs font-mono text-mint-secondary"
                  >
                    {formatDateTimeVi(item.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-mint-secondary-dark">
                  <div>
                    <span>Đơn hàng: </span>
                    <Link
                      to={APP_PATHS.orderDetails(orderCode)}
                      className="font-mono font-semibold text-mint-primary hover:underline"
                    >
                      {orderCode}
                    </Link>
                  </div>
                  <div>
                    <span>Lý do: </span>
                    <span data-testid={TEST_IDS.RETURN.ITEM_REASON} className="font-semibold">
                      {getReturnReasonLabel(item.reason)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-mint-secondary">
                  <span>Mô tả: </span>
                  <span data-testid={TEST_IDS.RETURN.ITEM_NOTES}>{item.notes ?? ''}</span>
                </div>

                {item.rejectionReason && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
                    <span className="font-semibold">Lý do từ chối: </span>
                    <span data-testid={TEST_IDS.RETURN.ITEM_REJECT_REASON}>
                      {item.rejectionReason}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
