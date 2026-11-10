// Modal dialog requesting user confirmation before proceeding with irreversible actions.
import React from 'react';
import { TEST_IDS } from '@/constants/test-ids';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid={TEST_IDS.COMMON.CONFIRM_DIALOG}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-md bg-card rounded-lg p-6 shadow-xl border border-mint-secondary/20">
        <h3 className="text-lg font-bold text-mint-primary mb-2">{title}</h3>
        <p className="text-sm text-mint-secondary-dark mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            data-testid={TEST_IDS.COMMON.CONFIRM_DIALOG_CANCEL}
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-md border border-mint-secondary/40 text-mint-primary hover:bg-mint-neutral transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-testid={TEST_IDS.COMMON.CONFIRM_DIALOG_CONFIRM}
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-md text-white transition-colors disabled:opacity-50 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-mint-tertiary hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active'
            }`}
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

