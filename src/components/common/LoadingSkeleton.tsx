import React from 'react';
import { TEST_IDS } from '@/constants/test-ids';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div
      data-testid={TEST_IDS.COMMON.LOADING_SKELETON}
      className={`space-y-3 animate-pulse ${className}`}
      aria-busy="true"
      aria-label="Đang tải dữ liệu"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-mint-secondary/10 rounded-lg border border-mint-secondary/15 p-4 flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-mint-secondary/20 rounded w-1/3" />
            <div className="h-3 bg-mint-secondary/15 rounded w-1/2" />
          </div>
          <div className="h-6 w-20 bg-mint-secondary/20 rounded-md" />
        </div>
      ))}
    </div>
  );
};

