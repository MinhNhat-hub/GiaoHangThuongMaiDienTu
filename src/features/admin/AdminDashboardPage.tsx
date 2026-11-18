import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ClipboardList, RotateCcw, Truck } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { APP_CONFIG } from '@/constants/config';
import { getIssueTypeLabel } from '@/constants/issues';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { getReturnReasonLabel } from '@/constants/status-map';
import { TEST_IDS } from '@/constants/test-ids';
import { realtimeClient } from '@/realtime/event-client';
import type { DeliveryIssue, Order, ReturnRequest } from '@/types/api';
import { formatDateTimeVi } from '@/utils/date';
import {
  getIssueCode,
  getIssueOrderCode,
  getOrderCode,
  getReturnCode,
  getReturnOrderCode,
  rememberOrders,
} from '@/utils/order';
import { validateFreeText } from '@/utils/validation';

type AdminTab = 'assignment' | 'tracking' | 'issues' | 'returns';

interface ShipperOption {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

// Renders the store admin dashboard for shipment assignment, order tracking, issues, and returns.
export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('assignment');
  const [orders, setOrders] = useState<Order[]>([]);
  const [issues, setIssues] = useState<DeliveryIssue[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [shippers, setShippers] = useState<ShipperOption[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingReturns, setLoadingReturns] = useState(false);

  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedShipperId, setSelectedShipperId] = useState('');
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [assigningSubmitting, setAssigningSubmitting] = useState(false);

  const [issueDrafts, setIssueDrafts] = useState<Record<string, string>>({});
  const [issueErrors, setIssueErrors] = useState<Record<string, string>>({});
  const [busyIssueId, setBusyIssueId] = useState<string | null>(null);

  const [rejectingReturnId, setRejectingReturnId] = useState<string | null>(null);
  const [rejectReasonDraft, setRejectReasonDraft] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState<string | null>(null);
  const [busyReturnId, setBusyReturnId] = useState<string | null>(null);

  const captureError = useCallback((err: unknown, fallbackMessage: string) => {
    if (err instanceof ApiClientError) {
      setError({ message: err.message, code: err.code, traceId: err.traceId });
    } else {
      setError({ message: fallbackMessage });
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setError(null);
    setLoadingOrders(true);
    try {
      const data = await apiClient.listOrders();
      rememberOrders(data);
      setOrders(data);
    } catch (err) {
      captureError(err, 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoadingOrders(false);
    }
  }, [captureError]);

  const loadIssues = useCallback(async () => {
    setError(null);
    setLoadingIssues(true);
    try {
      const [unresolvedIssues, latestOrders] = await Promise.all([
        apiClient.listIssues({ resolved: false }),
        apiClient.listOrders(),
      ]);
      rememberOrders(latestOrders);
      setOrders(latestOrders);
      setIssues(unresolvedIssues);
    } catch (err) {
      captureError(err, 'Không thể tải danh sách sự cố giao hàng.');
    } finally {
      setLoadingIssues(false);
    }
  }, [captureError]);

  const loadReturns = useCallback(async () => {
    setError(null);
    setLoadingReturns(true);
    try {
      const data = await apiClient.listReturns();
      setReturns(data);
    } catch (err) {
      captureError(err, 'Không thể tải danh sách yêu cầu hoàn hàng.');
    } finally {
      setLoadingReturns(false);
    }
  }, [captureError]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const unsubscribeCreated = realtimeClient.subscribe('order.created', () => {
      if (activeTab === 'assignment' || activeTab === 'tracking') {
        void loadOrders();
      }
    });

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

    const unsubscribeIssue = realtimeClient.subscribe('issue.reported', () => {
      if (activeTab === 'issues') {
        void loadIssues();
      }
    });

    const unsubscribeReturn = realtimeClient.subscribe('return.status_changed', () => {
      if (activeTab === 'returns') {
        void loadReturns();
      }
    });

    const unsubscribeReconnect = realtimeClient.subscribe('realtime:reconnected', () => {
      if (activeTab === 'issues') {
        void loadIssues();
      } else if (activeTab === 'returns') {
        void loadReturns();
      } else {
        void loadOrders();
      }
    });

    return () => {
      unsubscribeCreated();
      unsubscribeStatus();
      unsubscribeIssue();
      unsubscribeReturn();
      unsubscribeReconnect();
    };
  }, [activeTab, loadIssues, loadOrders, loadReturns]);

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'PENDING_CONFIRMATION'),
    [orders]
  );

  const activeReturns = useMemo(
    () =>
      returns.filter(
        (item) => item.status === 'PENDING_APPROVAL' || item.status === 'ACCEPTED'
      ),
    [returns]
  );

  const orderLookup = useMemo(() => {
    const map = new Map<string, Order>();
    for (const order of orders) {
      map.set(order.id, order);
      map.set(getOrderCode(order), order);
    }
    return map;
  }, [orders]);

  const handleTabSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'assignment' || tab === 'tracking') {
      void loadOrders();
    } else if (tab === 'issues') {
      void loadIssues();
    } else {
      void loadReturns();
    }
  };

  const handleOpenAssignDialog = async (order: Order) => {
    setError(null);
    setDialogError(null);
    setSelectedShipperId('');
    setAssigningOrder(order);
    try {
      const list = await apiClient.listShippers();
      setShippers(list);
    } catch (err) {
      setShippers([]);
      captureError(err, 'Không thể tải danh sách Shipper.');
    }
  };

  const handleConfirmAssign = async () => {
    if (!assigningOrder || assigningSubmitting) {
      return;
    }
    if (!selectedShipperId) {
      setDialogError('Vui lòng chọn Shipper trước khi lưu phân công.');
      return;
    }

    setDialogError(null);
    setError(null);
    setAssigningSubmitting(true);
    try {
      await apiClient.createShipment({
        orderId: assigningOrder.id,
        shipperId: selectedShipperId,
      });
      setAssigningOrder(null);
      setSelectedShipperId('');
      await loadOrders();
    } catch (err) {
      setAssigningOrder(null);
      captureError(err, 'Không thể tạo vận đơn và phân công Shipper.');
      await loadOrders();
    } finally {
      setAssigningSubmitting(false);
    }
  };

  const findAssociatedOrder = (issue: DeliveryIssue): Order | undefined => {
    return orderLookup.get(issue.orderId) ?? (issue.orderCode ? orderLookup.get(issue.orderCode) : undefined);
  };

  const handleMoveIssueToReturning = async (issue: DeliveryIssue) => {
    if (busyIssueId) {
      return;
    }
    setError(null);
    const associatedOrder = findAssociatedOrder(issue);
    const failedAttempts = associatedOrder?.shipment?.failedAttempts ?? 0;

    if (
      associatedOrder &&
      (associatedOrder.status !== 'FAILED_DELIVERY' ||
        failedAttempts < APP_CONFIG.DELIVERY_RULES.MAX_FAILED_DELIVERY_ATTEMPTS)
    ) {
      setError({
        message:
          'Chỉ có thể chuyển sang trạng thái Đang hoàn hàng khi đơn hàng đã đạt đủ 3 lần giao không thành công.',
      });
      return;
    }

    setBusyIssueId(issue.id);
    try {
      await apiClient.processReturnShipment(associatedOrder?.shipment?.id ?? issue.orderId);
      await loadIssues();
    } catch (err) {
      captureError(err, 'Không thể chuyển đơn hàng sang trạng thái hoàn hàng.');
    } finally {
      setBusyIssueId(null);
    }
  };

  const handleSaveIssueResult = async (issue: DeliveryIssue) => {
    if (busyIssueId) {
      return;
    }
    const rawDraft = issueDrafts[issue.id] ?? '';
    const fieldError = validateFreeText(rawDraft, {
      required: true,
      requiredMessage: 'Vui lòng nhập kết quả xử lý sự cố.',
      fieldLabel: 'Kết quả xử lý',
    });

    if (fieldError) {
      setIssueErrors((prev) => ({ ...prev, [issue.id]: fieldError }));
      return;
    }

    setIssueErrors((prev) => {
      const next = { ...prev };
      delete next[issue.id];
      return next;
    });
    setError(null);

    const associatedOrder = findAssociatedOrder(issue);
    const failedAttempts = associatedOrder?.shipment?.failedAttempts ?? 0;
    if (
      issue.issueType === 'FAILED_DELIVERY' &&
      associatedOrder?.status === 'FAILED_DELIVERY' &&
      failedAttempts >= APP_CONFIG.DELIVERY_RULES.MAX_FAILED_DELIVERY_ATTEMPTS
    ) {
      setError({
        message:
          'Đơn hàng đã đạt 3 lần giao không thành công. Hãy chuyển đơn sang Đang hoàn hàng trước khi lưu kết quả xử lý.',
      });
      return;
    }

    const trimmed = rawDraft.trim();
    setBusyIssueId(issue.id);
    try {
      const updated = await apiClient.resolveIssue(issue.id, {
        resolutionNotes: trimmed,
        resolutionResult: trimmed,
      });
      setIssues((prev) =>
        prev.map((item) =>
          item.id === issue.id
            ? {
                ...item,
                ...updated,
                resolved: true,
                resolutionResult: updated.resolutionResult ?? updated.resolutionNotes ?? trimmed,
              }
            : item
        )
      );
    } catch (err) {
      captureError(err, 'Không thể lưu kết quả xử lý sự cố.');
    } finally {
      setBusyIssueId(null);
    }
  };

  const handleApproveReturn = async (item: ReturnRequest) => {
    if (busyReturnId) {
      return;
    }
    setError(null);
    setBusyReturnId(item.id);
    try {
      const updated = await apiClient.reviewReturn(item.id, { action: 'APPROVE' });
      setReturns((prev) =>
        prev.map((candidate) =>
          candidate.id === item.id ? { ...candidate, ...updated, status: 'ACCEPTED' } : candidate
        )
      );
    } catch (err) {
      captureError(err, 'Không thể chấp nhận yêu cầu hoàn hàng.');
    } finally {
      setBusyReturnId(null);
    }
  };

  const handleConfirmRejectReturn = async (item: ReturnRequest) => {
    if (busyReturnId) {
      return;
    }
    const fieldError = validateFreeText(rejectReasonDraft, {
      required: true,
      requiredMessage: 'Vui lòng nhập lý do từ chối yêu cầu hoàn hàng.',
      fieldLabel: 'Lý do từ chối',
    });

    if (fieldError) {
      setRejectReasonError(fieldError);
      return;
    }

    setRejectReasonError(null);
    setError(null);
    setBusyReturnId(item.id);
    try {
      await apiClient.reviewReturn(item.id, {
        action: 'REJECT',
        rejectionReason: rejectReasonDraft.trim(),
      });
      setRejectingReturnId(null);
      setRejectReasonDraft('');
      setReturns((prev) => prev.filter((candidate) => candidate.id !== item.id));
    } catch (err) {
      captureError(err, 'Không thể từ chối yêu cầu hoàn hàng.');
    } finally {
      setBusyReturnId(null);
    }
  };

  const handleCompleteReturn = async (item: ReturnRequest) => {
    if (busyReturnId) {
      return;
    }
    setError(null);
    setBusyReturnId(item.id);
    try {
      await apiClient.completeReturn(item.id);
      setReturns((prev) => prev.filter((candidate) => candidate.id !== item.id));
    } catch (err) {
      captureError(err, 'Không thể xác nhận hoàn tất hoàn hàng.');
    } finally {
      setBusyReturnId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-4">
        <div>
          <h1
            data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
            className="text-2xl font-bold text-mint-primary"
          >
            {SCREEN_NAMES.ADMIN_DASHBOARD}
          </h1>
          <p className="text-xs text-mint-secondary mt-1">
            Điều phối vận đơn, giám sát trạng thái giao hàng, xử lý sự cố và duyệt hoàn hàng.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-mint-secondary/15 pt-4">
          <button
            type="button"
            data-testid={TEST_IDS.ADMIN.ASSIGNMENT_TAB}
            onClick={() => handleTabSelect('assignment')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'assignment'
                ? 'bg-mint-primary text-white'
                : 'bg-mint-neutral text-mint-primary hover:bg-mint-secondary/15'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Chờ phân công Shipper</span>
          </button>

          <button
            type="button"
            data-testid={TEST_IDS.ADMIN.TRACKING_TAB}
            onClick={() => handleTabSelect('tracking')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'tracking'
                ? 'bg-mint-primary text-white'
                : 'bg-mint-neutral text-mint-primary hover:bg-mint-secondary/15'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Theo dõi tất cả đơn hàng</span>
          </button>

          <button
            type="button"
            data-testid={TEST_IDS.ADMIN.ISSUES_TAB}
            onClick={() => handleTabSelect('issues')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'issues'
                ? 'bg-mint-primary text-white'
                : 'bg-mint-neutral text-mint-primary hover:bg-mint-secondary/15'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sự cố giao hàng</span>
          </button>

          <button
            type="button"
            data-testid={TEST_IDS.ADMIN.RETURNS_TAB}
            onClick={() => handleTabSelect('returns')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'returns'
                ? 'bg-mint-primary text-white'
                : 'bg-mint-neutral text-mint-primary hover:bg-mint-secondary/15'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yêu cầu hoàn hàng</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorBanner
          message={error.message}
          code={error.code}
          traceId={error.traceId}
          onDismiss={() => setError(null)}
        />
      )}

      {activeTab === 'assignment' && (
        <section data-testid={TEST_IDS.ADMIN.DASHBOARD_TABLE} className="space-y-3">
          {loadingOrders ? (
            <LoadingSkeleton rows={3} />
          ) : pendingOrders.length === 0 ? (
            <EmptyState
              title="Không có đơn hàng nào đang chờ phân công"
              description="Các đơn hàng mới tạo sẽ tự động xuất hiện tại đây."
            />
          ) : (
            pendingOrders.map((order) => {
              const orderCode = getOrderCode(order);

              return (
                <div
                  key={order.id}
                  data-testid={TEST_IDS.ORDER.ORDER_LIST_ITEM}
                  className="bg-card rounded-xl border border-mint-secondary/20 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold font-mono text-sm text-mint-primary">
                        {orderCode}
                      </span>
                      <StatusBadge status={order.status} showDot />
                    </div>
                    <div className="text-xs text-mint-secondary-dark">
                      <span>Người nhận: {order.recipientName}</span>
                      <span> · {order.recipientPhone}</span>
                    </div>
                    <p className="text-xs text-mint-secondary">{order.deliveryAddress}</p>
                    <p className="text-[11px] font-mono text-mint-secondary">
                      Tạo lúc: {formatDateTimeVi(order.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    data-testid={TEST_IDS.ADMIN.ASSIGN_BUTTON}
                    onClick={() => void handleOpenAssignDialog(order)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors flex-shrink-0"
                  >
                    Tạo vận đơn &amp; Phân công
                  </button>
                </div>
              );
            })
          )}
        </section>
      )}

      {activeTab === 'tracking' && (
        <section data-testid={TEST_IDS.ADMIN.TRACKING_TABLE} className="space-y-3">
          {loadingOrders ? (
            <LoadingSkeleton rows={4} />
          ) : orders.length === 0 ? (
            <EmptyState title="Chưa có đơn hàng nào trong hệ thống" />
          ) : (
            orders.map((order) => {
              const orderCode = getOrderCode(order);

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
                  className="bg-card rounded-xl border border-mint-secondary/20 p-4 sm:p-5 shadow-sm hover:border-mint-tertiary/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold font-mono text-sm text-mint-primary">
                        {orderCode}
                      </span>
                      <StatusBadge status={order.status} showDot />
                    </div>
                    <div className="text-xs text-mint-secondary-dark">
                      <span>Khách hàng: {order.customerEmail || order.customerName}</span>
                      <span> · Người nhận: {order.recipientName}</span>
                    </div>
                    {order.shipment && (
                      <div className="text-xs text-mint-secondary font-mono">
                        Vận đơn: {order.shipment.trackingNumber} · Shipper:{' '}
                        {order.shipment.shipperEmail || order.shipment.shipperName}
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-mono text-mint-secondary flex-shrink-0">
                    {formatDateTimeVi(order.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </section>
      )}

      {activeTab === 'issues' && (
        <section data-testid={TEST_IDS.ADMIN.ISSUES_LIST} className="space-y-3">
          {loadingIssues ? (
            <LoadingSkeleton rows={3} />
          ) : issues.length === 0 ? (
            <EmptyState
              title="Không còn sự cố nào cần xử lý"
              description="Mọi sự cố giao hàng đã được ghi nhận kết quả xử lý."
            />
          ) : (
            issues.map((issue) => {
              const issueCode = getIssueCode(issue);
              const orderCode = getIssueOrderCode(issue);
              const associatedOrder = findAssociatedOrder(issue);
              const resolvedText = issue.resolutionResult ?? issue.resolutionNotes;
              const fieldError = issueErrors[issue.id];

              return (
                <div
                  key={issue.id}
                  data-testid={TEST_IDS.ADMIN.ISSUE_ITEM}
                  className="bg-card rounded-xl border border-mint-secondary/20 p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        data-testid={TEST_IDS.ADMIN.ISSUE_CODE}
                        className="font-bold font-mono text-sm text-mint-primary"
                      >
                        {issueCode}
                      </span>
                      <span
                        data-testid={TEST_IDS.ADMIN.ISSUE_TYPE}
                        className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        {getIssueTypeLabel(issue.issueType)}
                      </span>
                      <span className="text-xs font-mono text-mint-secondary">
                        Đơn: {orderCode}
                      </span>
                    </div>

                    <span
                      data-testid={TEST_IDS.ADMIN.ISSUE_REPORTED_AT}
                      className="text-xs font-mono text-mint-secondary"
                    >
                      {formatDateTimeVi(issue.reportedAt)}
                    </span>
                  </div>

                  <div className="text-xs text-mint-secondary-dark flex flex-wrap gap-x-4 gap-y-1">
                    <div>
                      <span>Người báo cáo: </span>
                      <span data-testid={TEST_IDS.ADMIN.ISSUE_REPORTER} className="font-medium">
                        {issue.reportedByEmail || issue.reportedByName || issue.reportedBy}
                      </span>
                    </div>
                    {associatedOrder && (
                      <div>
                        <span>Trạng thái đơn hiện tại: </span>
                        <StatusBadge status={associatedOrder.status} />
                      </div>
                    )}
                  </div>

                  {issue.notes && (
                    <p className="text-xs text-mint-secondary bg-mint-neutral/60 rounded-lg px-3 py-2">
                      {issue.notes}
                    </p>
                  )}

                  {resolvedText ? (
                    <div className="rounded-lg bg-mint-neutral/50 border border-mint-tertiary/30 px-3 py-2 text-xs text-mint-primary">
                      <span className="font-semibold">Kết quả xử lý: </span>
                      <span data-testid={TEST_IDS.ADMIN.ISSUE_RESULT_TEXT}>{resolvedText}</span>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          data-testid={TEST_IDS.ADMIN.ISSUE_RESULT_INPUT}
                          value={issueDrafts[issue.id] ?? ''}
                          onChange={(event) => {
                            const val = event.target.value;
                            setIssueDrafts((prev) => ({ ...prev, [issue.id]: val }));
                            setIssueErrors((prev) => {
                              const next = { ...prev };
                              delete next[issue.id];
                              return next;
                            });
                          }}
                          placeholder="Nhập kết quả xử lý sự cố..."
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
                        />

                        <button
                          type="button"
                          data-testid={TEST_IDS.ADMIN.ISSUE_RESULT_SAVE_BUTTON}
                          disabled={busyIssueId === issue.id}
                          onClick={() => void handleSaveIssueResult(issue)}
                          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors disabled:opacity-50"
                        >
                          Lưu kết quả
                        </button>

                        {issue.issueType === 'FAILED_DELIVERY' && (
                          <button
                            type="button"
                            data-testid={TEST_IDS.ADMIN.ISSUE_RETURN_BUTTON}
                            disabled={busyIssueId === issue.id}
                            onClick={() => void handleMoveIssueToReturning(issue)}
                            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            Chuyển hoàn hàng
                          </button>
                        )}
                      </div>

                      {fieldError && (
                        <p
                          role="alert"
                          data-testid={TEST_IDS.ADMIN.ISSUE_RESULT_ERROR}
                          className="text-xs font-medium text-red-600"
                        >
                          {fieldError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {activeTab === 'returns' && (
        <section data-testid={TEST_IDS.ADMIN.RETURNS_LIST} className="space-y-3">
          {loadingReturns ? (
            <LoadingSkeleton rows={3} />
          ) : activeReturns.length === 0 ? (
            <EmptyState
              title="Không có yêu cầu hoàn hàng cần xử lý"
              description="Chỉ hiển thị yêu cầu hoàn hàng ở trạng thái Chờ duyệt hoặc Đã chấp nhận."
            />
          ) : (
            activeReturns.map((item) => {
              const returnCode = getReturnCode(item);
              const orderCode = getReturnOrderCode(item);
              const isRejecting = rejectingReturnId === item.id;

              return (
                <div
                  key={item.id}
                  data-testid={TEST_IDS.ADMIN.RETURN_ITEM}
                  className="bg-card rounded-xl border border-mint-secondary/20 p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold font-mono text-sm text-mint-primary">
                        {returnCode}
                      </span>
                      <StatusBadge status={item.status} showDot />
                      <span className="text-xs font-mono text-mint-secondary">
                        Đơn: {orderCode}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-mint-secondary">
                      {formatDateTimeVi(item.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs text-mint-secondary-dark">
                    <span>Lý do: </span>
                    <span data-testid={TEST_IDS.ADMIN.RETURN_REASON} className="font-semibold">
                      {getReturnReasonLabel(item.reason)}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-mint-secondary bg-mint-neutral/60 rounded-lg px-3 py-2">
                      {item.notes}
                    </p>
                  )}

                  {item.status === 'PENDING_APPROVAL' && (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          data-testid={TEST_IDS.ADMIN.APPROVE_RETURN_BUTTON}
                          disabled={busyReturnId === item.id}
                          onClick={() => void handleApproveReturn(item)}
                          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors disabled:opacity-50"
                        >
                          Chấp nhận hoàn hàng
                        </button>

                        <button
                          type="button"
                          data-testid={TEST_IDS.ADMIN.REJECT_RETURN_BUTTON}
                          disabled={busyReturnId === item.id}
                          onClick={() => {
                            setRejectingReturnId(item.id);
                            setRejectReasonDraft('');
                            setRejectReasonError(null);
                          }}
                          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </div>

                      {isRejecting && (
                        <div className="bg-red-50/60 border border-red-200 rounded-lg p-3.5 space-y-2">
                          <label className="block text-xs font-semibold text-mint-primary">
                            Lý do từ chối yêu cầu hoàn hàng
                          </label>
                          <textarea
                            rows={2}
                            data-testid={TEST_IDS.ADMIN.REJECT_REASON_INPUT}
                            value={rejectReasonDraft}
                            onChange={(event) => {
                              setRejectReasonDraft(event.target.value);
                              setRejectReasonError(null);
                            }}
                            placeholder="Nhập lý do từ chối (tối đa 500 ký tự)..."
                            className="w-full px-3 py-2 text-xs rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-red-400"
                          />
                          {rejectReasonError && (
                            <p
                              role="alert"
                              data-testid={TEST_IDS.ADMIN.REJECT_REASON_ERROR}
                              className="text-xs font-medium text-red-600"
                            >
                              {rejectReasonError}
                            </p>
                          )}
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingReturnId(null);
                                setRejectReasonError(null);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              data-testid={TEST_IDS.ADMIN.REJECT_CONFIRM_BUTTON}
                              disabled={busyReturnId === item.id}
                              onClick={() => void handleConfirmRejectReturn(item)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Xác nhận từ chối
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {item.status === 'ACCEPTED' && (
                    <div
                      data-testid={TEST_IDS.ADMIN.RETURN_COMPLETE_FORM}
                      className="flex justify-end pt-1"
                    >
                      <button
                        type="button"
                        data-testid={TEST_IDS.ADMIN.RETURN_COMPLETE_BUTTON}
                        disabled={busyReturnId === item.id}
                        onClick={() => void handleCompleteReturn(item)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-mint-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Xác nhận hoàn tất hoàn hàng
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {assigningOrder && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid={TEST_IDS.ADMIN.ASSIGN_SHIPPER_DIALOG}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl border border-mint-secondary/20 space-y-4">
            <h2 className="text-lg font-bold text-mint-primary">
              Phân công Shipper cho đơn {getOrderCode(assigningOrder)}
            </h2>
            <p className="text-xs text-mint-secondary">
              Chọn Shipper phụ trách vận chuyển đơn hàng này.
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-shipper-select"
                className="block text-xs font-semibold text-mint-primary"
              >
                Shipper phụ trách
              </label>
              <select
                id="admin-shipper-select"
                data-testid={TEST_IDS.ADMIN.SHIPPER_SELECT}
                value={selectedShipperId}
                onChange={(event) => {
                  setSelectedShipperId(event.target.value);
                  setDialogError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
              >
                <option value="">-- Chọn Shipper --</option>
                {shippers.map((shipper) => (
                  <option key={shipper.id} value={shipper.id}>
                    {shipper.email ? `${shipper.fullName} (${shipper.email})` : shipper.fullName}
                  </option>
                ))}
              </select>
              {dialogError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {dialogError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={assigningSubmitting}
                onClick={() => {
                  setAssigningOrder(null);
                  setDialogError(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/35 text-mint-primary hover:bg-mint-neutral transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                data-testid={TEST_IDS.ADMIN.CONFIRM_ASSIGN_BUTTON}
                disabled={assigningSubmitting}
                onClick={() => void handleConfirmAssign()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors disabled:opacity-50"
              >
                {assigningSubmitting ? 'Đang lưu...' : 'Lưu phân công'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
