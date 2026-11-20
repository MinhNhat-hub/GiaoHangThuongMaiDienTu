import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Shield, Truck, User } from 'lucide-react';
import { apiClient } from '@/api/client';
import { APP_PATHS } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import { AppLogo } from '@/components/common/AppLogo';
import type { UserRole } from '@/types/api';

function renderRoleIcon(role?: UserRole): React.ReactNode {
  switch (role) {
    case 'Admin':
      return <Shield className="w-3.5 h-3.5 text-mint-primary" />;
    case 'Shipper':
      return <Truck className="w-3.5 h-3.5 text-mint-primary" />;
    default:
      return <User className="w-3.5 h-3.5 text-mint-primary" />;
  }
}

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = apiClient.getUser();

  const handleLogout = async () => {
    await apiClient.logout();
    navigate(APP_PATHS.login, { replace: true });
  };

  return (
    <header className="bg-card border-b border-mint-secondary/15 px-4 sm:px-6 py-3 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <Link to={APP_PATHS.login} className="hover:opacity-90 transition-opacity">
            <AppLogo size="sm" showText={true} />
          </Link>

          {currentUser?.role === 'Customer' && (
            <nav aria-label="Điều hướng Customer" className="flex items-center gap-3 text-xs font-semibold">
              <Link
                to={APP_PATHS.orderList}
                data-testid={TEST_IDS.COMMON.NAV_ORDER_LIST_LINK}
                className="px-2.5 py-1.5 rounded-lg text-mint-primary hover:bg-mint-neutral transition-colors"
              >
                Đơn hàng
              </Link>
              <Link
                to={APP_PATHS.returnList}
                data-testid={TEST_IDS.COMMON.NAV_RETURN_LIST_LINK}
                className="px-2.5 py-1.5 rounded-lg text-mint-primary hover:bg-mint-neutral transition-colors"
              >
                Hoàn hàng
              </Link>
            </nav>
          )}

          {currentUser?.role === 'Shipper' && (
            <nav aria-label="Điều hướng Shipper" className="flex items-center gap-3 text-xs font-semibold">
              <Link
                to={APP_PATHS.shipperDeliveries}
                data-testid={TEST_IDS.SHIPPER.NAV_ASSIGNED_LINK}
                className="px-2.5 py-1.5 rounded-lg text-mint-primary hover:bg-mint-neutral transition-colors"
              >
                Đơn được phân công
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-3 border-l border-mint-secondary/20">
              <div className="flex items-center gap-2 text-xs">
                <span className="p-1 rounded bg-mint-neutral border border-mint-secondary/20">
                  {renderRoleIcon(currentUser.role)}
                </span>
                <div className="text-left">
                  <div
                    data-testid={TEST_IDS.COMMON.ACCOUNT_FULLNAME}
                    className="font-semibold text-mint-primary"
                  >
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-mint-secondary flex flex-wrap items-center gap-x-2">
                    <span data-testid={TEST_IDS.COMMON.ACCOUNT_EMAIL}>{currentUser.email}</span>
                    {currentUser.phoneNumber && (
                      <span data-testid={TEST_IDS.COMMON.ACCOUNT_PHONE}>{currentUser.phoneNumber}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                data-testid={TEST_IDS.AUTH.LOGOUT_BUTTON}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={APP_PATHS.login}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors shadow-sm"
              >
                Đăng nhập
              </Link>
              <Link
                to={APP_PATHS.register}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-mint-secondary/30 text-mint-primary hover:bg-mint-neutral transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
