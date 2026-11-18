import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Package, RotateCcw, Truck } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { CopyButton } from '@/components/common/CopyButton';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { OrderStatusTimeline } from '@/components/common/OrderStatusTimeline';
import { StatusBadge } from '@/components/common/StatusBadge';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import { realtimeClient } from '@/realtime/event-client';
import { useAuthSession } from '@/routes/guards';
import type { Order } from '@/types/api';
import { formatDateTimeVi } from '@/utils/date';
import { getOrderCode, rememberOrder } from '@/utils/order';

type DetailTab = 'details' | 'tracking';

// Displays order items, recipient information, status timeline, and role actions.
export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('details');
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );

  const loadOrder = useCallback(async () => {
    if (!id) {
      setError({ message: 'Không tìm thấy mã đơn hàng.' });
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
        setError({ message: 'Không thể tải chi tiết đơn hàng.' });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!id) {
      return;
    }

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
        const nextHistory = duplicateEntry
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
            ];

        return {
          ...prev,
          status: payload.newStatus,
          updatedAt: payload.changedAt,
          shipment: payload.shipment ?? prev.shipment,
          history: nextHistory,
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
  }, [id, loadOrder]);

  const handleConfirmLost = async () => {
    if (!order || submittingAction) {
      return;
    }
    setError(null);
    setSubmittingAction(true);
    try {
      await apiClient.reportIssue(order.id, {
        issueType: 'LOST',
        notes: 'Admin xác nhận hàng hóa bị thất lạc.',
      });
      await loadOrder();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể xác nhận thất lạc cho đơn hàng.' });
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReturned = async () => {
    if (!order || submittingAction) {
      return;
    }
    setError(null);
    setSubmittingAction(true);
    try {
      await apiClient.confirmReturnReceived(order.shipment?.id ?? order.id);
      await loadOrder();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể xác nhận đã nhận lại hàng hoàn.' });
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  const orderCode = order ? getOrderCode(order) : id ?? '';

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
            className="text-2xl font-bold text-mint-primary"
          >
            {SCREEN_NAMES.ORDER_DETAILS}
          </h1>
          <p className="text-xs text-mint-secondary">
            Theo dõi thông tin đơn hàng, vận đơn và lịch sử chuyển trạng thái.
          </p>
        </div>

        <Link
          to={
            user?.role === 'Admin'
              ? APP_PATHS.adminDashboard
              : user?.role === 'Shipper'
                ? APP_PATHS.shipperDeliveries
                : APP_PATHS.orderList
          }
          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
        >
          Quay lại danh sách
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
      ) : !order ? null : (
        <div
          data-testid={TEST_IDS.ORDER.ORDER_DETAILS_CONTAINER}
          className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-mint-secondary/15 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  data-testid={TEST_IDS.ORDER.DETAILS_CODE}
                  className="text-lg font-bold font-mono text-mint-primary"
                >
                  {orderCode}
                </span>
                <CopyButton text={orderCode} />
                <StatusBadge status={order.status} showDot />
              </div>
              <div className="text-xs text-mint-secondary font-mono">
                Ngày tạo: {formatDateTimeVi(order.createdAt)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {user?.role === 'Customer' && (
                <button
                  type="button"
                  data-testid={TEST_IDS.ORDER.REQUEST_RETURN_BUTTON}
                  onClick={() => navigate(APP_PATHS.returnRequest(orderCode))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-mint-tertiary/50 text-mint-primary bg-mint-neutral hover:bg-mint-tertiary/15 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Yêu cầu hoàn hàng</span>
                </button>
              )}

              {user?.role === 'Admin' && order.status === 'DELIVERING' && (
                <button
                  type="button"
                  data-testid={TEST_IDS.ADMIN.CONFIRM_LOST_BUTTON}
                  disabled={submittingAction}
                  onClick={handleConfirmLost}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Xác nhận thất lạc
                </button>
              )}

              {user?.role === 'Admin' && order.status === 'RETURNING' && (
                <button
                  type="button"
                  data-testid={TEST_IDS.ADMIN.CONFIRM_RETURNED_BUTTON}
                  disabled={submittingAction}
                  onClick={handleConfirmReturned}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors disabled:opacity-50"
                >
                  Xác nhận đã nhận lại hàng hoàn
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-mint-neutral/40 rounded-xl p-4 border border-mint-secondary/15 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wide text-mint-secondary">
                Khách hàng đặt đơn
              </div>
              <div
                data-testid={TEST_IDS.ORDER.DETAILS_CUSTOMER}
                className="font-medium text-mint-primary"
              >
                {order.customerName && order.customerEmail
                  ? `${order.customerName} (${order.customerEmail})`
                  : order.customerEmail || order.customerName || order.customerId}
              </div>
            </div>

            <div className="bg-mint-neutral/40 rounded-xl p-4 border border-mint-secondary/15 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wide text-mint-secondary">
                Thông tin người nhận
              </div>
              <div className="font-semibold text-mint-primary">{order.recipientName}</div>
              <div className="text-xs font-mono text-mint-secondary-dark">{order.recipientPhone}</div>
              <div className="text-xs text-mint-secondary break-words">{order.deliveryAddress}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-mint-secondary/15 pb-3">
            <button
              type="button"
              data-testid={TEST_IDS.ORDER.TAB_DETAILS}
              onClick={() => setActiveTab('details')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'details'
                  ? 'bg-mint-primary text-white'
                  : 'bg-mint-neutral text-mint-primary hover:bg-mint-secondary/15'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Chi tiết đơn hàng</span>
            </button>
            <button
              type="button"
              data-testid={TEST_IDS.ORDER.TAB_TRACKING}
              onClick={() => {
                setActiveTab('tracking');
                if (order && !order.shipment && order.status !== 'PENDING_CONFIRMATION') {
                  void loadOrder();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'tracking'
                  ? 'bg-mint-primary text-white'
                  : 'bg-mint-neutral text-mint-primary hover:bg-mint-secondary/15'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Theo dõi vận chuyển</span>
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-mint-primary">Sản phẩm trong đơn</h2>
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li
                      key={item.id ?? `${item.productId}-${idx}`}
                      data-testid={TEST_IDS.ORDER.DETAILS_LINE}
                      className="flex items-center justify-between bg-mint-neutral/40 rounded-lg px-4 py-2.5 text-sm border border-mint-secondary/15"
                    >
                      <span className="font-medium text-mint-primary">
                        {item.productName ?? item.productId}
                      </span>
                      <span className="font-mono text-xs text-mint-secondary-dark">
                        Số lượng: {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-mint-primary">Lịch sử trạng thái</h2>
                <OrderStatusTimeline entries={order.history} />
              </div>
            </div>
          ) : (
            <div data-testid={TEST_IDS.SHIPMENT.TIMELINE_CONTAINER} className="space-y-5">
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
                  Đơn hàng chưa có thông tin vận đơn.
                </p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-mint-primary">Lộ trình trạng thái</h2>
                  {(user?.role === 'Customer' || user?.role === 'Admin') && (
                    <Link
                      to={APP_PATHS.tracking(orderCode)}
                      className="text-xs font-semibold text-mint-tertiary hover:underline"
                    >
                      Mở trang theo dõi độc lập
                    </Link>
                  )}
                </div>
                <OrderStatusTimeline entries={order.history} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
