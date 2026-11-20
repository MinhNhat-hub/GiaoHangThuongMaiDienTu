import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout, RoleRoute, useAuthSession } from './guards';
import { LoginPage } from '@/features/auth/LoginPage';
import { APP_PATHS, ROUTE_PATTERNS, SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';
import App from '@/App';

const RootEntry: React.FC = () => {
  const { token, user } = useAuthSession();
  if (!token || !user) {
    return <LoginPage />;
  }
  if (user.role === 'Admin') {
    return <Navigate to={APP_PATHS.adminDashboard} replace />;
  }
  if (user.role === 'Shipper') {
    return <Navigate to={APP_PATHS.shipperDeliveries} replace />;
  }
  return <ProtectedLayout />;
};

const PublicOnlyLoginRoute: React.FC = () => {
  const { token, user } = useAuthSession();
  if (token && user) {
    if (user.role === 'Admin') return <Navigate to={APP_PATHS.adminDashboard} replace />;
    if (user.role === 'Shipper') return <Navigate to={APP_PATHS.shipperDeliveries} replace />;
    return <Navigate to={APP_PATHS.customerHome} replace />;
  }
  return <LoginPage />;
};

// Builds the central route configuration for all roles and authentication screens.
export const createAppRouter = (currentUserRole?: 'Customer' | 'Shipper' | 'Admin' | null) =>
  createBrowserRouter([
    {
      path: APP_PATHS.login,
      element: <RootEntry />,
      children: [
        {
          index: true,
          element: <App />,
        },
      ],
    },
    {
      path: APP_PATHS.loginAlias,
      element: <PublicOnlyLoginRoute />,
    },
    {
      path: APP_PATHS.register,
      element: (
        <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl border border-mint-secondary/25 p-8 max-w-md w-full text-center shadow-sm">
            <h1 data-testid={TEST_IDS.COMMON.SCREEN_TITLE} className="text-xl font-bold text-mint-primary mb-2">
              {SCREEN_NAMES.REGISTER}
            </h1>
            <p className="text-xs text-mint-secondary">Màn hình đăng ký tài khoản Customer.</p>
          </div>
        </div>
      ),
    },
    {
      element: <ProtectedLayout />,
      children: [
        {
          element: <RoleRoute allowedRoles={['Customer']} userRole={currentUserRole} />,
          children: [
            {
              path: APP_PATHS.orderList,
              element: <App />,
            },
            {
              path: APP_PATHS.orderCreation,
              element: <div className="p-8">{SCREEN_NAMES.ORDER_CREATION}</div>,
            },
            {
              path: ROUTE_PATTERNS.orderDetails,
              element: <div className="p-8">{SCREEN_NAMES.ORDER_DETAILS}</div>,
            },
            {
              path: ROUTE_PATTERNS.tracking,
              element: <div className="p-8">{SCREEN_NAMES.TRACKING}</div>,
            },
            {
              path: ROUTE_PATTERNS.returnRequest,
              element: <div className="p-8">{SCREEN_NAMES.RETURN_REQUEST}</div>,
            },
            {
              path: APP_PATHS.returnList,
              element: <div className="p-8">Yêu cầu hoàn hàng đã gửi</div>,
            },
          ],
        },
      ],
    },
    {
      element: <ProtectedLayout />,
      children: [
        {
          element: <RoleRoute allowedRoles={['Admin']} userRole={currentUserRole} />,
          children: [
            {
              path: APP_PATHS.adminDashboard,
              element: (
                <div className="bg-card rounded-2xl border border-mint-secondary/20 p-8 shadow-sm">
                  <h1
                    data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
                    className="text-xl font-bold text-mint-primary mb-2"
                  >
                    {SCREEN_NAMES.ADMIN_DASHBOARD}
                  </h1>
                  <div data-testid={TEST_IDS.ADMIN.DASHBOARD_TABLE} />
                </div>
              ),
            },
          ],
        },
      ],
    },
    {
      element: <ProtectedLayout />,
      children: [
        {
          element: <RoleRoute allowedRoles={['Shipper']} userRole={currentUserRole} />,
          children: [
            {
              path: APP_PATHS.shipperDeliveries,
              element: (
                <div className="bg-card rounded-2xl border border-mint-secondary/20 p-8 shadow-sm">
                  <h1
                    data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
                    className="text-xl font-bold text-mint-primary mb-2"
                  >
                    {SCREEN_NAMES.SHIPPER_DELIVERY}
                  </h1>
                  <div data-testid={TEST_IDS.SHIPPER.ASSIGNED_LIST} />
                </div>
              ),
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <div className="p-8 text-center">404 - Trang không tồn tại</div>,
    },
  ]);
