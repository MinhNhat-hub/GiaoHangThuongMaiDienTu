import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout, RoleRoute, useAuthSession } from './guards';
import { LoginPage, RegisterPage } from '@/features/auth';
import { CreateOrderPage, CustomerHomePage, OrderDetailPage } from '@/features/orders';
import { CustomerReturnsPage, ReturnRequestPage } from '@/features/returns';
import { ShipmentTrackingPage } from '@/features/shipments';
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
      element: <RegisterPage />,
    },
    {
      element: <ProtectedLayout />,
      children: [
        {
          element: <RoleRoute allowedRoles={['Customer']} userRole={currentUserRole} />,
          children: [
            {
              path: APP_PATHS.orderList,
              element: <CustomerHomePage />,
            },
            {
              path: APP_PATHS.orderCreation,
              element: <CreateOrderPage />,
            },
            {
              path: ROUTE_PATTERNS.returnRequest,
              element: <ReturnRequestPage />,
            },
            {
              path: APP_PATHS.returnList,
              element: <CustomerReturnsPage />,
            },
          ],
        },
        {
          element: <RoleRoute allowedRoles={['Customer', 'Admin']} userRole={currentUserRole} />,
          children: [
            {
              path: ROUTE_PATTERNS.tracking,
              element: <ShipmentTrackingPage />,
            },
          ],
        },
        {
          element: (
            <RoleRoute allowedRoles={['Customer', 'Admin', 'Shipper']} userRole={currentUserRole} />
          ),
          children: [
            {
              path: ROUTE_PATTERNS.orderDetails,
              element: <OrderDetailPage />,
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
