import { APP_CONFIG } from '@/constants/config';

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const MS_PER_MINUTE = 60_000;

// Formats an ISO timestamp or Date as dd/MM/yyyy HH:mm in UTC+7.
export function formatDateTimeVi(value?: string | Date | null): string {
  if (!value) {
    return '—';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '—';
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: VIETNAM_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    lookup[part.type] = part.value;
  }

  return `${lookup.day}/${lookup.month}/${lookup.year} ${lookup.hour}:${lookup.minute}`;
}

// Checks whether the current minute is within the 15-day return window from delivery.
export function isWithinReturnWindow(deliveredAt?: string | Date | null, now: Date = new Date()): boolean {
  if (!deliveredAt) {
    return false;
  }
  const deliveredDate = deliveredAt instanceof Date ? deliveredAt : new Date(deliveredAt);
  if (Number.isNaN(deliveredDate.getTime()) || Number.isNaN(now.getTime())) {
    return false;
  }

  const deliveredMinute = Math.floor(deliveredDate.getTime() / MS_PER_MINUTE);
  const currentMinute = Math.floor(now.getTime() / MS_PER_MINUTE);
  const elapsedMinutes = currentMinute - deliveredMinute;

  return elapsedMinutes >= 0 && elapsedMinutes <= APP_CONFIG.DELIVERY_RULES.RETURN_WINDOW_MINUTES;
}
