import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { MESSAGES, getMessage } from '@/constants/messages';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { RETURN_REASON_LABELS, type ReturnReasonCode } from '@/constants/status-map';
import { TEST_IDS } from '@/constants/test-ids';
import type { Order, ReturnRequest } from '@/types/api';
import { isWithinReturnWindow } from '@/utils/date';
import {
  getDeliveredTimestamp,
  getOrderCode,
  getReturnCode,
  getReturnOrderCode,
  rememberOrder,
} from '@/utils/order';
import { validateFreeText } from '@/utils/validation';

const RETURN_REASONS = Object.entries(RETURN_REASON_LABELS) as Array<[ReturnReasonCode, string]>;

function evaluateReturnEligibility(
  order: Order,
  existingReturns: ReturnRequest[]
): string | null {
  if (order.status !== 'DELIVERED') {
    return 'Chỉ có thể gửi yêu cầu hoàn hàng khi đơn hàng ở trạng thái Đã giao.';
  }

  const deliveredAt = getDeliveredTimestamp(order);
  if (!isWithinReturnWindow(deliveredAt)) {
    return 'Đơn hàng đã quá thời hạn 15 ngày kể từ lúc giao thành công nên không thể hoàn hàng.';
  }

  const orderCode = getOrderCode(order);
  const alreadyRequested = existingReturns.some(
    (item) => item.orderId === order.id || getReturnOrderCode(item) === orderCode
  );
  if (alreadyRequested) {
    return 'Đơn hàng này đã có yêu cầu hoàn hàng trước đó.';
  }

  return null;
}

// Handles return request eligibility checks and submission for a delivered order.
export const ReturnRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [ineligibleReason, setIneligibleReason] = useState<string | null>(null);
  const [reason, setReason] = useState<ReturnReasonCode | ''>('');
  const [notes, setNotes] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [notesError, setNotesError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ReturnRequest | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) {
      setIneligibleReason('Không tìm thấy mã đơn hàng.');
      setLoading(false);
      return;
    }

    Promise.all([apiClient.getOrderDetail(id), apiClient.listReturns()])
      .then(([loadedOrder, returns]) => {
        if (!active) {
          return;
        }
        rememberOrder(loadedOrder);
        setOrder(loadedOrder);
        setIneligibleReason(evaluateReturnEligibility(loadedOrder, returns));
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        if (err instanceof ApiClientError) {
          setApiError({ message: err.message, code: err.code, traceId: err.traceId });
        } else {
          setApiError({ message: 'Không thể kiểm tra điều kiện hoàn hàng cho đơn hàng.' });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const orderCode = order ? getOrderCode(order) : id ?? '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!order || submitting) {
      return;
    }

    let nextReasonError: string | undefined;
    if (!reason) {
      nextReasonError = 'Vui lòng chọn lý do hoàn hàng.';
    }

    const nextNotesError = validateFreeText(notes, {
      required: reason === 'OTHER',
      requiredMessage: 'Vui lòng nhập mô tả chi tiết khi chọn lý do Khác.',
      fieldLabel: 'Mô tả chi tiết',
    });

    setReasonError(nextReasonError);
    setNotesError(nextNotesError);
    if (nextReasonError || nextNotesError) {
      return;
    }

    setApiError(null);
    setSubmitting(true);
    try {
      const created = await apiClient.submitReturn({
        orderId: order.id,
        reason: reason as ReturnReasonCode,
        notes: notes.trim() || undefined,
      });
      setSubmittedRequest(created);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApiError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setApiError({ message: 'Không thể gửi yêu cầu hoàn hàng.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
            className="text-2xl font-bold text-mint-primary"
          >
            {SCREEN_NAMES.RETURN_REQUEST}
          </h1>
          <p className="text-xs text-mint-secondary mt-1">
            Gửi yêu cầu hoàn hàng cho đơn hàng {orderCode} trong vòng 15 ngày kể từ khi giao.
          </p>
        </div>
        <Link
          to={APP_PATHS.orderDetails(orderCode)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
        >
          Chi tiết đơn hàng
        </Link>
      </div>

      {apiError && (
        <ErrorBanner
          message={apiError.message}
          code={apiError.code}
          traceId={apiError.traceId}
          onDismiss={() => setApiError(null)}
        />
      )}

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : ineligibleReason ? (
        <div className="space-y-4">
          <ErrorBanner message={ineligibleReason} />
          <div className="flex justify-end">
            <button
              type="button"
              data-testid={TEST_IDS.RETURN.CANCEL_BUTTON}
              onClick={() => navigate(APP_PATHS.orderDetails(orderCode))}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/35 text-mint-primary hover:bg-mint-neutral transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      ) : submittedRequest ? (
        <div
          role="status"
          data-testid={TEST_IDS.RETURN.SUCCESS_MESSAGE}
          className="bg-card rounded-2xl border border-mint-tertiary/40 p-6 sm:p-8 shadow-sm text-center space-y-4"
        >
          <div className="w-12 h-12 rounded-full bg-mint-tertiary/15 text-mint-tertiary flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-mint-primary">
            {getMessage(MESSAGES.RETURN.SUBMIT_SUCCESS)}
          </h2>
          <p className="text-xs font-mono text-mint-secondary">
            Mã yêu cầu: {getReturnCode(submittedRequest)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={APP_PATHS.returnList}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors"
            >
              Xem yêu cầu hoàn hàng đã gửi
            </Link>
            <Link
              to={APP_PATHS.orderDetails(orderCode)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
            >
              Về chi tiết đơn hàng
            </Link>
          </div>
        </div>
      ) : !order ? null : (
        <form
          onSubmit={handleSubmit}
          data-testid={TEST_IDS.RETURN.REQUEST_FORM}
          className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-5"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="return-reason-select"
              className="block text-xs font-semibold text-mint-primary"
            >
              Lý do hoàn hàng
            </label>
            <select
              id="return-reason-select"
              data-testid={TEST_IDS.RETURN.REASON_SELECT}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value as ReturnReasonCode | '');
                setReasonError(undefined);
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
            >
              <option value="">-- Chọn lý do hoàn hàng --</option>
              {RETURN_REASONS.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            {reasonError && (
              <p
                role="alert"
                data-testid={TEST_IDS.RETURN.REASON_ERROR}
                className="text-xs font-medium text-red-600"
              >
                {reasonError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="return-notes-input"
              className="block text-xs font-semibold text-mint-primary"
            >
              Ghi chú mô tả (tùy chọn)
            </label>
            <textarea
              id="return-notes-input"
              rows={4}
              data-testid={TEST_IDS.RETURN.NOTES_INPUT}
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setNotesError(undefined);
              }}
              placeholder="Mô tả thêm về tình trạng hàng hóa hoặc lý do hoàn hàng (tối đa 500 ký tự)"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
            />
            {notesError && (
              <p
                role="alert"
                data-testid={TEST_IDS.RETURN.NOTES_ERROR}
                className="text-xs font-medium text-red-600"
              >
                {notesError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              data-testid={TEST_IDS.RETURN.CANCEL_BUTTON}
              disabled={submitting}
              onClick={() => navigate(APP_PATHS.orderDetails(orderCode))}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/35 text-mint-primary hover:bg-mint-neutral transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              data-testid={TEST_IDS.RETURN.SUBMIT_BUTTON}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu hoàn hàng'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
