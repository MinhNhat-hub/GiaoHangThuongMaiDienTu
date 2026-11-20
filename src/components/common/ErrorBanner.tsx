import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { TEST_IDS } from '@/constants/test-ids';

interface ErrorBannerProps {
  message: string;
  code?: string;
  traceId?: string;
  details?: Array<{ field?: string; message: string }>;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  code,
  traceId,
  details,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      role="alert"
      data-testid={TEST_IDS.COMMON.ERROR_BANNER}
      className={`rounded-md border border-red-200 bg-red-50 p-4 text-red-900 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <div className="font-semibold">{message}</div>
          {details && details.length > 0 && (
            <ul className="mt-1 list-disc pl-4 space-y-0.5 text-xs text-red-800">
              {details.map((d, i) => (
                <li key={i}>
                  {d.field ? <strong className="font-medium">{d.field}: </strong> : null}
                  {d.message}
                </li>
              ))}
            </ul>
          )}
          {(code || traceId) && (
            <div
              data-testid={TEST_IDS.COMMON.ERROR_BANNER_TRACE}
              className="mt-2 text-xs font-mono text-red-700/80 flex flex-wrap gap-x-3"
            >
              {code && <span>Mã lỗi: {code}</span>}
              {traceId && <span>Mã truy vết: {traceId}</span>}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Đóng thông báo"
            className="text-red-500 hover:text-red-700 p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

