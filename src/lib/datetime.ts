/**
 * Date/time formatting. Operator timezone is Asia/Bangkok; calendar dates are
 * formatted in UTC so a plain `YYYY-MM-DD` never shifts by a day.
 */
import type { IsoDate, IsoDateTime, LocalTime } from '../types/domain';

export const OPERATOR_TIMEZONE = 'Asia/Bangkok';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
});

const STAMP_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  hour12: false, timeZone: OPERATOR_TIMEZONE,
});

export function formatDate(date: IsoDate): string {
  return DATE_FORMAT.format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTime(stamp: IsoDateTime): string {
  return STAMP_FORMAT.format(new Date(stamp));
}

export function formatTimeRange(from: LocalTime, to: LocalTime): string {
  return `${from}–${to}`;
}
