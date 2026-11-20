import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Package, Truck, X } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { OrderStatusTimeline } from '@/components/common/OrderStatusTimeline';
import { StatusBadge } from '@/components/common/StatusBadge';
import { APP_CONFIG } from '@/constants/config';
import { ISSUE_TYPE_LABELS } from '@/constants/issues';
import { SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import { realtimeClient } from '@/realtime/event-client';
import type { DeliveryIssueType, Order, ShipmentStatusAction } from '@/types/api';
import { formatDateTimeVi } from '@/utils/date';
import { getOrderCode, rememberOrders } from '@/utils/order';
import { validateFreeText } from '@/utils/validation';

const ISSUE_OPTIONS = Object.entries(ISSUE_TYPE_LABELS) as Array<[DeliveryIssueType, string]>;

type PendingConfirmation =
  | {
      type: 'status';
      order: Order;
      action: ShipmentStatusAction;
      title: string;
      message: string;
      confirmLabel: string;
    }
  | {
      type: 'issue';
      order: Order;
      issueType: DeliveryIssueType;
      notes: string;
      title: string;
      message: string;
      confirmLabel: string;
    };

// Displays assigned shipments for the signed-in shipper with status transitions and issue reporting.
export const ShipperDeliveryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );

  const [reportingOrderId, setReportingOrderId] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<DeliveryIssueType | ''>('');
  const [issueNotes, setIssueNotes] = useState('');
  const [issueFormError, setIssueFormError] = useState<string | null>(null);

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [historyOrder, setHistoryOrder] = useState<Order | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadShipments = useCallback(async () => {
    setError(null);
    try {
      const data = await apiClient.listAssignedShipments();
      rememberOrders(data);
      setOrders(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể tải danh sách vận đơn được phân công.' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    const unsubscribeAssigned = realtimeClient.subscribe('shipment.assigned', () => {
      void loadShipments();
    });

    const unsubscribeStatus = realtimeClient.subscribe('order.status_changed', (payload) => {
      setOrders((prev) =>
        prev.map((order) => {
          const matchesId = order.id === payload.orderId;
          const matchesCode = payload.orderCode ? getOrderCode(order) === payload.orderCode : false;
          if (!matchesId && !matchesCode) {
            return order;
          }
          const existingHistory = order.history ?? [];
          const duplicateEntry = existingHistory.some(
            (entry) => entry.newStatus === payload.newStatus && entry.changedAt === payload.changedAt
          );
          return {
            ...order,
            status: payload.newStatus,
            updatedAt: payload.changedAt,
            shipment: payload.shipment ?? order.shipment,
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
        })
      );
    });

    const unsubscribeReconnect = realtimeClient.subscribe('realtime:reconnected', () => {
      void loadShipments();
    });

    return () => {
      unsubscribeAssigned();
      unsubscribeStatus();
      unsubscribeReconnect();
    };
  }, [loadShipments]);

  const handleOpenHistory = async (order: Order) => {
    setHistoryOrder(order);
    if (order.history && order.history.length > 0) {
      return;
    }
    setLoadingHistory(true);
    try {
      const detail = await apiClient.getOrderDetail(order.id);
      setHistoryOrder(detail);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể tải lịch sử trạng thái của đơn hàng.' });
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenIssueForm = (order: Order) => {
    setReportingOrderId((prev) => (prev === order.id ? null : order.id));
    setIssueType('');
    setIssueNotes('');
    setIssueFormError(null);
  };

  const handleRequestIssueConfirm = (order: Order) => {
    if (!issueType) {
      setIssueFormError('Vui lòng chọn loại sự cố.');
      return;
    }
    const notesError = validateFreeText(issueNotes, {
      required: false,
      requiredMessage: '',
      fieldLabel: 'Ghi chú sự cố',
    });
    if (notesError) {
      setIssueFormError(notesError);
      return;
    }
    setIssueFormError(null);
    const label = ISSUE_TYPE_LABELS[issueType];
    const orderCode = getOrderCode(order);
    setPendingConfirm({
      type: 'issue',
      order,
      issueType,
      notes: issueNotes.trim(),
      title: 'Xác nhận báo cáo sự cố',
      message: `Bạn có chắc chắn muốn báo cáo sự cố "${label}" cho đơn hàng ${orderCode}?`,
      confirmLabel: 'Xác nhận báo cáo',
    });
  };

  const handleExecuteConfirmedAction = async () => {
    if (!pendingConfirm || confirmLoading) {
      return;
    }
    setError(null);
    setConfirmLoading(true);
    try {
      if (pendingConfirm.type === 'status') {
        const shipmentId = pendingConfirm.order.shipment?.id ?? pendingConfirm.order.id;
        await apiClient.updateShipmentStatus(shipmentId, {
          action: pendingConfirm.action,
        });
      } else {
        await apiClient.reportIssue(pendingConfirm.order.id, {
          issueType: pendingConfirm.issueType,
          notes: pendingConfirm.notes || undefined,
        });
        setReportingOrderId(null);
        setIssueType('');
        setIssueNotes('');
      }
      setPendingConfirm(null);
      await loadShipments();
    } catch (err) {
      setPendingConfirm(null);
      await loadShipments();
      if (err instanceof ApiClientError) {
        setError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setError({ message: 'Không thể cập nhật trạng thái vận đơn.' });
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-1">
        <h1
          data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
          className="text-2xl font-bold text-mint-primary"
        >
          {SCREEN_NAMES.SHIPPER_DELIVERY}
        </h1>
        <p className="text-xs text-mint-secondary">
          Xem danh sách đơn hàng được phân công, cập nhật nhận hàng, hoàn thành giao hoặc báo cáo sự cố.
        </p>
      </div>

      {error && (
        <ErrorBanner
          message={error.message}
          code={error.code}
          traceId={error.traceId}
          onDismiss={() => setError(null)}
        />
      )}

      <div data-testid={TEST_IDS.SHIPPER.ASSIGNED_LIST} className="space-y-4">
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Chưa có đơn hàng nào được phân công"
            description="Đơn hàng khi được Admin phân công sẽ hiển thị tại đây."
          />
        ) : (
          orders.map((order) => {
            const orderCode = getOrderCode(order);
            const failedAttempts = order.shipment?.failedAttempts ?? 0;
            const canPickUp =
              order.status === 'WAITING_PICKUP' ||
              (order.status === 'FAILED_DELIVERY' &&
                failedAttempts < APP_CONFIG.DELIVERY_RULES.MAX_FAILED_DELIVERY_ATTEMPTS);
            const canDeliverOrReport = order.status === 'DELIVERING';
            const isReporting = reportingOrderId === order.id;

            return (
              <article
                key={order.id}
                data-testid={TEST_IDS.SHIPPER.SHIPMENT_CARD}
                className="bg-card rounded-2xl border border-mint-secondary/20 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 font-bold font-mono text-sm text-mint-primary">
                        <Package className="w-4 h-4 text-mint-tertiary" />
                        {orderCode}
                      </span>
                      <StatusBadge status={order.status} showDot />
                      {failedAttempts > 0 && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          Số lần giao thất bại: {failedAttempts}
                        </span>
                      )}
                    </div>
                    {order.shipment && (
                      <div className="text-xs font-mono text-mint-secondary">
                        Vận đơn: {order.shipment.trackingNumber} · Phân công:{' '}
                        {formatDateTimeVi(order.shipment.assignedAt)}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    data-testid={TEST_IDS.SHIPPER.HISTORY_BUTTON}
                    onClick={() => void handleOpenHistory(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lịch sử trạng thái</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-mint-neutral/40 rounded-xl p-3.5 border border-mint-secondary/15 text-xs">
                  <div className="space-y-1">
                    <div className="font-semibold text-mint-primary">Người nhận hàng</div>
                    <div className="text-mint-secondary-dark">
                      {order.recipientName} · <span className="font-mono">{order.recipientPhone}</span>
                    </div>
                    <div className="text-mint-secondary break-words">{order.deliveryAddress}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-mint-primary">Sản phẩm</div>
                    <ul className="space-y-0.5 text-mint-secondary-dark">
                      {order.items.map((item, idx) => (
                        <li key={item.id ?? `${item.productId}-${idx}`}>
                          {item.productName ?? item.productId} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {canPickUp && (
                    <button
                      type="button"
                      data-testid={TEST_IDS.SHIPPER.PICKUP_BUTTON}
                      onClick={() =>
                        setPendingConfirm({
                          type: 'status',
                          order,
                          action: 'START_DELIVERY',
                          title: 'Xác nhận nhận hàng để giao',
                          message: `Xác nhận đã nhận kiện hàng cho đơn ${orderCode} và chuyển sang Đang giao?`,
                          confirmLabel: 'Xác nhận Đang giao',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>
                        {order.status === 'FAILED_DELIVERY'
                          ? 'Giao lại hàng'
                          : 'Nhận hàng & Giao'}
                      </span>
                    </button>
                  )}

                  {canDeliverOrReport && (
                    <>
                      <button
                        type="button"
                        data-testid={TEST_IDS.SHIPPER.DELIVER_SUCCESS_BUTTON}
                        onClick={() =>
                          setPendingConfirm({
                            type: 'status',
                            order,
                            action: 'CONFIRM_DELIVERED',
                            title: 'Xác nhận giao thành công',
                            message: `Xác nhận đã giao thành công đơn hàng ${orderCode} cho người nhận?`,
                            confirmLabel: 'Xác nhận Đã giao',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Giao thành công</span>
                      </button>

                      <button
                        type="button"
                        data-testid={TEST_IDS.SHIPPER.REPORT_ISSUE_BUTTON}
                        onClick={() => handleOpenIssueForm(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Báo cáo sự cố</span>
                      </button>
                    </>
                  )}
                </div>

                {isReporting && canDeliverOrReport && (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`issue-type-${order.id}`}
                        className="block text-xs font-semibold text-mint-primary"
                      >
                        Loại sự cố giao hàng
                      </label>
                      <select
                        id={`issue-type-${order.id}`}
                        data-testid={TEST_IDS.SHIPPER.ISSUE_TYPE_SELECT}
                        value={issueType}
                        onChange={(event) => {
                          setIssueType(event.target.value as DeliveryIssueType | '');
                          setIssueFormError(null);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="">-- Chọn loại sự cố --</option>
                        {ISSUE_OPTIONS.map(([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor={`issue-notes-${order.id}`}
                        className="block text-xs font-semibold text-mint-primary"
                      >
                        Ghi chú chi tiết (tùy chọn)
                      </label>
                      <textarea
                        id={`issue-notes-${order.id}`}
                        rows={2}
                        data-testid={TEST_IDS.SHIPPER.ISSUE_NOTES_INPUT}
                        value={issueNotes}
                        onChange={(event) => {
                          setIssueNotes(event.target.value);
                          setIssueFormError(null);
                        }}
                        placeholder="Mô tả chi tiết tình huống giao hàng (tối đa 500 ký tự)..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    {issueFormError && (
                      <p role="alert" className="text-xs font-medium text-red-600">
                        {issueFormError}
                      </p>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReportingOrderId(null);
                          setIssueFormError(null);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        data-testid={TEST_IDS.SHIPPER.SUBMIT_ISSUE_BUTTON}
                        onClick={() => handleRequestIssueConfirm(order)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                      >
                        Gửi báo cáo sự cố
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingConfirm)}
        title={pendingConfirm?.title ?? ''}
        message={pendingConfirm?.message ?? ''}
        confirmLabel={pendingConfirm?.confirmLabel}
        variant={pendingConfirm?.type === 'issue' ? 'danger' : 'primary'}
        isLoading={confirmLoading}
        onConfirm={() => void handleExecuteConfirmedAction()}
        onCancel={() => {
          if (!confirmLoading) {
            setPendingConfirm(null);
          }
        }}
      />

      {historyOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-card rounded-2xl p-6 shadow-xl border border-mint-secondary/20 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-mint-secondary/15 pb-3">
              <h2 className="text-lg font-bold text-mint-primary">
                Lịch sử trạng thái đơn {getOrderCode(historyOrder)}
              </h2>
              <button
                type="button"
                aria-label="Đóng lịch sử"
                onClick={() => setHistoryOrder(null)}
                className="p-1.5 rounded-lg text-mint-secondary hover:text-mint-primary hover:bg-mint-neutral transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {loadingHistory ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <OrderStatusTimeline entries={historyOrder.history} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
