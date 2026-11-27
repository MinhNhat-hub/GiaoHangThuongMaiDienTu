import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Phone, Mail, Lock, Eye, EyeOff, X, HelpCircle } from 'lucide-react';
import { apiClient, ApiClientError } from '@/api/client';
import { TEST_IDS } from '@/constants/test-ids';
import { MESSAGES, getMessage } from '@/constants/messages';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { validateRegisterInput, type RegisterFormErrors } from '@/utils/validation';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AppLogo } from '@/components/common/AppLogo';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [serverError, setServerError] = useState<{ message: string; code?: string; traceId?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateRegisterInput({
      fullName,
      email,
      password,
      phoneNumber,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.register({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password,
      });
      navigate(APP_PATHS.login, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError({
          message: err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.',
          code: err.code,
          traceId: err.traceId,
        });
      } else {
        setServerError({
          message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
          code: 'UNEXPECTED_ERROR',
          traceId: 'client_' + Date.now().toString(36),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-canvas flex flex-col justify-between">
      <header className="sticky top-0 z-30 w-full h-12 sm:h-13 bg-white border-b border-mint-secondary/15 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 shadow-xs">
        <Link to={APP_PATHS.login} className="hover:opacity-95 transition-opacity">
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

      <main className="flex-1 w-full flex flex-col lg:flex-row items-stretch">
        <div className="w-full lg:w-1/2 relative bg-mint-primary overflow-hidden flex flex-col justify-end p-8 sm:p-12 lg:p-16 min-h-[300px] lg:min-h-0 flex-shrink-0">
          <img
            src="/images/delivery-hero.jpg"
            alt="Shipper giao hàng tận tay khách hàng với nụ cười thân thiện"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.67]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-mint-primary via-mint-primary/45 to-transparent" />
          <div className="absolute inset-0 bg-mint-primary/10" />

          <div className="relative z-10 max-w-xl text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
              {getMessage(MESSAGES.REGISTER_PAGE.HERO_TITLE)}
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              {getMessage(MESSAGES.REGISTER_PAGE.HERO_DESCRIPTION)}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-canvas flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="w-full max-w-[460px] bg-card rounded-2xl border border-mint-secondary/25 p-8 sm:p-10 shadow-[0_10px_30px_-5px_rgba(13,59,46,0.08)]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-3">
                <AppLogo size="lg" showText={false} />
              </div>
              <h1
                data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
                className="text-2xl font-bold text-mint-primary tracking-tight"
              >
                {SCREEN_NAMES.REGISTER}
              </h1>
              <p className="text-xs text-mint-secondary mt-1.5 leading-relaxed">
                {getMessage(MESSAGES.REGISTER_PAGE.SUBTITLE)}
              </p>
            </div>

            {serverError && (
              <ErrorBanner
                className="mb-5"
                message={serverError.message}
                code={serverError.code}
                traceId={serverError.traceId}
                onDismiss={() => setServerError(null)}
              />
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="register-fullname"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-mint-secondary mb-1.5"
                >
                  {getMessage(MESSAGES.REGISTER_PAGE.FULLNAME_LABEL)}
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-mint-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-fullname"
                    type="text"
                    autoComplete="name"
                    data-testid={TEST_IDS.AUTH.REGISTER_FULLNAME_INPUT}
                    value={fullName}
                    disabled={isLoading}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder={getMessage(MESSAGES.REGISTER_PAGE.FULLNAME_PLACEHOLDER)}
                    className={`w-full h-11 pl-10 pr-10 text-sm rounded-xl border bg-card text-mint-primary placeholder:text-mint-secondary/45 outline-none transition-all ${
                      errors.fullName
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-mint-secondary/30 focus:border-mint-tertiary focus:ring-2 focus:ring-mint-tertiary/20'
                    }`}
                  />
                  {fullName && !isLoading && (
                    <button
                      type="button"
                      onClick={() => {
                        setFullName('');
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      aria-label="Xóa họ và tên"
                      className="absolute right-3 p-1 text-mint-secondary hover:text-mint-primary transition-colors rounded-full hover:bg-mint-secondary/10 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {errors.fullName && (
                  <p
                    data-testid={TEST_IDS.AUTH.REGISTER_FULLNAME_ERROR}
                    className="text-xs text-red-600 mt-1 pl-1"
                  >
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-mint-secondary mb-1.5"
                >
                  {getMessage(MESSAGES.REGISTER_PAGE.PHONE_LABEL)}
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-mint-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    data-testid={TEST_IDS.AUTH.REGISTER_PHONE_INPUT}
                    value={phoneNumber}
                    disabled={isLoading}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                    }}
                    placeholder={getMessage(MESSAGES.REGISTER_PAGE.PHONE_PLACEHOLDER)}
                    className={`w-full h-11 pl-10 pr-10 text-sm rounded-xl border bg-card text-mint-primary placeholder:text-mint-secondary/45 outline-none transition-all ${
                      errors.phoneNumber
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-mint-secondary/30 focus:border-mint-tertiary focus:ring-2 focus:ring-mint-tertiary/20'
                    }`}
                  />
                  {phoneNumber && !isLoading && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneNumber('');
                        if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                      }}
                      aria-label="Xóa số điện thoại"
                      className="absolute right-3 p-1 text-mint-secondary hover:text-mint-primary transition-colors rounded-full hover:bg-mint-secondary/10 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {errors.phoneNumber && (
                  <p
                    data-testid={TEST_IDS.AUTH.REGISTER_PHONE_ERROR}
                    className="text-xs text-red-600 mt-1 pl-1"
                  >
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-mint-secondary mb-1.5"
                >
                  {getMessage(MESSAGES.REGISTER_PAGE.EMAIL_LABEL)}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-mint-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    data-testid={TEST_IDS.AUTH.REGISTER_EMAIL_INPUT}
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder={getMessage(MESSAGES.REGISTER_PAGE.EMAIL_PLACEHOLDER)}
                    className={`w-full h-11 pl-10 pr-10 text-sm rounded-xl border bg-card text-mint-primary placeholder:text-mint-secondary/45 outline-none transition-all ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-mint-secondary/30 focus:border-mint-tertiary focus:ring-2 focus:ring-mint-tertiary/20'
                    }`}
                  />
                  {email && !isLoading && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('');
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      aria-label="Xóa địa chỉ email"
                      className="absolute right-3 p-1 text-mint-secondary hover:text-mint-primary transition-colors rounded-full hover:bg-mint-secondary/10 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {errors.email && (
                  <p
                    data-testid={TEST_IDS.AUTH.REGISTER_EMAIL_ERROR}
                    className="text-xs text-red-600 mt-1 pl-1"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-mint-secondary mb-1.5"
                >
                  {getMessage(MESSAGES.REGISTER_PAGE.PASSWORD_LABEL)}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-mint-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    data-testid={TEST_IDS.AUTH.REGISTER_PASSWORD_INPUT}
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder={getMessage(MESSAGES.REGISTER_PAGE.PASSWORD_PLACEHOLDER)}
                    className={`w-full h-11 pl-10 pr-16 text-sm rounded-xl border bg-card text-mint-primary placeholder:text-mint-secondary/45 outline-none transition-all ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-mint-secondary/30 focus:border-mint-tertiary focus:ring-2 focus:ring-mint-tertiary/20'
                    }`}
                  />
                  <div className="absolute right-2 flex items-center gap-0.5">
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
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="p-1 text-mint-secondary hover:text-mint-primary transition-colors rounded-full hover:bg-mint-secondary/10 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p
                    data-testid={TEST_IDS.AUTH.REGISTER_PASSWORD_ERROR}
                    className="text-xs text-red-600 mt-1 pl-1"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                data-testid={TEST_IDS.AUTH.REGISTER_SUBMIT_BUTTON}
                disabled={isLoading}
                className="w-full h-11 min-h-[44px] mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-mint-tertiary text-white font-semibold text-sm hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{getMessage(MESSAGES.REGISTER_PAGE.SUBMITTING)}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{getMessage(MESSAGES.REGISTER_PAGE.SUBMIT_BUTTON)}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-mint-secondary/15">
              <span className="text-xs text-mint-secondary">
                {getMessage(MESSAGES.REGISTER_PAGE.HAS_ACCOUNT_PROMPT)}{' '}
              </span>
              <Link
                to={APP_PATHS.login}
                className="text-xs font-semibold text-mint-tertiary hover:underline"
              >
                {getMessage(MESSAGES.REGISTER_PAGE.LOGIN_LINK)}
              </Link>
            </div>
          </div>
        </div>
      </main>

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
