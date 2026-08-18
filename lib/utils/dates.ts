import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';

/**
 * Format a date string or object into readable format (e.g. '18 Aug 2026')
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '—';
  return format(parsed, 'dd MMM yyyy');
}

/**
 * Format a date string or object with time (e.g. '18 Aug 2026, 01:15 PM')
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '—';
  return format(parsed, 'dd MMM yyyy, hh:mm a');
}

/**
 * Calculate the number of nights between check-in and check-out
 */
export function calculateNights(checkInDate: string | Date, checkOutDate: string | Date): number {
  const checkIn = typeof checkInDate === 'string' ? parseISO(checkInDate) : checkInDate;
  const checkOut = typeof checkOutDate === 'string' ? parseISO(checkOutDate) : checkOutDate;
  if (!isValid(checkIn) || !isValid(checkOut)) return 0;
  const days = differenceInCalendarDays(checkOut, checkIn);
  return Math.max(1, days);
}
