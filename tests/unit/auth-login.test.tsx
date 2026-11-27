import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '@/features/auth/LoginPage';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProtectedLayout, RoleRoute } from '@/routes/guards';
import { TEST_IDS } from '@/constants/test-ids';
import { apiClient } from '@/api/client';

describe('authentication login and access boundaries', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('test_renders_login_screen_with_exact_title_and_register_link', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId(TEST_IDS.COMMON.SCREEN_TITLE)).toHaveTextContent('Đăng nhập');
    expect(screen.getByTestId(TEST_IDS.AUTH.OPEN_REGISTER_LINK)).toHaveAttribute('href', '/register');
    expect(screen.queryByText(/Tài khoản kiểm thử/i)).not.toBeInTheDocument();
  });

  it('test_shows_missing_field_errors_when_email_or_password_is_empty', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <LoginPage />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId(TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON));

    expect(screen.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.AUTH.LOGIN_PASSWORD_ERROR)).toBeVisible();
  });

  it('test_trims_and_lowercases_email_on_login_and_navigates_by_role', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            token: 'jwt_admin_token',
            user: {
              id: 'adm_1',
              email: 'admin@store.vn',
              fullName: 'Admin Store',
              phoneNumber: '0901234567',
              role: 'Admin',
            },
          },
          trace_id: 'trace_1',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin" element={<div data-testid="admin-landed">Admin</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT), '  ADMIN@Store.vn  ');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.LOGIN_PASSWORD_INPUT), 'ValidPass123');
    await user.click(screen.getByTestId(TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId('admin-landed')).toBeInTheDocument();
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      email: 'admin@store.vn',
      password: 'ValidPass123',
    });
    expect(apiClient.getToken()).toBe('jwt_admin_token');
  });

  it('test_displays_identical_error_message_for_any_rejected_credentials', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: false,
            data: null,
            error: { code: 'USER_NOT_FOUND', message: 'Account does not exist' },
            trace_id: 'trace_a',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: false,
            data: null,
            error: { code: 'WRONG_PASSWORD', message: 'Password mismatch' },
            trace_id: 'trace_b',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

    render(
      <MemoryRouter initialEntries={['/']}>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT), 'missing@example.com');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.LOGIN_PASSWORD_INPUT), 'Secret123');
    await user.click(screen.getByTestId(TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toBeVisible();
    });
    const firstMessage = screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER).textContent;

    await user.clear(screen.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT));
    await user.type(screen.getByTestId(TEST_IDS.AUTH.LOGIN_EMAIL_INPUT), 'customer@example.com');
    await user.click(screen.getByTestId(TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER).textContent).not.toBe('');
    });
    const secondMessage = screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER).textContent;

    expect(firstMessage).toContain('Email hoặc mật khẩu không đúng.');
    expect(secondMessage).toContain('Email hoặc mật khẩu không đúng.');
    expect(firstMessage?.replace(/Mã truy vết:.*/, '')).toBe(
      secondMessage?.replace(/Mã truy vết:.*/, '')
    );
  });

  it('test_redirects_unauthenticated_users_to_login_and_blocks_wrong_role_screens', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div data-testid="login-screen">Login</div>} />
          <Route element={<ProtectedLayout />}>
            <Route element={<RoleRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<div data-testid={TEST_IDS.ADMIN.DASHBOARD_TABLE}>Admin</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-screen')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE)).not.toBeInTheDocument();

    apiClient.setToken('cust_token');
    apiClient.setUser({
      id: 'c1',
      email: 'cust@example.com',
      fullName: 'Customer One',
      phoneNumber: '0901234567',
      role: 'Customer',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div data-testid="login-screen">Login</div>} />
          <Route element={<ProtectedLayout />}>
            <Route element={<RoleRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<div data-testid={TEST_IDS.ADMIN.DASHBOARD_TABLE}>Admin</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId(TEST_IDS.ADMIN.DASHBOARD_TABLE)).not.toBeInTheDocument();
    expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument();
  });

  it('test_logs_out_immediately_when_clicking_header_logout_button', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: null, trace_id: 't1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    apiClient.setToken('cust_token');
    apiClient.setUser({
      id: 'c1',
      email: 'cust@example.com',
      fullName: 'Customer Name',
      phoneNumber: '0912345678',
      role: 'Customer',
    });

    render(
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/" element={<div data-testid="login-landed">Login</div>} />
          <Route path="/orders" element={<AppHeader />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId(TEST_IDS.COMMON.ACCOUNT_FULLNAME)).toHaveTextContent('Customer Name');
    expect(screen.getByTestId(TEST_IDS.COMMON.ACCOUNT_EMAIL)).toHaveTextContent('cust@example.com');
    expect(screen.getByTestId(TEST_IDS.COMMON.ACCOUNT_PHONE)).toHaveTextContent('0912345678');

    await user.click(screen.getByTestId(TEST_IDS.AUTH.LOGOUT_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId('login-landed')).toBeInTheDocument();
    });
    expect(apiClient.getToken()).toBeNull();
    expect(apiClient.getUser()).toBeNull();
  });
});
