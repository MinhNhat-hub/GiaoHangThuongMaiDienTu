import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Truck } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { CopyButton } from '@/components/common/CopyButton';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { OrderStatusTimeline } from '@/components/common/OrderStatusTimeline';
import { StatusBadge } from '@/components/common/StatusBadge';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import { realtimeClient } from '@/realtime/event-client';
import type { Order } from '@/types/api';
import { formatDateTimeVi } from '@/utils/date';
import { getOrderCode, rememberOrder } from '@/utils/order';

// Displays real-time shipment progress and immutable status history for an order.
export const ShipmentTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchCode, setSearchCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );

  const loadOrder = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await apiClient.getOrderDetail(id);
      rememberOrder(data);
      setOrder(data);
    } catch (err) {
      setOrder(null);
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể tải thông tin theo dõi vận chuyển.' });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const unsubscribeStatus = realtimeClient.subscribe('order.status_changed', (payload) => {
      setOrder((prev) => {
        if (!prev) {
          return prev;
        }
        const matchesId = prev.id === payload.orderId;
        const matchesCode = payload.orderCode ? getOrderCode(prev) === payload.orderCode : false;
        if (!matchesId && !matchesCode) {
          return prev;
        }
        const existingHistory = prev.history ?? [];
        const duplicateEntry = existingHistory.some(
          (entry) => entry.newStatus === payload.newStatus && entry.changedAt === payload.changedAt
        );
        return {
          ...prev,
          status: payload.newStatus,
          updatedAt: payload.changedAt,
          shipment: payload.shipment ?? prev.shipment,
          history: duplicateEntry
            ? existingHistory
            : [
                ...existingHistory,
                {
                  oldStatus: payload.oldStatus,
                  newStatus: payload.newStatus,
                  changedBy: payload.changedBy ?? '',
                  changedByName: payload.changedByName,
                  changedByEmail: payload.changedByEmail,
                  changedAt: payload.changedAt,
                  notes: payload.notes,
                },
              ],
        };
      });
    });

    const unsubscribeReconnect = realtimeClient.subscribe('realtime:reconnected', () => {
      void loadOrder();
    });

    return () => {
      unsubscribeStatus();
      unsubscribeReconnect();
    };
  }, [loadOrder]);

  const handleTrackingSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchCode.trim();
    if (!trimmed) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const found = await apiClient.trackShipment(trimmed);
      rememberOrder(found);
      setOrder(found);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không tìm thấy vận đơn tương ứng.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
            className="text-2xl font-bold text-mint-primary"
          >
            {SCREEN_NAMES.TRACKING}
          </h1>
          <p className="text-xs text-mint-secondary">
            Theo dõi hành trình vận đơn và thời gian cập nhật trạng thái theo thời gian thực.
          </p>
        </div>

        <Link
          to={id ? APP_PATHS.orderDetails(id) : APP_PATHS.orderList}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
        >
          Quay lại chi tiết đơn hàng
        </Link>
      </div>

      <form
        onSubmit={handleTrackingSearch}
        className="bg-card rounded-2xl border border-mint-secondary/20 p-4 shadow-sm flex flex-wrap gap-3"
      >
        <input
          type="text"
          data-testid={TEST_IDS.SHIPMENT.TRACKING_INPUT}
          value={searchCode}
          onChange={(event) => setSearchCode(event.target.value)}
          placeholder="Nhập mã vận đơn cần tra cứu..."
          className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
        />
        <button
          type="submit"
          data-testid={TEST_IDS.SHIPMENT.TRACKING_SEARCH_BUTTON}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tra cứu</span>
        </button>
      </form>

      {error && (
        <ErrorBanner
          message={error.message}
          code={error.code}
          traceId={error.traceId}
          onDismiss={() => setError(null)}
        />
      )}

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : !order ? null : (
        <section
          data-testid={TEST_IDS.SHIPMENT.TIMELINE_CONTAINER}
          className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mint-secondary/15 pb-4">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-mint-tertiary" />
              <span className="font-bold font-mono text-mint-primary">{getOrderCode(order)}</span>
              <CopyButton text={getOrderCode(order)} />
            </div>
            <StatusBadge status={order.status} showDot />
          </div>

          {order.shipment ? (
            <div className="bg-mint-neutral/40 rounded-xl p-4 border border-mint-secondary/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-xs text-mint-secondary">Mã vận đơn</div>
                <div
                  data-testid={TEST_IDS.SHIPMENT.CODE}
                  className="font-bold font-mono text-mint-primary"
                >
                  {order.shipment.trackingNumber}
                </div>
              </div>
              <div>
                <div className="text-xs text-mint-secondary">Shipper phụ trách</div>
                <div
                  data-testid={TEST_IDS.SHIPMENT.SHIPPER}
                  className="font-medium text-mint-primary"
                >
                  {order.shipment.shipperName && order.shipment.shipperEmail
                    ? `${order.shipment.shipperName} (${order.shipment.shipperEmail})`
                    : order.shipment.shipperEmail ||
                      order.shipment.shipperName ||
                      order.shipment.shipperId}
                </div>
              </div>
              <div>
                <div className="text-xs text-mint-secondary">Thời điểm phân công</div>
                <div
                  data-testid={TEST_IDS.SHIPMENT.CREATED_AT}
                  className="font-mono text-mint-primary"
                >
                  {formatDateTimeVi(order.shipment.assignedAt)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-mint-secondary bg-mint-neutral/50 rounded-lg p-3.5">
              Đơn hàng chưa được phân công vận chuyển.
            </p>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-mint-primary">Lịch sử cập nhật vận chuyển</h2>
            <OrderStatusTimeline entries={order.history} />
          </div>
        </section>
      )}
    </div>
  );
};
