import type { Absence } from "@/hooks/useAbsences";
import { getSlovenianHolidays, isHoliday, type Holiday } from "@/lib/slovenianHolidays";

/**
 * Count vacation days (weekdays, excluding holidays) taken within [from, to] inclusive.
 * Dates are ISO YYYY-MM-DD strings.
 */
export function countVacationDaysInRange(
  absences: Absence[],
  fromISO: string,
  toISO: string,
  holidays: Holiday[]
): number {
  let count = 0;
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");

  for (const abs of absences) {
    if (abs.absence_type !== "vacation") continue;
    const start = new Date(abs.start_date + "T00:00:00");
    const end = new Date(abs.end_date + "T00:00:00");
    const rangeStart = start > from ? start : from;
    const rangeEnd = end < to ? end : to;
    if (rangeStart > rangeEnd) continue;

    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) continue;
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (isHoliday(iso, holidays)) continue;
      count++;
    }
  }
  return count;
}

export interface VacationBalance {
  carryover: number;
  annualQuota: number;
  totalAvailable: number;
  used: number;
  usedFromCarryover: number;
  usedFromAnnual: number;
  remainingCarryover: number;
  remainingAnnual: number;
  remainingTotal: number;
}

/**
 * Compute vacation balance for a given year, applying the rule
 * "carryover is consumed first".
 */
export function computeVacationBalance(
  absences: Absence[],
  year: number,
  carryover: number,
  annualQuota: number
): VacationBalance {
  const holidays = getSlovenianHolidays(year);
  const used = countVacationDaysInRange(
    absences,
    `${year}-01-01`,
    `${year}-12-31`,
    holidays
  );

  const usedFromCarryover = Math.min(used, carryover);
  const usedFromAnnual = Math.max(0, used - carryover);
  const remainingCarryover = Math.max(0, carryover - usedFromCarryover);
  const remainingAnnual = Math.max(0, annualQuota - usedFromAnnual);

  return {
    carryover,
    annualQuota,
    totalAvailable: carryover + annualQuota,
    used,
    usedFromCarryover,
    usedFromAnnual,
    remainingCarryover,
    remainingAnnual,
    remainingTotal: remainingCarryover + remainingAnnual,
  };
}
