import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError, apiClient } from '@/api/client';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  getOrderStatusMeta,
  getReturnStatusMeta,
  getStatusMeta,
  normalizeOrderStatus,
  normalizeReturnStatus,
  type AnyStatusCode,
} from '@/constants/status-map';
import { TEST_IDS } from '@/constants/test-ids';
import { realtimeClient } from '@/realtime/event-client';
import { formatDateTimeVi, isWithinReturnWindow } from '@/utils/date';
import { formatStatusTransitionText, sortStatusHistoryAsc } from '@/utils/order';
import {
  getNormalizedLength,
  validateFreeText,
  validateOrderLines,
  validateOrderRecipient,
  validateRegisterInput,
} from '@/utils/validation';

describe('status normalization and badge safety', () => {
  it('test_normalizes_delivery_failed_and_approved_aliases_to_canonical_statuses', () => {
    expect(normalizeOrderStatus('DELIVERY_FAILED')).toBe('FAILED_DELIVERY');
    expect(normalizeOrderStatus('FAILED_DELIVERY')).toBe('FAILED_DELIVERY');
    expect(normalizeReturnStatus('APPROVED')).toBe('ACCEPTED');
    expect(normalizeReturnStatus('ACCEPTED')).toBe('ACCEPTED');

    expect(getOrderStatusMeta('DELIVERY_FAILED').labelVi).toBe('Giao không thành công');
    expect(getReturnStatusMeta('APPROVED').labelVi).toBe('Đã chấp nhận');
    expect(getStatusMeta('DELIVERY_FAILED').labelVi).toBe('Giao không thành công');
    expect(getStatusMeta('APPROVED').labelVi).toBe('Đã chấp nhận');
  });

  it('test_renders_status_badge_safely_for_aliases_and_unknown_status_codes', () => {
    const { rerender } = render(<StatusBadge status={'DELIVERY_FAILED' as AnyStatusCode} />);
    expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent(
      'Giao không thành công'
    );

    rerender(<StatusBadge status={'UNKNOWN_FUTURE_CODE' as AnyStatusCode} />);
    expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent(
      'UNKNOWN_FUTURE_CODE'
    );

    rerender(<StatusBadge status={'toString' as AnyStatusCode} />);
    expect(screen.getByTestId(TEST_IDS.COMMON.STATUS_BADGE)).toHaveTextContent('toString');
  });

  it('test_ignores_object_prototype_keys_and_formats_alias_transitions_in_vietnamese', () => {
    expect(normalizeOrderStatus('constructor')).toBe('constructor');
    expect(normalizeReturnStatus('valueOf')).toBe('valueOf');
    expect(getOrderStatusMeta('toString').labelVi).toBe('toString');
    expect(getReturnStatusMeta('toString').labelVi).toBe('toString');
    expect(getStatusMeta('toString').labelVi).toBe('toString');
    expect(
      formatStatusTransitionText('DELIVERING', 'DELIVERY_FAILED' as never)
    ).toBe('Đang giao → Giao không thành công');
  });
});

describe('api client contract and status normalization', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('test_sends_credentials_on_login_and_logout_and_omits_content_type_on_get', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          trace_id: 'trace-login',
          data: {
            token: 'jwt-123',
            user: {
              id: 'u1',
              email: 'customer@example.com',
              fullName: 'Nguyen Van A',
              role: 'Customer',
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          trace_id: 'trace-orders',
          data: [
            {
              id: 'o1',
              customerId: 'u1',
              recipientName: 'Tran B',
              recipientPhone: '0912345678',
              deliveryAddress: '123 Le Loi',
              status: 'DELIVERY_FAILED',
              createdAt: '2026-11-13T00:30:00Z',
              items: [{ productId: 'p1', quantity: 1 }],
              history: [
                {
                  oldStatus: 'DELIVERING',
                  newStatus: 'DELIVERY_FAILED',
                  changedBy: 'shipper_1',
                  changedAt: '2026-11-13T02:00:00Z',
                },
              ],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, trace_id: 'trace-logout', data: null }),
      });

    await apiClient.login({ email: '  Customer@Example.com ', password: 'Password123' });
    const [loginUrl, loginInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(loginUrl).toBe('/api/v1/auth/login');
    expect(loginInit.credentials).toBe('include');
    expect((loginInit.headers as Headers).get('Content-Type')).toBe('application/json');

    const orders = await apiClient.listOrders();
    const [, listInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect((listInit.headers as Headers).get('Authorization')).toBe('Bearer jwt-123');
    expect((listInit.headers as Headers).get('Content-Type')).toBeNull();
    expect(orders[0].status).toBe('FAILED_DELIVERY');
    expect(orders[0].history?.[0].newStatus).toBe('FAILED_DELIVERY');

    await apiClient.logout();
    const [logoutUrl, logoutInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(logoutUrl).toBe('/api/v1/auth/logout');
    expect(logoutInit.credentials).toBe('include');
    expect(apiClient.getToken()).toBeNull();
  });

  it('test_sends_valid_json_body_for_return_shipment_endpoints_and_normalizes_return_status', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          trace_id: 'trace-return',
          data: {
            id: 'o2',
            customerId: 'u1',
            recipientName: 'Tran B',
            recipientPhone: '0912345678',
            deliveryAddress: '123 Le Loi',
            status: 'RETURNING',
            createdAt: '2026-11-13T00:30:00Z',
            items: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          trace_id: 'trace-ret-list',
          data: [
            {
              id: 'ret_1',
              orderId: 'o2',
              customerId: 'u1',
              reason: 'DAMAGED_OR_DEFECTIVE',
              status: 'APPROVED',
              submittedAt: '2026-11-13T03:00:00Z',
            },
          ],
        }),
      });

    await apiClient.processReturnShipment('ship_1');
    const [retUrl, retInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(retUrl).toBe('/api/v1/shipments/ship_1/return');
    expect(retInit.body).toBe('{}');
    expect((retInit.headers as Headers).get('Content-Type')).toBe('application/json');

    const returns = await apiClient.listReturns();
    expect(returns[0].status).toBe('ACCEPTED');
    expect(returns[0].createdAt).toBe('2026-11-13T03:00:00Z');
  });

  it('test_url_encodes_order_and_tracking_path_identifiers', async () => {
    const orderPayload = {
      id: 'o3',
      customerId: 'u1',
      recipientName: 'Tran B',
      recipientPhone: '0912345678',
      deliveryAddress: '123 Le Loi',
      status: 'DELIVERING',
      createdAt: '2026-11-13T00:30:00Z',
      items: [],
    };
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, trace_id: 'tr-1', data: orderPayload }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, trace_id: 'tr-2', data: orderPayload }),
      });

    await apiClient.trackShipment('TRK 9999/test?x=1');
    await apiClient.getOrderDetail('order/1?a=b');

    expect((fetchMock.mock.calls[0] as [string])[0]).toBe(
      '/api/v1/shipments/track/TRK%209999%2Ftest%3Fx%3D1'
    );
    expect((fetchMock.mock.calls[1] as [string])[0]).toBe('/api/v1/orders/order%2F1%3Fa%3Db');
  });

  it('test_url_encodes_shipment_issue_and_return_path_identifiers', async () => {
    const orderPayload = {
      id: 'o4',
      customerId: 'u1',
      recipientName: 'Tran B',
      recipientPhone: '0912345678',
      deliveryAddress: '123 Le Loi',
      status: 'DELIVERING',
      createdAt: '2026-11-13T00:30:00Z',
      items: [],
    };
    const issuePayload = {
      id: 'iss/1?a=b',
      orderId: 'o4',
      issueType: 'DAMAGED',
      reportedBy: 's1',
      reportedAt: '2026-11-13T01:00:00Z',
      resolved: true,
    };
    const returnPayload = {
      id: 'ret/1?a=b',
      orderId: 'o4',
      customerId: 'u1',
      reason: 'OTHER',
      status: 'ACCEPTED',
      createdAt: '2026-11-13T02:00:00Z',
    };

    const okJson = (data: unknown) => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, trace_id: 'tr-enc', data }),
    });

    fetchMock
      .mockResolvedValueOnce(okJson(orderPayload))
      .mockResolvedValueOnce(okJson(orderPayload))
      .mockResolvedValueOnce(okJson(orderPayload))
      .mockResolvedValueOnce(okJson(issuePayload))
      .mockResolvedValueOnce(okJson(returnPayload))
      .mockResolvedValueOnce(okJson(returnPayload));

    await apiClient.updateShipmentStatus('ship/1?x=1', { action: 'START_DELIVERY' });
    await apiClient.processReturnShipment('ship/2#frag');
    await apiClient.confirmReturnReceived('ship 3/ok');
    await apiClient.resolveIssue('iss/1?a=b', { resolutionNotes: 'Done' });
    await apiClient.reviewReturn('ret/1?a=b', { action: 'APPROVE' });
    await apiClient.completeReturn('ret/2?c=d');

    expect((fetchMock.mock.calls[0] as [string])[0]).toBe('/api/v1/shipments/ship%2F1%3Fx%3D1/status');
    expect((fetchMock.mock.calls[1] as [string])[0]).toBe('/api/v1/shipments/ship%2F2%23frag/return');
    expect((fetchMock.mock.calls[2] as [string])[0]).toBe(
      '/api/v1/shipments/ship%203%2Fok/confirm-returned'
    );
    expect((fetchMock.mock.calls[3] as [string])[0]).toBe('/api/v1/issues/iss%2F1%3Fa%3Db/resolve');
    expect((fetchMock.mock.calls[4] as [string])[0]).toBe('/api/v1/returns/ret%2F1%3Fa%3Db/review');
    expect((fetchMock.mock.calls[5] as [string])[0]).toBe('/api/v1/returns/ret%2F2%3Fc%3Dd/complete');
  });

  it('test_throws_structured_errors_on_network_failure_and_invalid_json', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(apiClient.listOrders()).rejects.toMatchObject({
      code: 'NETWORK_DISCONNECTED',
      status: 0,
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    await expect(apiClient.listOrders()).rejects.toBeInstanceOf(ApiClientError);
  });

  it('test_normalizes_realtime_status_aliases_before_notifying_subscribers', () => {
    const orderHandler = vi.fn();
    const returnHandler = vi.fn();
    const unsubOrder = realtimeClient.subscribe('order.status_changed', orderHandler);
    const unsubReturn = realtimeClient.subscribe('return.status_changed', returnHandler);

    realtimeClient.emit('order.status_changed', {
      orderId: 'o1',
      oldStatus: 'DELIVERING',
      newStatus: 'DELIVERY_FAILED' as never,
      changedAt: '2026-11-13T05:00:00Z',
    });
    realtimeClient.emit('return.status_changed', {
      requestId: 'r1',
      orderId: 'o1',
      newStatus: 'APPROVED' as never,
    });

    unsubOrder();
    unsubReturn();

    expect(orderHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        oldStatus: 'DELIVERING',
        newStatus: 'FAILED_DELIVERY',
      })
    );
    expect(returnHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        newStatus: 'ACCEPTED',
      })
    );
  });
});

describe('unit test specification boundary matrix', () => {
  it('test_sorts_status_history_chronologically_and_preserves_equal_timestamp_order', () => {
    const unsorted = [
      { oldStatus: 'WAITING_PICKUP' as const, newStatus: 'DELIVERING' as const, changedBy: 's1', changedAt: '2026-11-13T09:00:00Z' },
      { oldStatus: null, newStatus: 'PENDING_CONFIRMATION' as const, changedBy: 'c1', changedAt: '2026-11-13T07:00:00Z' },
      { oldStatus: 'PENDING_CONFIRMATION' as const, newStatus: 'WAITING_PICKUP' as const, changedBy: 'a1', changedAt: '2026-11-13T08:00:00Z' },
    ];
    const sorted = sortStatusHistoryAsc(unsorted);
    expect(sorted.map((e) => e.newStatus)).toEqual([
      'PENDING_CONFIRMATION',
      'WAITING_PICKUP',
      'DELIVERING',
    ]);
  });

  it('test_formats_vietnam_utc_plus_7_dates_across_year_and_single_digit_boundaries', () => {
    expect(formatDateTimeVi('2026-11-13T00:30:00Z')).toBe('13/11/2026 07:30');
    expect(formatDateTimeVi('2026-12-31T17:00:00Z')).toBe('01/01/2027 00:00');
    expect(formatDateTimeVi('2026-01-05T03:04:00Z')).toBe('05/01/2026 10:04');
  });

  it('test_rejects_negative_elapsed_time_and_invalid_dates_in_return_window', () => {
    expect(isWithinReturnWindow('2026-11-20T10:00:00Z', new Date('2026-11-19T10:00:00Z'))).toBe(false);
    expect(isWithinReturnWindow('invalid-date', new Date('2026-11-19T10:00:00Z'))).toBe(false);
  });

  it('test_enforces_phone_password_email_quantity_and_unicode_length_boundaries', () => {
    expect(getNormalizedLength('e\u0301')).toBe(1);

    const shortPassAndBadPhone = validateRegisterInput({
      fullName: 'Nguyen Van A',
      email: 'bad..email@',
      password: '1234567',
      phoneNumber: '091234567',
    });
    expect(shortPassAndBadPhone.email).toBeDefined();
    expect(shortPassAndBadPhone.password).toBeDefined();
    expect(shortPassAndBadPhone.phoneNumber).toBeDefined();

    const specialCharPass = validateRegisterInput({
      fullName: 'Nguyen Van A',
      email: 'valid+tag@example.co',
      password: 'a !@#$%^',
      phoneNumber: '0912345678',
    });
    expect(specialCharPass).toEqual({});

    expect(validateOrderLines([{ productId: 'p1', quantity: '0' }]).quantityError).toBeDefined();
    expect(validateOrderLines([{ productId: 'p1', quantity: '-2' }]).quantityError).toBeDefined();
    expect(validateOrderLines([{ productId: '', quantity: '1' }]).productError).toBeDefined();

    expect(
      validateOrderRecipient({
        recipientName: 'a'.repeat(100),
        recipientPhone: '0912345678',
        deliveryAddress: 'b'.repeat(255),
      })
    ).toEqual({});

    expect(
      validateFreeText('a'.repeat(500), {
        required: true,
        requiredMessage: 'Required',
        fieldLabel: 'Notes',
      })
    ).toBeUndefined();
  });
});
