import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { TEST_IDS } from '@/constants/test-ids';
import { apiClient } from '@/api/client';

function buildEmailOfLength(totalLength: number): string {
  const domain = '@example.com';
  return `${'a'.repeat(totalLength - domain.length)}${domain}`;
}

describe('customer account registration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('test_renders_register_screen_with_exact_title_and_unconstrained_input_lengths', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId(TEST_IDS.COMMON.SCREEN_TITLE)).toHaveTextContent('Đăng ký');
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT)).not.toHaveAttribute('maxlength');
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT)).not.toHaveAttribute('maxlength');
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT)).not.toHaveAttribute('maxlength');
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT)).not.toHaveAttribute('maxlength');
  });

  it('test_registers_valid_min_and_max_boundary_fields_and_navigates_signed_out_to_login', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            token: 'server_token_ignored',
            user: {
              id: 'cust_1',
              email: 'valid@example.com',
              fullName: 'A',
              phoneNumber: '0123456789',
              role: 'Customer',
            },
          },
          trace_id: 'trace_reg_1',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<div data-testid="login-landed">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT), 'A');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT), '0123456789');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT), '  VALID@Example.com  ');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT), 'abcdefgh');
    await user.click(screen.getByTestId(TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId('login-landed')).toBeInTheDocument();
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      fullName: 'A',
      email: 'valid@example.com',
      password: 'abcdefgh',
      phoneNumber: '0123456789',
    });
    expect(apiClient.getToken()).toBeNull();
    expect(apiClient.getUser()).toBeNull();
  });

  it('test_shows_all_missing_errors_simultaneously_including_whitespace_only_password', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    render(
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT), '   ');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT), '   ');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT), '   ');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT), '        ');
    await user.click(screen.getByTestId(TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON));

    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_ERROR)).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('test_rejects_overflowing_name_email_and_password_lengths_and_invalid_formats', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    render(
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT), 'a'.repeat(101));
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT), '1912345678');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT), buildEmailOfLength(255));
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT), 'p'.repeat(65));
    await user.click(screen.getByTestId(TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON));

    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_ERROR)).toHaveTextContent('100');
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_ERROR)).toHaveTextContent('254');
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_ERROR)).toHaveTextContent('8 đến 64');
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_ERROR)).toHaveTextContent('10 chữ số');

    await user.clear(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT));
    await user.clear(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT));
    await user.clear(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT));
    await user.clear(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT));

    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT), 'Nguyen Van B');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT), '09123a5678');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT), 'invalid-email');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT), '1234567');
    await user.click(screen.getByTestId(TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON));

    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_ERROR)).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_ERROR)).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  }, 15000);

  it('test_displays_error_banner_when_server_rejects_duplicate_email', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: 'EMAIL_EXISTS', message: 'Email đã thuộc một tài khoản khác.' },
          trace_id: 'trace_dup',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT), 'Nguyen Van A');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PHONE_INPUT), '0912345678');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_EMAIL_INPUT), 'an@example.com');
    await user.type(screen.getByTestId(TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT), 'Password123');
    await user.click(screen.getByTestId(TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.COMMON.ERROR_BANNER)).toHaveTextContent(
        'Email đã thuộc một tài khoản khác.'
      );
    });
  });
});
