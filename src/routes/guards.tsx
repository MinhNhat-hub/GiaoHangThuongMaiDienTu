// Role-based route guard protecting access across Customer, Shipper, and Admin spaces.
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@/types/api';
import { apiClient } from '@/api/client';
import { AppHeader } from '@/components/layout/AppHeader';

export const ProtectedLayout: React.FC = () => {
  const token = apiClient.getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
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
  redirectTo = '/login',
}) => {
  const token = apiClient.getToken();
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
};

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles,
  userRole,
  redirectTo = '/login',
}) => {
  const effectiveRole = userRole || apiClient.getUser()?.role;
  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
};

