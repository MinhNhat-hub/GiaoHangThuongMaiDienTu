// Central application route tree defining access boundaries for Customer, Shipper, and Admin roles.
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout, RoleRoute } from './guards';
import { LoginPage } from '@/features/auth/LoginPage';
import App from '@/App';

// Root router tree configured for role-based navigation.
export const createAppRouter = (currentUserRole?: 'Customer' | 'Shipper' | 'Admin' | null) =>
  createBrowserRouter([
    {
      path: '/',
      element: <App />,
    },
    // Authentication
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/register',
      element: (
        <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl border border-mint-secondary/25 p-8 max-w-md w-full text-center shadow-sm">
            <h1 className="text-xl font-bold text-mint-primary mb-2">Đăng ký tài khoản</h1>
            <p className="text-xs text-mint-secondary">Tính năng đang được phát triển ở nhánh riêng.</p>
          </div>
        </div>
      ),
    },
    // Customer boundary
    {
      element: <ProtectedLayout />,
      children: [
        {
          element: <RoleRoute allowedRoles={['Customer']} userRole={currentUserRole} />,
          children: [
            {
              path: '/customer',
              element: (
                <div className="bg-card rounded-2xl border border-mint-secondary/20 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-mint-primary mb-2">Trang chủ Khách hàng</h2>
                  <p className="text-sm text-mint-secondary">Bạn đang đăng nhập với vai trò Khách hàng (Customer).</p>
                </div>
              ),
            },
            {
              path: '/customer/orders/create',
              element: <div className="p-8">Tạo đơn hàng 3 bước (Sản phẩm, Người nhận, Xác nhận)</div>,
            },
            {
              path: '/customer/orders/:id',
              element: <div className="p-8">Chi tiết đơn hàng (Tab Chi tiết)</div>,
            },
            {
              path: '/customer/orders/:id/track',
              element: <div className="p-8">Theo dõi vận chuyển (Tab Vận chuyển)</div>,
            },
            {
              path: '/customer/orders/:id/return',
              element: <div className="p-8">Gửi yêu cầu hoàn hàng</div>,
            },
          ],
        },
      ],
    },
    // Admin boundary
    {
      element: <ProtectedLayout />,
      children: [
        {
          element: <RoleRoute allowedRoles={['Admin']} userRole={currentUserRole} redirectTo="/login" />,
          children: [
            {
              path: '/admin',
              element: (
                <div className="bg-card rounded-2xl border border-mint-secondary/20 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-mint-primary mb-2">Bảng điều khiển Quản trị viên (Admin)</h2>
                  <p className="text-sm text-mint-secondary">Quản lý phân công Shipper, sự cố giao hàng và duyệt hoàn hàng.</p>
                </div>
              ),
            },
          ],
        },
      ],
    },
    // Shipper boundary
    {
      element: <ProtectedLayout />,
      children: [
        {
          element: <RoleRoute allowedRoles={['Shipper']} userRole={currentUserRole} redirectTo="/login" />,
          children: [
            {
              path: '/shipper',
              element: (
                <div className="bg-card rounded-2xl border border-mint-secondary/20 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-mint-primary mb-2">Giao diện Giao hàng Shipper (Mobile-first)</h2>
                  <p className="text-sm text-mint-secondary">Xem danh sách đơn được phân công và cập nhật trạng thái.</p>
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
