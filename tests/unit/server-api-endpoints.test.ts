import http from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHttpServer } from '@/server/index';

describe('backend api endpoints and lifecycle workflows', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createHttpServer();
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 3000;
    baseUrl = `http://localhost:${port}/api/v1`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('test_registers_customer_and_logs_in_with_events_cookie', async () => {
    const registerEmail = `newcustomer_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerEmail,
        password: 'Password123!',
        fullName: 'New Customer User',
        phoneNumber: '0988776655',
      }),
    });

    expect(regRes.status).toBe(201);
    const regData = await regRes.json();
    expect(regData.success).toBe(true);
    expect(regData.data.user.role).toBe('Customer');
    expect(regData.data.token).toBeDefined();

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerEmail,
        password: 'Password123!',
      }),
    });

    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    expect(loginData.data.user.email).toBe(registerEmail);

    const cookie = loginRes.headers.get('set-cookie');
    expect(cookie).toContain('events_token=');
    expect(cookie).toContain('Path=/api/v1/events');
  });

  it('test_returns_unauthorized_when_credentials_do_not_match', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@store.vn',
        password: 'WrongPassword!',
      }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('test_enforces_authentication_and_role_boundaries_on_protected_endpoints', async () => {
    const unauthProducts = await fetch(`${baseUrl}/products`);
    expect(unauthProducts.status).toBe(401);

    const authProducts = await fetch(`${baseUrl}/products`, {
      headers: { 'Authorization': 'Bearer token_usr_customer_1' },
    });
    expect(authProducts.status).toBe(200);

    const customerAccessUsers = await fetch(`${baseUrl}/users`, {
      headers: { 'Authorization': 'Bearer token_usr_customer_1' },
    });
    expect(customerAccessUsers.status).toBe(403);

    const adminAccessUsers = await fetch(`${baseUrl}/users`, {
      headers: { 'Authorization': 'Bearer token_usr_admin_1' },
    });
    expect(adminAccessUsers.status).toBe(200);
  });

  it('test_creates_order_and_handles_storage_failure_simulation', async () => {
    const failRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_usr_customer_1',
        'X-Simulate-Failure': 'order-store',
      },
      body: JSON.stringify({
        recipientName: 'Le Thi Khach',
        recipientPhone: '0934567890',
        deliveryAddress: '123 Nguyen Hue, Q1, TP.HCM',
        items: [{ productId: 'prod_1', quantity: 2 }],
      }),
    });

    expect(failRes.status).toBe(500);
    const failBody = await failRes.json();
    expect(failBody.success).toBe(false);
    expect(failBody.error.code).toBe('ORDER_STORAGE_FAILED');

    const successRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_usr_customer_1',
      },
      body: JSON.stringify({
        recipientName: 'Le Thi Khach',
        recipientPhone: '0934567890',
        deliveryAddress: '123 Nguyen Hue, Q1, TP.HCM',
        items: [{ productId: 'prod_1', quantity: 2 }],
      }),
    });

    expect(successRes.status).toBe(201);
    const successBody = await successRes.json();
    expect(successBody.success).toBe(true);
    expect(successBody.data.status).toBe('PENDING_CONFIRMATION');
  });

  it('test_executes_shipment_assignment_and_status_transitions', async () => {
    const assignRes = await fetch(`${baseUrl}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_usr_admin_1',
      },
      body: JSON.stringify({
        orderId: 'ord_1',
        shipperId: 'shp_1',
      }),
    });

    expect(assignRes.status).toBe(201);
    const assignBody = await assignRes.json();
    expect(assignBody.success).toBe(true);
    expect(assignBody.data.shipperId).toBe('shp_1');

    const assignedRes = await fetch(`${baseUrl}/shipments/assigned`, {
      headers: {
        'Authorization': 'Bearer token_shp_1',
      },
    });
    expect(assignedRes.status).toBe(200);
    const assignedBody = await assignedRes.json();
    expect(assignedBody.data.some((o: any) => o.id === 'ord_1')).toBe(true);

    const statusRes = await fetch(`${baseUrl}/shipments/ord_1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_shp_1',
      },
      body: JSON.stringify({
        action: 'START_DELIVERY',
        notes: 'Picking up package from warehouse',
      }),
    });

    expect(statusRes.status).toBe(200);
    const statusBody = await statusRes.json();
    expect(statusBody.data.status).toBe('DELIVERING');

    const deliveredRes = await fetch(`${baseUrl}/shipments/ord_1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_shp_1',
      },
      body: JSON.stringify({
        action: 'CONFIRM_DELIVERED',
        notes: 'Handed package to recipient',
      }),
    });

    expect(deliveredRes.status).toBe(200);
    const deliveredBody = await deliveredRes.json();
    expect(deliveredBody.data.status).toBe('DELIVERED');
  });

  it('test_executes_return_review_and_maps_status_to_damaged', async () => {
    const reviewRes = await fetch(`${baseUrl}/returns/ret_1/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_usr_admin_1',
      },
      body: JSON.stringify({
        action: 'APPROVE',
      }),
    });

    expect(reviewRes.status).toBe(200);
    const reviewData = await reviewRes.json();
    expect(reviewData.data.status).toBe('ACCEPTED');

    const orderRes = await fetch(`${baseUrl}/orders/ord_4`, {
      headers: { 'Authorization': 'Bearer token_usr_admin_1' },
    });
    const orderData = await orderRes.json();
    expect(orderData.data.status).toBe('DAMAGED');
  });

  it('test_executes_issue_reporting_and_admin_resolution', async () => {
    const reportRes = await fetch(`${baseUrl}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_shp_1',
      },
      body: JSON.stringify({
        orderId: 'ord_3',
        issueType: 'FAILED_DELIVERY',
        notes: 'Customer unreachable after 3 phone calls',
      }),
    });

    expect(reportRes.status).toBe(201);
    const reportData = await reportRes.json();
    expect(reportData.data.issueType).toBe('FAILED_DELIVERY');
    const issueId = reportData.data.id;

    const resolveRes = await fetch(`${baseUrl}/issues/${issueId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_usr_admin_1',
      },
      body: JSON.stringify({
        resolutionNotes: 'Customer contacted via email, rescheduled delivery',
      }),
    });

    expect(resolveRes.status).toBe(200);
    const resolveData = await resolveRes.json();
    expect(resolveData.data.resolved).toBe(true);
    expect(resolveData.data.resolutionNotes).toContain('rescheduled delivery');
  });

  it('test_enforces_three_attempt_threshold_before_processing_return_to_seller', async () => {
    const earlyReturnRes = await fetch(`${baseUrl}/shipments/ord_6/return`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer token_usr_admin_1',
      },
    });

    expect(earlyReturnRes.status).toBe(409);
    const earlyBody = await earlyReturnRes.json();
    expect(earlyBody.error.code).toBe('RETURN_THRESHOLD_NOT_REACHED');

    const validReturnRes = await fetch(`${baseUrl}/shipments/ord_8/return`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer token_usr_admin_1',
      },
    });

    expect(validReturnRes.status).toBe(200);
    const validBody = await validReturnRes.json();
    expect(validBody.data.status).toBe('RETURNING');
  });
});
