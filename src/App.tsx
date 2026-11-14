// Root component managing top-level layout, real-time connectivity status, and basic navigation.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/common/StatusBadge';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ORDER_STATUS_MAP, RETURN_STATUS_MAP } from '@/constants/status-map';

export const App: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReconnect = () => {
    setIsOffline(false);
  };

  return (
    <div className="min-h-screen bg-canvas text-mint-primary flex flex-col">
      <OfflineBanner
        isOffline={isOffline}
        onReconnect={handleReconnect}
      />

      <header className="bg-card border-b border-mint-secondary/20 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mint-primary text-white flex items-center justify-center font-bold text-sm">
              SE
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Giao Hàng Thương Mại Điện Tử</h1>
              <p className="text-xs text-mint-secondary">Nhóm 10 · Hệ thống Quản trị & Vận hành</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOffline(!isOffline)}
              className="text-xs px-3 py-1.5 rounded border border-mint-secondary/30 hover:bg-mint-neutral transition-colors"
            >
              Toggle Offline ({isOffline ? 'Đang Offline' : 'Online'})
            </button>
            <button
              type="button"
              onClick={() => setErrorMessage('Không thể cập nhật đơn hàng: Dữ liệu xung đột')}
              className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Test Lỗi
            </button>
            <Link
              to="/login"
              className="text-xs px-3 py-1.5 rounded bg-mint-tertiary text-white font-semibold hover:bg-mint-tertiary-hover transition-colors"
            >
              Tới Màn hình Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            code="ORDER_STATUS_CONFLICT"
            traceId="trace_9a8b7c6d5e"
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        <section className="bg-card rounded-lg border border-mint-secondary/15 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Hệ thống 13 Trạng thái Nghiệp vụ</h2>
          
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mint-secondary mb-2">
              Trạng thái Đơn hàng (9 trạng thái)
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ORDER_STATUS_MAP).map((code) => (
                <StatusBadge key={code} status={code as any} showDot />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mint-secondary mb-2">
              Trạng thái Yêu cầu Hoàn hàng (4 trạng thái)
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(RETURN_STATUS_MAP).map((code) => (
                <StatusBadge key={code} status={code as any} showDot />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card rounded-lg border border-mint-secondary/15 p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Hộp thoại Xác nhận Hành động</h3>
            <p className="text-xs text-mint-secondary">Dùng trước các thao tác chuyển trạng thái không thể hoàn tác</p>
          </div>
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors"
          >
            Mở hộp thoại xác nhận
          </button>
        </section>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Xác nhận giao hàng thành công"
          message="Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang Đã giao? Thao tác này sẽ ghi nhận lịch sử trạng thái và không thể hoàn tác."
          confirmLabel="Xác nhận giao"
          cancelLabel="Xem lại"
          onConfirm={() => setIsConfirmOpen(false)}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </main>
    </div>
  );
};

export default App;

