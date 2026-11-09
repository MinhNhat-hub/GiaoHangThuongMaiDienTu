// Top navigation header displaying current session identity and logout control.
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Shield, Truck, User } from 'lucide-react';
import { apiClient } from '@/api/client';
import { TEST_IDS } from '@/constants/test-ids';
import { AppLogo } from '@/components/common/AppLogo';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = apiClient.getUser();

  const handleLogout = async () => {
    await apiClient.logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (currentUser?.role) {
      case 'Admin':
        return <Shield className="w-3.5 h-3.5 text-mint-primary" />;
      case 'Shipper':
        return <Truck className="w-3.5 h-3.5 text-mint-primary" />;
      default:
        return <User className="w-3.5 h-3.5 text-mint-primary" />;
    }
  };

  return (
    <header className="bg-card border-b border-mint-secondary/15 px-6 py-3 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand with GHC Logo */}
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <AppLogo size="sm" showText={true} />
        </Link>

        {/* User Session Bar or Login Link */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-3 border-l border-mint-secondary/20">
              <div className="flex items-center gap-2 text-xs">
                <span className="p-1 rounded bg-mint-neutral border border-mint-secondary/20">
                  {getRoleIcon()}
                </span>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-mint-primary">{currentUser.fullName}</div>
                  <div className="text-[10px] text-mint-secondary">{currentUser.email} ({currentUser.role})</div>
                </div>
              </div>

              <button
                type="button"
                data-testid={TEST_IDS.AUTH.LOGOUT_BUTTON}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors shadow-sm"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
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

