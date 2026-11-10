// Offline connectivity banner alerting users of disconnected real-time state and enabling manual reconnect.
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { TEST_IDS } from '@/constants/test-ids';

interface OfflineBannerProps {
  isOffline: boolean;
  isReconnecting?: boolean;
  onReconnect?: () => void;
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  isReconnecting = false,
  onReconnect,
  className = '',
}) => {
  if (!isOffline) return null;

  return (
    <div
      role="status"
      data-testid={TEST_IDS.COMMON.OFFLINE_BANNER}
      className={`w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-900 text-sm flex items-center justify-between shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span className="font-medium">
          Mất kết nối máy chủ thời gian thực. Trạng thái đơn hàng có thể chưa cập nhật.
        </span>
      </div>
      {onReconnect && (
        <button
          type="button"
          data-testid={TEST_IDS.COMMON.OFFLINE_RECONNECT_BUTTON}
          disabled={isReconnecting}
          onClick={onReconnect}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
          {isReconnecting ? 'Đang kết nối lại...' : 'Kết nối lại'}
        </button>
      )}
    </div>
  );
};

