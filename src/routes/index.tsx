import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout, RoleRoute, useAuthSession } from './guards';
import { LoginPage, RegisterPage } from '@/features/auth';
import { AdminDashboardPage } from '@/features/admin';
import { CreateOrderPage, CustomerHomePage, OrderDetailPage } from '@/features/orders';
import { CustomerReturnsPage, ReturnRequestPage } from '@/features/returns';
import { ShipmentTrackingPage, ShipperDeliveryPage } from '@/features/shipments';
import { APP_PATHS, ROUTE_PATTERNS } from '@/constants/routes';
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
              element: <AdminDashboardPage />,
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
              element: <ShipperDeliveryPage />,
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
