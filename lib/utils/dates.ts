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

export interface NightRateBreakdown {
  dateStr: string; // 'YYYY-MM-DD'
  formattedDate: string; // '20 Aug'
  dayName: string; // 'Friday', 'Saturday', etc.
  isWeekend: boolean;
  rate: number;
}

export interface StayCalculationResult {
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  breakdown: NightRateBreakdown[];
  totalRoomAmount: number;
  averageRatePerNight: number;
}

/**
 * Calculate stay rates per night distinguishing weekday vs weekend tariffs.
 * In the hotel industry & as per specification:
 * - Monday to Friday: Weekday base rate
 * - Saturday and Sunday: Weekend rate (if specified, otherwise base rate)
 */
export function calculateStayRates(
  checkInDate: string | Date,
  checkOutDate: string | Date,
  baseRate: number,
  weekendRate?: number | null
): StayCalculationResult {
  const checkIn = typeof checkInDate === 'string' ? parseISO(checkInDate) : new Date(checkInDate);
  const checkOut = typeof checkOutDate === 'string' ? parseISO(checkOutDate) : new Date(checkOutDate);

  if (!isValid(checkIn) || !isValid(checkOut) || checkOut <= checkIn) {
    const defaultRate = Math.max(0, baseRate || 0);
    return {
      nights: 1,
      weekdayNights: 1,
      weekendNights: 0,
      breakdown: [
        {
          dateStr: isValid(checkIn) ? format(checkIn, 'yyyy-MM-dd') : '',
          formattedDate: isValid(checkIn) ? format(checkIn, 'dd MMM') : '',
          dayName: isValid(checkIn) ? format(checkIn, 'EEEE') : '',
          isWeekend: false,
          rate: defaultRate,
        },
      ],
      totalRoomAmount: defaultRate,
      averageRatePerNight: defaultRate,
    };
  }

  const breakdown: NightRateBreakdown[] = [];
  let weekdayNights = 0;
  let weekendNights = 0;
  let totalRoomAmount = 0;

  // Clone start date and iterate night by night
  const current = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const end = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

  while (current < end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const effectiveRate =
      isWeekend && weekendRate !== null && weekendRate !== undefined && Number(weekendRate) > 0
        ? Number(weekendRate)
        : Number(baseRate || 0);

    if (isWeekend) {
      weekendNights++;
    } else {
      weekdayNights++;
    }

    totalRoomAmount += effectiveRate;

    breakdown.push({
      dateStr: format(current, 'yyyy-MM-dd'),
      formattedDate: format(current, 'dd MMM'),
      dayName: format(current, 'EEEE'),
      isWeekend,
      rate: effectiveRate,
    });

    // Advance to next day
    current.setDate(current.getDate() + 1);
  }

  const nights = Math.max(1, breakdown.length);
  const averageRatePerNight = Math.round((totalRoomAmount / nights) * 100) / 100;

  return {
    nights,
    weekdayNights,
    weekendNights,
    breakdown,
    totalRoomAmount,
    averageRatePerNight,
  };
}

