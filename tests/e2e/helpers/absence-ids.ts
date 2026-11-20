// Names that must never appear on screen. A test using them proves absence by test id only,
// so they are not requested from the front end and are not part of TEST_IDS.
export const ABSENCE_IDS = {
  MONEY_FIELD: 'common-money-field',
  RETURN_MONEY_FIELD: 'admin-return-money-field',
  STATUS_CHANGE_CONTROL: 'admin-status-change-control',
  TIMELINE_EDIT_BUTTON: 'order-status-timeline-edit-btn',
  TIMELINE_DELETE_BUTTON: 'order-status-timeline-delete-btn',
  ORDER_STATUS_SELECT: 'order-status-select',
  RETURN_STATUS_SELECT: 'return-status-select',
} as const;
