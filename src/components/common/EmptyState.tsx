// Empty state presentation component for lists with zero records.
import React from 'react';
import { PackageOpen } from 'lucide-react';
import { TEST_IDS } from '@/constants/test-ids';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      data-testid={TEST_IDS.COMMON.EMPTY_STATE}
      className={`flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-dashed border-mint-secondary/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-mint-neutral flex items-center justify-center text-mint-secondary mb-3">
        <PackageOpen className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-mint-primary">{title}</h4>
      {description && <p className="text-xs text-mint-secondary mt-1 max-w-sm">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-md bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

