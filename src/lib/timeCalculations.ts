import { TimeEntry } from "@/hooks/useTimeEntries";
import { Absence } from "@/hooks/useAbsences";
import { Holiday } from "@/lib/slovenianHolidays";

const STANDARD_WORK_HOURS = 8;
const BREAK_THRESHOLD_SECONDS = 180; // 3 minutes in seconds
const DEFAULT_LUNCH_BREAK_SECONDS = 1800; // 30 minutes in seconds

export interface DailySummary {
  date: string;
  workSeconds: number;
  breakSeconds: number;
  overtimeSeconds: number;
  entries: TimeEntry[];
  isComplete: boolean;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  totalOvertimeSeconds: number;
  daysWorked: number;
  averageDailySeconds: number;
  days: DailySummary[];
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  totalOvertimeSeconds: number;
  daysWorked: number;
  averageDailySeconds: number;
  weeks: WeeklySummary[];
}

function timeToSeconds(time: string): number {
  const parts = time.split(":").map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  const sign = minutes < 0 ? "-" : "";
  return `${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function formatSecondsToTime(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : "";
  const absSeconds = Math.abs(totalSeconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatSecondsToMinutes(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  return formatMinutesToTime(minutes);
}

export function formatMinutesToHoursDecimal(minutes: number): string {
  return (minutes / 60).toFixed(2);
}

export function formatSecondsToHoursDecimal(seconds: number): string {
  return (seconds / 3600).toFixed(2);
}

export interface DailySummaryOptions {
  absences?: Absence[];
  holidays?: Holiday[];
}

export function calculateDailySummary(
  entries: TimeEntry[],
  date: string,
  options: DailySummaryOptions = {}
): DailySummary {
  const { absences = [], holidays = [] } = options;
  
  const dayEntries = entries
    .filter((e) => e.entry_date === date)
    .sort((a, b) => a.entry_time.localeCompare(b.entry_time));

  // Check if this day has an absence (vacation, sick leave, work from home)
  const hasAbsence = absences.some(
    (absence) => date >= absence.start_date && date <= absence.end_date
  );
  
  // Check if this day is a holiday
  const isHoliday = holidays.some((holiday) => holiday.date === date);
  
  // Check if this is a weekend
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let workSeconds = 0;
  let breakSeconds = 0;
  let lastDeparture: number | null = null;
  let isAtWork = false;
  let arrivalTime: number | null = null;

  for (const entry of dayEntries) {
    const entrySeconds = timeToSeconds(entry.entry_time);

    if (entry.entry_type === "arrival") {
      // Check for break (gap > 3 minutes from last departure)
      if (lastDeparture !== null) {
        const gap = entrySeconds - lastDeparture;
        if (gap > BREAK_THRESHOLD_SECONDS) {
          breakSeconds += gap;
        }
      }
      arrivalTime = entrySeconds;
      isAtWork = true;
    } else if (entry.entry_type === "departure") {
      if (arrivalTime !== null) {
        workSeconds += entrySeconds - arrivalTime;
      }
      lastDeparture = entrySeconds;
      isAtWork = false;
      arrivalTime = null;
    }
  }

  // Check if it's a work day (has entries, not absence/holiday/weekend)
  const isWorkDay = dayEntries.length > 0 && !hasAbsence && !isHoliday && !isWeekend;
  
  // Track actual break seconds taken
  const actualBreakSeconds = breakSeconds;
  
  // Set entitled break to 30 min for work days
  const entitledBreakSeconds = isWorkDay ? DEFAULT_LUNCH_BREAK_SECONDS : 0;
  
  // Display break is always the entitled amount for work days (or actual if higher)
  if (isWorkDay) {
    breakSeconds = Math.max(entitledBreakSeconds, actualBreakSeconds);
  }

  // Calculate overtime based on actual work time compared to 8 hours standard
  // The unused break is NOT added for overtime calculation
  // Logic: gross span (08:07:03) + unused break (3:20) = 08:10:23 vs 8:30 (8h work + 30min break)
  // This is equivalent to: work time (07:40:23) vs 8:00 standard
  const standardWorkSeconds = STANDARD_WORK_HOURS * 3600;
  const overtimeSeconds = Math.max(0, workSeconds - standardWorkSeconds);

  // Check if day is complete (ends with departure)
  const isComplete = dayEntries.length > 0 && !isAtWork;

  return {
    date,
    workSeconds,
    breakSeconds,
    overtimeSeconds,
    entries: dayEntries,
    isComplete,
  };
}

export function calculateWeeklySummary(
  entries: TimeEntry[],
  weekStart: Date,
  options: DailySummaryOptions = {}
): WeeklySummary {
  const days: DailySummary[] = [];
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    days.push(calculateDailySummary(entries, dateStr, options));
  }

  const daysWithWork = days.filter((d) => d.workSeconds > 0);
  const totalWorkSeconds = days.reduce((sum, d) => sum + d.workSeconds, 0);
  const totalBreakSeconds = days.reduce((sum, d) => sum + d.breakSeconds, 0);
  const totalOvertimeSeconds = days.reduce((sum, d) => sum + d.overtimeSeconds, 0);

  return {
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    totalWorkSeconds,
    totalBreakSeconds,
    totalOvertimeSeconds,
    daysWorked: daysWithWork.length,
    averageDailySeconds: daysWithWork.length > 0 ? totalWorkSeconds / daysWithWork.length : 0,
    days,
  };
}

export function calculateMonthlySummary(
  entries: TimeEntry[],
  year: number,
  month: number,
  options: DailySummaryOptions = {}
): MonthlySummary {
  const weeks: WeeklySummary[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the Monday of the first week
  let currentWeekStart = new Date(firstDay);
  const dayOfWeek = currentWeekStart.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentWeekStart.setDate(currentWeekStart.getDate() + diff);

  while (currentWeekStart <= lastDay) {
    weeks.push(calculateWeeklySummary(entries, new Date(currentWeekStart), options));
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  const monthStr = firstDay.toLocaleDateString("sl-SI", { month: "long" });
  const totalWorkSeconds = weeks.reduce((sum, w) => sum + w.totalWorkSeconds, 0);
  const totalBreakSeconds = weeks.reduce((sum, w) => sum + w.totalBreakSeconds, 0);
  const totalOvertimeSeconds = weeks.reduce((sum, w) => sum + w.totalOvertimeSeconds, 0);
  const daysWorked = weeks.reduce((sum, w) => sum + w.daysWorked, 0);

  return {
    month: monthStr,
    year,
    totalWorkSeconds,
    totalBreakSeconds,
    totalOvertimeSeconds,
    daysWorked,
    averageDailySeconds: daysWorked > 0 ? totalWorkSeconds / daysWorked : 0,
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