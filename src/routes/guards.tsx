import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserProfile, UserRole } from '@/types/api';
import { AUTH_CHANGE_EVENT, apiClient } from '@/api/client';
import { APP_PATHS } from '@/constants/routes';
import { AppHeader } from '@/components/layout/AppHeader';

interface AuthSessionState {
  token: string | null;
  user: UserProfile | null;
}

// Subscribes to authentication state updates across the active window.
export function useAuthSession(): AuthSessionState {
  const [session, setSession] = useState<AuthSessionState>(() => ({
    token: apiClient.getToken(),
    user: apiClient.getUser(),
  }));

  useEffect(() => {
    const syncSession = () => {
      setSession({
        token: apiClient.getToken(),
        user: apiClient.getUser(),
      });
    };

    window.addEventListener(AUTH_CHANGE_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  return session;
}

export const ProtectedLayout: React.FC = () => {
  const { token, user } = useAuthSession();
  if (!token || !user) {
    return <Navigate to={APP_PATHS.login} replace />;
  }

  return (
    <div className="min-h-screen bg-canvas text-mint-primary flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

interface RoleRouteProps {
  allowedRoles: UserRole[];
  userRole?: UserRole | null;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<{ redirectTo?: string }> = ({
  redirectTo = APP_PATHS.login,
}) => {
  const { token, user } = useAuthSession();
  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
};

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles,
  userRole,
  redirectTo = APP_PATHS.login,
}) => {
  const { token, user } = useAuthSession();
  const effectiveRole = userRole || user?.role;

  if (!token || !effectiveRole) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(effectiveRole)) {
    return (
      <div className="bg-card rounded-2xl border border-red-200 p-8 shadow-sm text-center space-y-2">
        <h1 className="text-xl font-bold text-red-700">Không có quyền truy cập</h1>
        <p className="text-xs text-mint-secondary">
          Tài khoản hiện tại không được phép truy cập màn hình này.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
