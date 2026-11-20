import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Package, Plus } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import { realtimeClient } from '@/realtime/event-client';
import type { Order } from '@/types/api';
import { formatDateTimeVi } from '@/utils/date';
import { getOrderCode, rememberOrders } from '@/utils/order';

// Displays the authenticated customer's home view and real-time order list.
export const CustomerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );

  const loadOrders = useCallback(async () => {
    setError(null);
    try {
      const data = await apiClient.listOrders();
      rememberOrders(data);
      setOrders(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể tải danh sách đơn hàng.' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const unsubscribeStatus = realtimeClient.subscribe('order.status_changed', (payload) => {
      setOrders((prev) =>
        prev.map((order) => {
          const matchesId = order.id === payload.orderId;
          const matchesCode = payload.orderCode ? getOrderCode(order) === payload.orderCode : false;
          if (!matchesId && !matchesCode) {
            return order;
          }
          return {
            ...order,
            status: payload.newStatus,
            updatedAt: payload.changedAt,
            shipment: payload.shipment ?? order.shipment,
          };
        })
      );
    });

    const unsubscribeReconnect = realtimeClient.subscribe('realtime:reconnected', () => {
      void loadOrders();
    });

    return () => {
      unsubscribeStatus();
      unsubscribeReconnect();
    };
  }, [loadOrders]);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1
            data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
            className="text-2xl font-bold text-mint-primary"
          >
            {SCREEN_NAMES.CUSTOMER_HOME}
          </h1>
          <p className="text-sm text-mint-secondary">
            Theo dõi tiến trình vận chuyển và quản lý đơn hàng của bạn.
          </p>
        </div>

        <Link
          to={APP_PATHS.orderCreation}
          data-testid={TEST_IDS.ORDER.CREATE_BUTTON}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn hàng mới</span>
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

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Bạn chưa có đơn hàng nào"
          description="Hãy tạo đơn hàng đầu tiên để theo dõi trạng thái vận chuyển theo thời gian thực."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const orderCode = getOrderCode(order);
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                data-testid={TEST_IDS.ORDER.ORDER_LIST_ITEM}
                onClick={() => navigate(APP_PATHS.orderDetails(orderCode))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(APP_PATHS.orderDetails(orderCode));
                  }
                }}
                className="bg-card rounded-xl border border-mint-secondary/20 p-4 sm:p-5 shadow-sm hover:border-mint-tertiary/50 hover:shadow transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-mint-primary font-mono">
                      <Package className="w-4 h-4 text-mint-tertiary" />
                      {orderCode}
                    </span>
                    <StatusBadge status={order.status} showDot />
                  </div>
                  <div className="text-xs text-mint-secondary-dark flex flex-wrap gap-x-4 gap-y-1">
                    <span>Người nhận: {order.recipientName}</span>
                    <span>SĐT: {order.recipientPhone}</span>
                    <span>Số lượng sản phẩm: {totalItems}</span>
                  </div>
                  <p className="text-xs text-mint-secondary truncate">{order.deliveryAddress}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-mint-secondary flex-shrink-0">
                  <span className="font-mono">{formatDateTimeVi(order.createdAt)}</span>
                  <ArrowRight className="w-4 h-4 text-mint-tertiary" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
