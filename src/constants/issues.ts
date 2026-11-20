import type { DeliveryIssueType } from '@/types/api';

export const ISSUE_TYPE_LABELS: Record<DeliveryIssueType, string> = {
  DAMAGED: 'Hàng hỏng',
  FAILED_DELIVERY: 'Giao không thành công',
  LOST: 'Thất lạc',
};

// Resolves a delivery issue type into its verbatim Vietnamese label.
export function getIssueTypeLabel(issueType: DeliveryIssueType): string {
  return ISSUE_TYPE_LABELS[issueType] ?? issueType;
}
