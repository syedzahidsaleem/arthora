/**
 * Formats a Date object or ISO string into "DD MMM YYYY" format.
 * Example: 2026-09-01 -> "01 Sep 2026"
 *
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Checks whether the Indian stock market (NSE/BSE) is currently open.
 * Trading hours: Monday to Friday, 9:15 AM to 3:30 PM IST (UTC+5:30).
 *
 * @param checkDate - Optional date to check (defaults to current system time)
 * @returns boolean indicating if market is currently active
 */
export function isMarketOpen(checkDate: Date = new Date()): boolean {
  // Convert target date to IST time string components
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  });

  const parts = istFormatter.formatToParts(checkDate);
  const weekday = parts.find((p) => p.type === 'weekday')?.value;
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

  // Closed on Saturday and Sunday
  if (weekday === 'Sat' || weekday === 'Sun') {
    return false;
  }

  const currentMinutesFromMidnight = hour * 60 + minute;
  const marketOpenMinutes = 9 * 60 + 15; // 09:15 IST
  const marketCloseMinutes = 15 * 60 + 30; // 15:30 IST

  return (
    currentMinutesFromMidnight >= marketOpenMinutes &&
    currentMinutesFromMidnight <= marketCloseMinutes
  );
}

/**
 * Calculates the number of whole days remaining until a future date.
 *
 * @param targetDate - The future target date
 * @param fromDate - The reference start date (defaults to now)
 * @returns Number of days (positive if future, negative if past)
 */
export function daysUntil(
  targetDate: Date | string | number,
  fromDate: Date = new Date(),
): number {
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = target.getTime() - fromDate.getTime();
  return Math.ceil(diffMs / msPerDay);
}
