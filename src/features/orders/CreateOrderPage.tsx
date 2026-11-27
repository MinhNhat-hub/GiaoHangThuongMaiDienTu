import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { ApiClientError, apiClient } from '@/api/client';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { MESSAGES, getMessage } from '@/constants/messages';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import type { Order, Product } from '@/types/api';
import { getOrderCode, rememberOrder } from '@/utils/order';
import {
  validateOrderLines,
  validateOrderRecipient,
  type OrderLineErrors,
  type OrderRecipientErrors,
} from '@/utils/validation';

interface LineDraft {
  key: number;
  productId: string;
  quantity: string;
}

type CreationStep = 'product' | 'recipient' | 'confirm' | 'success';

// Guides a customer through the three-step order creation workflow.
export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<CreationStep>('product');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [lines, setLines] = useState<LineDraft[]>([{ key: 1, productId: '', quantity: '1' }]);
  const [nextLineKey, setNextLineKey] = useState(2);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [lineErrors, setLineErrors] = useState<OrderLineErrors>({});
  const [recipientErrors, setRecipientErrors] = useState<OrderRecipientErrors>({});
  const [apiError, setApiError] = useState<{ message: string; code?: string; traceId?: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .getProducts()
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        if (err instanceof ApiClientError) {
          setApiError({ message: err.message, code: err.code, traceId: err.traceId });
        } else {
          setApiError({ message: 'Không thể tải danh sách sản phẩm.' });
        }
      })
      .finally(() => {
        if (active) {
          setLoadingProducts(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAddLine = () => {
    setLines((prev) => [...prev, { key: nextLineKey, productId: '', quantity: '1' }]);
    setNextLineKey((prev) => prev + 1);
    setLineErrors({});
  };

  const handleRemoveLine = (key: number) => {
    setLines((prev) => prev.filter((item) => item.key !== key));
    setLineErrors({});
  };

  const handleLineChange = (key: number, field: 'productId' | 'quantity', value: string) => {
    setLines((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
    setLineErrors({});
  };

  const handleNextFromProduct = () => {
    setApiError(null);
    const errors = validateOrderLines(lines);
    if (errors.productError || errors.quantityError) {
      setLineErrors(errors);
      return;
    }
    setLineErrors({});
    setStep('recipient');
  };

  const handleNextFromRecipient = () => {
    setApiError(null);
    const errors = validateOrderRecipient({ recipientName, recipientPhone, deliveryAddress });
    if (errors.recipientName || errors.recipientPhone || errors.deliveryAddress) {
      setRecipientErrors(errors);
      return;
    }
    setRecipientErrors({});
    setStep('confirm');
  };

  const handleSubmitOrder = async () => {
    if (submitting) {
      return;
    }
    setApiError(null);
    setSubmitting(true);
    try {
      const order = await apiClient.createOrder({
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: Number(line.quantity.trim()),
        })),
      });
      rememberOrder(order);
      setCreatedOrder(order);
      setStep('success');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApiError({ message: err.message, code: err.code, traceId: err.traceId });
      } else {
        setApiError({ message: getMessage(MESSAGES.ORDER.CREATE_FAILED) });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resolveProductName = (productId: string): string => {
    return products.find((p) => p.id === productId)?.name ?? productId;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
            className="text-2xl font-bold text-mint-primary"
          >
            {SCREEN_NAMES.ORDER_CREATION}
          </h1>
          <p className="text-xs text-mint-secondary mt-1">
            Hoàn tất thông tin sản phẩm, người nhận và xác nhận để tạo đơn hàng.
          </p>
        </div>

        {step !== 'success' && (
          <button
            type="button"
            data-testid={TEST_IDS.ORDER.CANCEL_ORDER_CREATION_BUTTON}
            onClick={() => navigate(APP_PATHS.orderList)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Hủy tạo đơn
          </button>
        )}
      </div>

      {apiError && (
        <ErrorBanner
          message={apiError.message}
          code={apiError.code}
          traceId={apiError.traceId}
          onDismiss={() => setApiError(null)}
        />
      )}

      {loadingProducts ? (
        <LoadingSkeleton rows={3} />
      ) : step === 'product' ? (
        <section
          data-testid={TEST_IDS.ORDER.STEP_PRODUCT}
          className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-mint-primary">Bước 1: Chọn sản phẩm</h2>
            <button
              type="button"
              data-testid={TEST_IDS.ORDER.ADD_LINE_BUTTON}
              onClick={handleAddLine}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-mint-tertiary/40 text-mint-primary bg-mint-neutral hover:bg-mint-tertiary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng sản phẩm</span>
            </button>
          </div>

          {lines.length === 0 ? (
            <p className="text-sm text-mint-secondary bg-mint-neutral/60 rounded-lg p-4">
              Chưa có dòng sản phẩm nào. Hãy bấm &ldquo;Thêm dòng sản phẩm&rdquo;.
            </p>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div
                  key={line.key}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-mint-neutral/40 p-3.5 rounded-xl border border-mint-secondary/15"
                >
                  <div className="sm:col-span-7 space-y-1">
                    <label className="block text-xs font-semibold text-mint-primary">
                      Sản phẩm #{index + 1}
                    </label>
                    <select
                      data-testid={TEST_IDS.ORDER.PRODUCT_SELECT}
                      value={line.productId}
                      onChange={(event) =>
                        handleLineChange(line.key, 'productId', event.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-mint-primary">
                      Số lượng
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      data-testid={TEST_IDS.ORDER.QUANTITY_INPUT}
                      value={line.quantity}
                      onChange={(event) =>
                        handleLineChange(line.key, 'quantity', event.target.value)
                      }
                      placeholder="1"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.key)}
                      aria-label={`Xóa dòng sản phẩm ${index + 1}`}
                      className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lineErrors.productError && (
            <p
              role="alert"
              data-testid={TEST_IDS.ORDER.PRODUCT_ERROR}
              className="text-xs font-medium text-red-600"
            >
              {lineErrors.productError}
            </p>
          )}
          {lineErrors.quantityError && (
            <p
              role="alert"
              data-testid={TEST_IDS.ORDER.QUANTITY_ERROR}
              className="text-xs font-medium text-red-600"
            >
              {lineErrors.quantityError}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              data-testid={TEST_IDS.ORDER.NEXT_STEP_BUTTON}
              onClick={handleNextFromProduct}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors"
            >
              Tiếp tục
            </button>
          </div>
        </section>
      ) : step === 'recipient' ? (
        <section
          data-testid={TEST_IDS.ORDER.STEP_RECIPIENT}
          className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-base font-bold text-mint-primary">Bước 2: Thông tin người nhận</h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-mint-primary">Tên người nhận</label>
            <input
              type="text"
              data-testid={TEST_IDS.ORDER.RECIPIENT_NAME_INPUT}
              value={recipientName}
              onChange={(event) => {
                setRecipientName(event.target.value);
                setRecipientErrors((prev) => ({ ...prev, recipientName: undefined }));
              }}
              placeholder="Nhập tên người nhận"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
            />
            {recipientErrors.recipientName && (
              <p
                role="alert"
                data-testid={TEST_IDS.ORDER.RECIPIENT_NAME_ERROR}
                className="text-xs font-medium text-red-600"
              >
                {recipientErrors.recipientName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-mint-primary">
              Số điện thoại người nhận
            </label>
            <input
              type="tel"
              data-testid={TEST_IDS.ORDER.RECIPIENT_PHONE_INPUT}
              value={recipientPhone}
              onChange={(event) => {
                setRecipientPhone(event.target.value);
                setRecipientErrors((prev) => ({ ...prev, recipientPhone: undefined }));
              }}
              placeholder="0xxxxxxxxx"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
            />
            {recipientErrors.recipientPhone && (
              <p
                role="alert"
                data-testid={TEST_IDS.ORDER.RECIPIENT_PHONE_ERROR}
                className="text-xs font-medium text-red-600"
              >
                {recipientErrors.recipientPhone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-mint-primary">Địa chỉ giao</label>
            <textarea
              rows={3}
              data-testid={TEST_IDS.ORDER.DELIVERY_ADDRESS_INPUT}
              value={deliveryAddress}
              onChange={(event) => {
                setDeliveryAddress(event.target.value);
                setRecipientErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
              }}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-mint-secondary/30 bg-card text-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-tertiary"
            />
            {recipientErrors.deliveryAddress && (
              <p
                role="alert"
                data-testid={TEST_IDS.ORDER.DELIVERY_ADDRESS_ERROR}
                className="text-xs font-medium text-red-600"
              >
                {recipientErrors.deliveryAddress}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep('product')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              data-testid={TEST_IDS.ORDER.NEXT_STEP_BUTTON}
              onClick={handleNextFromRecipient}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors"
            >
              Tiếp tục
            </button>
          </div>
        </section>
      ) : step === 'confirm' ? (
        <section
          data-testid={TEST_IDS.ORDER.STEP_CONFIRM}
          className="bg-card rounded-2xl border border-mint-secondary/20 p-6 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-base font-bold text-mint-primary">
              Bước 3: Xác nhận thông tin đơn hàng
            </h2>
            <p className="text-xs text-mint-secondary mt-1">
              {getMessage(MESSAGES.ORDER.CONFIRM_PROMPT)}
            </p>
          </div>

          <div className="space-y-3 bg-mint-neutral/40 rounded-xl p-4 border border-mint-secondary/15">
            <h3 className="text-xs font-bold uppercase tracking-wide text-mint-secondary">
              Danh sách sản phẩm
            </h3>
            <ul className="space-y-2 text-sm text-mint-primary">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="flex items-center justify-between border-b border-mint-secondary/10 pb-1.5 last:border-b-0 last:pb-0"
                >
                  <span className="font-medium">{resolveProductName(line.productId)}</span>
                  <span className="font-mono text-xs bg-card px-2 py-0.5 rounded border border-mint-secondary/20">
                    Số lượng: {line.quantity.trim()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 bg-mint-neutral/40 rounded-xl p-4 border border-mint-secondary/15 text-sm">
            <h3 className="text-xs font-bold uppercase tracking-wide text-mint-secondary">
              Thông tin giao hàng
            </h3>
            <div>
              <span className="text-mint-secondary">Người nhận: </span>
              <span className="font-semibold text-mint-primary">{recipientName.trim()}</span>
            </div>
            <div>
              <span className="text-mint-secondary">Số điện thoại: </span>
              <span className="font-mono text-mint-primary">{recipientPhone.trim()}</span>
            </div>
            <div>
              <span className="text-mint-secondary">Địa chỉ giao: </span>
              <span className="text-mint-primary break-words">{deliveryAddress.trim()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              data-testid={TEST_IDS.ORDER.EDIT_BUTTON}
              disabled={submitting}
              onClick={() => setStep('product')}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-mint-secondary/35 text-mint-primary hover:bg-mint-neutral transition-colors disabled:opacity-50"
            >
              Chỉnh sửa
            </button>
            <button
              type="button"
              data-testid={TEST_IDS.ORDER.SUBMIT_ORDER_BUTTON}
              disabled={submitting}
              onClick={handleSubmitOrder}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Xác nhận đặt hàng'}
            </button>
          </div>
        </section>
      ) : (
        <section
          data-testid={TEST_IDS.ORDER.SUCCESS_MESSAGE}
          className="bg-card rounded-2xl border border-mint-tertiary/40 p-6 sm:p-8 shadow-sm space-y-4 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-mint-tertiary/15 text-mint-tertiary flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-mint-primary">
            {getMessage(MESSAGES.ORDER.CREATE_SUCCESS)}
          </h2>
          {createdOrder && (
            <p className="text-sm text-mint-secondary-dark">
              Mã đơn hàng của bạn:{' '}
              <strong
                data-testid={TEST_IDS.ORDER.SUCCESS_CODE}
                className="font-mono text-mint-primary"
              >
                {getOrderCode(createdOrder)}
              </strong>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {createdOrder && (
              <Link
                to={APP_PATHS.orderDetails(getOrderCode(createdOrder))}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover transition-colors"
              >
                Xem chi tiết đơn hàng
              </Link>
            )}
            <Link
              to={APP_PATHS.orderList}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
            >
              Danh sách đơn hàng
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
