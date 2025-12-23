import { TimeEntry } from "@/hooks/useTimeEntries";

const STANDARD_WORK_HOURS = 8;
const STANDARD_BREAK_MINUTES = 30;
const BREAK_THRESHOLD_MINUTES = 3;

export interface DailySummary {
  date: string;
  workMinutes: number;
  breakMinutes: number;
  overtimeMinutes: number;
  entries: TimeEntry[];
  isComplete: boolean;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  totalOvertimeMinutes: number;
  daysWorked: number;
  averageDailyMinutes: number;
  days: DailySummary[];
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  totalOvertimeMinutes: number;
  daysWorked: number;
  averageDailyMinutes: number;
  weeks: WeeklySummary[];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  const sign = minutes < 0 ? "-" : "";
  return `${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function formatMinutesToHoursDecimal(minutes: number): string {
  return (minutes / 60).toFixed(2);
}

export function calculateDailySummary(entries: TimeEntry[], date: string): DailySummary {
  const dayEntries = entries
    .filter((e) => e.entry_date === date)
    .sort((a, b) => a.entry_time.localeCompare(b.entry_time));

  let workMinutes = 0;
  let breakMinutes = 0;
  let lastDeparture: number | null = null;
  let isAtWork = false;
  let arrivalTime: number | null = null;

  for (const entry of dayEntries) {
    const entryMinutes = timeToMinutes(entry.entry_time);

    if (entry.entry_type === "arrival") {
      // Check for break (gap > 3 minutes from last departure)
      if (lastDeparture !== null) {
        const gap = entryMinutes - lastDeparture;
        if (gap > BREAK_THRESHOLD_MINUTES) {
          breakMinutes += gap;
        }
      }
      arrivalTime = entryMinutes;
      isAtWork = true;
    } else if (entry.entry_type === "departure") {
      if (arrivalTime !== null) {
        workMinutes += entryMinutes - arrivalTime;
      }
      lastDeparture = entryMinutes;
      isAtWork = false;
      arrivalTime = null;
    }
  }

  // Calculate overtime (work > 8 hours)
  const standardWorkMinutes = STANDARD_WORK_HOURS * 60;
  const overtimeMinutes = Math.max(0, workMinutes - standardWorkMinutes);

  // Check if day is complete (ends with departure)
  const isComplete = dayEntries.length > 0 && !isAtWork;

  return {
    date,
    workMinutes,
    breakMinutes,
    overtimeMinutes,
    entries: dayEntries,
    isComplete,
  };
}

export function calculateWeeklySummary(entries: TimeEntry[], weekStart: Date): WeeklySummary {
  const days: DailySummary[] = [];
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    days.push(calculateDailySummary(entries, dateStr));
  }

  const daysWithWork = days.filter((d) => d.workMinutes > 0);
  const totalWorkMinutes = days.reduce((sum, d) => sum + d.workMinutes, 0);
  const totalBreakMinutes = days.reduce((sum, d) => sum + d.breakMinutes, 0);
  const totalOvertimeMinutes = days.reduce((sum, d) => sum + d.overtimeMinutes, 0);

  return {
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    totalWorkMinutes,
    totalBreakMinutes,
    totalOvertimeMinutes,
    daysWorked: daysWithWork.length,
    averageDailyMinutes: daysWithWork.length > 0 ? totalWorkMinutes / daysWithWork.length : 0,
    days,
  };
}

export function calculateMonthlySummary(entries: TimeEntry[], year: number, month: number): MonthlySummary {
  const weeks: WeeklySummary[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the Monday of the first week
  let currentWeekStart = new Date(firstDay);
  const dayOfWeek = currentWeekStart.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentWeekStart.setDate(currentWeekStart.getDate() + diff);

  while (currentWeekStart <= lastDay) {
    weeks.push(calculateWeeklySummary(entries, new Date(currentWeekStart)));
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  const monthStr = firstDay.toLocaleDateString("sl-SI", { month: "long" });
  const totalWorkMinutes = weeks.reduce((sum, w) => sum + w.totalWorkMinutes, 0);
  const totalBreakMinutes = weeks.reduce((sum, w) => sum + w.totalBreakMinutes, 0);
  const totalOvertimeMinutes = weeks.reduce((sum, w) => sum + w.totalOvertimeMinutes, 0);
  const daysWorked = weeks.reduce((sum, w) => sum + w.daysWorked, 0);

  return {
    month: monthStr,
    year,
    totalWorkMinutes,
    totalBreakMinutes,
    totalOvertimeMinutes,
    daysWorked,
    averageDailyMinutes: daysWorked > 0 ? totalWorkMinutes / daysWorked : 0,
    weeks,
  };
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}