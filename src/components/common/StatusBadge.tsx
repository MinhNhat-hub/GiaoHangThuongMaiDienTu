import React from 'react';
import { getStatusMeta, type AnyStatusCode } from '@/constants/status-map';
import { TEST_IDS } from '@/constants/test-ids';

interface StatusBadgeProps {
  status: AnyStatusCode;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showDot = false,
}) => {
  const meta = getStatusMeta(status);

  return (
    <span
      data-testid={TEST_IDS.COMMON.STATUS_BADGE}
      data-status={meta.code}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${meta.badgeClass} ${className}`}
      title={meta.descriptionVi}
    >
      {showDot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{meta.labelVi}</span>
    </span>
  );
};

