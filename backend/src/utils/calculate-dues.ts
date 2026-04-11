import { differenceInCalendarMonths, endOfMonth, startOfMonth } from 'date-fns';

export interface DuesDonor {
  monthly_amount: number;
  registration_date: Date | string;
  due_from?: Date | string | null;
}

function parseDate(value: Date | string | null | undefined): Date {
  if (!value) {
    throw new Error('Date value is required for dues calculation');
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${String(value)}`);
  }

  return parsed;
}

export function calculateTotalDue(donor: DuesDonor, upToDate: Date = new Date()): number {
  const start = donor.due_from ? parseDate(donor.due_from) : parseDate(donor.registration_date);

  const fromMonth = startOfMonth(start);
  const toMonth = startOfMonth(upToDate);

  if (toMonth < fromMonth) {
    return 0;
  }

  const monthsInclusive = differenceInCalendarMonths(toMonth, fromMonth) + 1;
  const total = monthsInclusive * Number(donor.monthly_amount || 0);

  return Number(total.toFixed(2));
}

export function calculateOutstandingBalance(totalDue: number, totalPaid: number): number {
  return Number((totalDue - totalPaid).toFixed(2));
}

export function toIsoDate(value: Date | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.toISOString();
}

export function monthBounds(month?: string): { start: Date; end: Date } {
  const base = month ? new Date(`${month}-01T00:00:00.000Z`) : new Date();
  if (Number.isNaN(base.getTime())) {
    throw new Error('Invalid month format. Expected YYYY-MM.');
  }

  return {
    start: startOfMonth(base),
    end: endOfMonth(base),
  };
}
