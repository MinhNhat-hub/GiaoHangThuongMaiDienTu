// Authentication login page handling credential submission and role redirection.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Shield, Truck, User, Eye, EyeOff, X, HelpCircle } from 'lucide-react';
import { apiClient, ApiClientError } from '@/api/client';
import { TEST_IDS } from '@/constants/test-ids';
import { MESSAGES, getMessage } from '@/constants/messages';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AppLogo } from '@/components/common/AppLogo';

interface FormErrors {
  identifier?: string;
  password?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<{ message: string; code?: string; traceId?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side field validation supporting email, phone, and username
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const cleanId = identifier.trim();

    if (!cleanId) {
      newErrors.identifier = 'Vui lòng nhập email, số điện thoại hoặc tên đăng nhập.';
    } else if (cleanId.length < 3) {
      newErrors.identifier = 'Thông tin đăng nhập phải có ít nhất 3 ký tự.';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.login({
        identifier: identifier.trim(),
        password,
      });

      const userRole = response.user.role;
      if (userRole === 'Admin') {
        navigate('/admin');
      } else if (userRole === 'Shipper') {
        navigate('/shipper');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError({
          message: err.message || MESSAGES.AUTH.LOGIN_FAILED.vi,
          code: err.code,
          traceId: err.traceId,
        });
      } else {
        setServerError({
          message: MESSAGES.AUTH.LOGIN_FAILED.vi,
          code: 'UNEXPECTED_ERROR',
          traceId: 'client_' + Date.now().toString(36),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for role-based testing
  const handleQuickFill = (presetId: string) => {
    setIdentifier(presetId);
    setPassword('DemoPassword123');
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="min-h-screen w-full bg-canvas flex flex-col justify-between">
      {/* 1. Header Bar: Pinned (Sticky) at Top, Solid White & Opaque */}
      <header className="sticky top-0 z-30 w-full h-12 sm:h-13 bg-white border-b border-mint-secondary/15 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 shadow-xs">
        <Link to="/" className="hover:opacity-95 transition-opacity">
          <AppLogo size="sm" showText={true} />
        </Link>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-mint-secondary">
          <HelpCircle className="w-3.5 h-3.5 text-mint-secondary" />
          <span className="hidden sm:inline">Cần hỗ trợ?</span>
          <span className="font-semibold text-mint-primary hover:text-mint-tertiary cursor-pointer transition-colors">
            Hotline Vận hành
          </span>
        </div>
      </header>

      {/* 2. Main Content: 100% Full-bleed Split Layout between Header and Footer */}
      <main className="flex-1 w-full flex flex-col lg:flex-row items-stretch">
        
        {/* LEFT HALF: 100% Full-Bleed Real Image with 67% Opacity */}
        <div className="w-full lg:w-1/2 relative bg-mint-primary overflow-hidden flex flex-col justify-end p-8 sm:p-12 lg:p-16 min-h-[340px] lg:min-h-0 flex-shrink-0">
          {/* Authentic Real Delivery Photography: Courier smiling while handing parcel to smiling customer */}
          <img
            src="/images/delivery-hero.jpg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.pexels.com/photos/6667682/pexels-photo-6667682.jpeg?auto=compress&cs=tinysrgb&w=1600';
            }}
            alt="Shipper giao hàng tận tay khách hàng với nụ cười thân thiện"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.67]"
          />

          {/* Seamless Neobank Mint gradient overlay for high contrast text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-mint-primary via-mint-primary/45 to-transparent" />
          <div className="absolute inset-0 bg-mint-primary/10" />

          {/* Overlaid Hero Content (No badge per design instruction) */}
          <div className="relative z-10 max-w-xl text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
              {getMessage(MESSAGES.AUTH_PAGE.HERO_TITLE)}
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              {getMessage(MESSAGES.AUTH_PAGE.HERO_DESCRIPTION)}
            </p>
          </div>
        </div>

        {/* RIGHT HALF: Centered Login Form Container */}
        <div className="w-full lg:w-1/2 bg-canvas flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="w-full max-w-[460px] bg-card rounded-2xl border border-mint-secondary/25 p-8 sm:p-10 shadow-[0_10px_30px_-5px_rgba(13,59,46,0.08)]">
            
            {/* Logo Emblem & Heading */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-3">
                <AppLogo size="lg" showText={false} />
              </div>
              <h1 className="text-2xl font-bold text-mint-primary tracking-tight">
                {getMessage(MESSAGES.AUTH_PAGE.LOGIN_TITLE)}
              </h1>
              <p className="text-xs text-mint-secondary mt-1.5 leading-relaxed">
                {getMessage(MESSAGES.AUTH_PAGE.LOGIN_SUBTITLE)}
              </p>
            </div>

            {serverError && (
              <ErrorBanner
                className="mb-6"
                message={serverError.message}
                code={serverError.code}
                traceId={serverError.traceId}
                onDismiss={() => setServerError(null)}
              />
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Identifier field (Email, Phone, Username) */}
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-mint-secondary mb-1.5"
                >
                  {getMessage(MESSAGES.AUTH_PAGE.IDENTIFIER_LABEL)}
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-mint-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    data-testid={TEST_IDS.AUTH.LOGIN_EMAIL_INPUT}
                    value={identifier}
                    disabled={isLoading}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
                    }}
                    placeholder={getMessage(MESSAGES.AUTH_PAGE.IDENTIFIER_PLACEHOLDER)}
                    className={`w-full h-11 pl-10 pr-10 text-sm rounded-xl border bg-card text-mint-primary placeholder:text-mint-secondary/45 outline-none transition-all ${
                      errors.identifier
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-mint-secondary/30 focus:border-mint-tertiary focus:ring-2 focus:ring-mint-tertiary/20'
                    }`}
                  />
                  {identifier && !isLoading && (
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('');
                        if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
                      }}
                      aria-label="Xóa nội dung tài khoản"
                      className="absolute right-3 p-1 text-mint-secondary hover:text-mint-primary transition-colors rounded-full hover:bg-mint-secondary/10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {errors.identifier && (
                  <p className="text-xs text-red-600 mt-1 pl-1">{errors.identifier}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-mint-secondary mb-1.5"
                >
                  {getMessage(MESSAGES.AUTH_PAGE.PASSWORD_LABEL)}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-mint-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    data-testid={TEST_IDS.AUTH.LOGIN_PASSWORD_INPUT}
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder={getMessage(MESSAGES.AUTH_PAGE.PASSWORD_PLACEHOLDER)}
                    className={`w-full h-11 pl-10 pr-20 text-sm rounded-xl border bg-card text-mint-primary placeholder:text-mint-secondary/45 outline-none transition-all ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-mint-secondary/30 focus:border-mint-tertiary focus:ring-2 focus:ring-mint-tertiary/20'
                    }`}
                  />
                  <div className="absolute right-2.5 flex items-center gap-0.5">
                    {password && !isLoading && (
                      <button
                        type="button"
                        onClick={() => {
                          setPassword('');
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        aria-label="Xóa mật khẩu"
                        className="p-1 text-mint-secondary hover:text-mint-primary transition-colors rounded-full hover:bg-mint-secondary/10 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="p-1 text-mint-secondary hover:text-mint-primary transition-colors rounded-full hover:bg-mint-secondary/10 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 pl-1">{errors.password}</p>
                )}
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                data-testid={TEST_IDS.AUTH.LOGIN_SUBMIT_BUTTON}
                disabled={isLoading}
                className="w-full h-11 min-h-[44px] mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-mint-tertiary text-white font-semibold text-sm hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{getMessage(MESSAGES.AUTH_PAGE.SUBMITTING)}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{getMessage(MESSAGES.AUTH_PAGE.SUBMIT_BUTTON)}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Selection (for evaluation & testing) */}
            <div className="mt-8 pt-6 border-t border-mint-secondary/15">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-mint-secondary text-center mb-3">
                {getMessage(MESSAGES.AUTH_PAGE.TEST_ACCOUNTS_LABEL)}
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@store.vn')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-mint-secondary/30 bg-card text-xs font-medium text-mint-primary hover:border-mint-tertiary hover:bg-mint-neutral transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-mint-primary" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('shipper.nam@store.vn')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-mint-secondary/30 bg-card text-xs font-medium text-mint-primary hover:border-mint-tertiary hover:bg-mint-neutral transition-colors cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-mint-primary" />
                  <span>Shipper</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('customer.an@gmail.com')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-mint-secondary/30 bg-card text-xs font-medium text-mint-primary hover:border-mint-tertiary hover:bg-mint-neutral transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-mint-primary" />
                  <span>Customer</span>
                </button>
              </div>
            </div>

            {/* Single, Canonical Registration Link */}
            <div className="text-center mt-6 pt-4 border-t border-mint-secondary/15">
              <span className="text-xs text-mint-secondary">
                {getMessage(MESSAGES.AUTH_PAGE.NO_ACCOUNT_PROMPT)}{' '}
              </span>
              <Link
                to="/register"
                className="text-xs font-semibold text-mint-tertiary hover:underline"
              >
                {getMessage(MESSAGES.AUTH_PAGE.REGISTER_LINK)}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer Bar: Slim, Modern & Non-distracting */}
      <footer className="w-full h-10 sm:h-11 bg-card border-t border-mint-secondary/15 px-4 sm:px-8 flex items-center justify-between z-20 flex-shrink-0 text-[11px] text-mint-secondary">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
          <div>{getMessage(MESSAGES.AUTH_PAGE.FOOTER_COPYRIGHT)}</div>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px]">
            <span className="hover:text-mint-primary cursor-pointer transition-colors">
              {getMessage(MESSAGES.AUTH_PAGE.FOOTER_HELP)}
            </span>
            <span>•</span>
            <span className="hover:text-mint-primary cursor-pointer transition-colors">
              {getMessage(MESSAGES.AUTH_PAGE.FOOTER_TERMS)}
            </span>
            <span>•</span>
            <span className="hover:text-mint-primary cursor-pointer transition-colors">
              {getMessage(MESSAGES.AUTH_PAGE.FOOTER_PRIVACY)}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
