import { useState, useMemo } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useAbsences } from "@/hooks/useAbsences";
import { useVacationSettings } from "@/hooks/useVacationSettings";
import { computeVacationBalance } from "@/lib/vacationCalculations";
import { VacationSummary } from "@/components/VacationSummary";
import { calculateDailySummary, formatSecondsToTime } from "@/lib/timeCalculations";
import { getSlovenianHolidays, isHoliday } from "@/lib/slovenianHolidays";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Calendar, TrendingUp, Users, Palmtree } from "lucide-react";

const STANDARD_WORK_SECONDS = 28800; // 8 hours in seconds

const Reports = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entries } = useTimeEntries();
  const { absences, getAbsenceForDate } = useAbsences();
  const { settings: vacationSettings } = useVacationSettings();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const vacationBalance = useMemo(() => {
    if (!vacationSettings?.tracking_enabled) return null;
    return computeVacationBalance(
      absences,
      vacationSettings.current_year,
      Number(vacationSettings.carryover_days),
      Number(vacationSettings.annual_quota_days)
    );
  }, [absences, vacationSettings]);

  const holidays = useMemo(() => getSlovenianHolidays(year), [year]);

  const isWeekendDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getEffectiveWorkSeconds = (dateStr: string) => {
    const summary = calculateDailySummary(entries, dateStr, { absences, holidays });
    const holiday = isHoliday(dateStr, holidays);
    const absence = getAbsenceForDate(dateStr);
    const isWeekend = isWeekendDate(dateStr);
    
    if (summary.grossSeconds > 0) {
      return summary.grossSeconds;
    }
    
    if (!isWeekend && (holiday || absence)) {
      return STANDARD_WORK_SECONDS;
    }
    
    return 0;
  };

  const isOvertimeDay = (dateStr: string) => {
    const isWeekend = isWeekendDate(dateStr);
    const holiday = isHoliday(dateStr, holidays);
    return isWeekend || !!holiday;
  };

  const calculateMonthSummary = () => {
    const today = new Date();
    const lastDay = new Date(year, month + 1, 0);
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const maxDay = isCurrentMonth ? today.getDate() : lastDay.getDate();
    
    let totalGrossSeconds = 0;
    let daysWorked = 0;
    let requiredWorkDays = 0;
    let workedOrCoveredDays = 0; // Days with actual work OR holiday/absence coverage
    let vacationDays = 0;

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isWeekend = isWeekendDate(dateStr);
      const absence = getAbsenceForDate(dateStr);
      
      if (!isWeekend) {
        requiredWorkDays++;
        
        if (absence?.absence_type === "vacation") {
          vacationDays++;
        }
      }
      
      // Only count days up to today for current month
      if (d <= maxDay) {
        const effectiveSeconds = getEffectiveWorkSeconds(dateStr);
        
        if (effectiveSeconds > 0) {
          totalGrossSeconds += effectiveSeconds;
          daysWorked++;
          workedOrCoveredDays++;
        }
      }
    }

    // Cumulative overtime/deficit: total gross hours - (worked/covered days × 8 hours)
    // Can be negative (deficit) or positive (overtime)
    const expectedSeconds = workedOrCoveredDays * STANDARD_WORK_SECONDS;
    const totalOvertimeSeconds = totalGrossSeconds - expectedSeconds;

    return {
      totalWorkSeconds: totalGrossSeconds,
      totalOvertimeSeconds,
      daysWorked,
      averageDailySeconds: daysWorked > 0 ? totalGrossSeconds / daysWorked : 0,
      requiredHours: requiredWorkDays * 8,
      vacationDays,
    };
  };

  const monthlySummary = calculateMonthSummary();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <h1 className="text-xl font-bold">Mesečno poročilo</h1>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Prejšnji mesec"><ChevronLeft className="h-5 w-5" /></Button>
          <span className="font-semibold capitalize">{currentDate.toLocaleDateString("sl-SI", { month: "long", year: "numeric" })} ({monthlySummary.requiredHours} h)</span>
          <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Naslednji mesec"><ChevronRight className="h-5 w-5" /></Button>
        </div>

        <h2 className="text-lg font-semibold">Povzetek meseca</h2>

        <div className="grid grid-cols-2 gap-3">
          <Card><CardContent className="pt-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-mono font-bold">{formatSecondsToTime(monthlySummary.totalWorkSeconds)}</p>
            <p className="text-sm text-muted-foreground">Skupaj delo</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <TrendingUp className={`h-8 w-8 mx-auto mb-2 ${monthlySummary.totalOvertimeSeconds >= 0 ? "text-warning" : "text-destructive"}`} />
            <p className={`text-2xl font-mono font-bold ${monthlySummary.totalOvertimeSeconds < 0 ? "text-destructive" : ""}`}>
              {monthlySummary.totalOvertimeSeconds >= 0 ? "+" : "-"}{formatSecondsToTime(Math.abs(monthlySummary.totalOvertimeSeconds))}
            </p>
            <p className="text-sm text-muted-foreground">{monthlySummary.totalOvertimeSeconds >= 0 ? "Nadure" : "Primanjkljaj"}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{monthlySummary.daysWorked}</p>
            <p className="text-sm text-muted-foreground">Dni dela</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-mono font-bold">{formatSecondsToTime(Math.round(monthlySummary.averageDailySeconds))}</p>
            <p className="text-sm text-muted-foreground">Povprečje/dan</p>
          </CardContent></Card>
          <Card className="col-span-2"><CardContent className="pt-4 text-center">
            <Palmtree className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{monthlySummary.vacationDays}</p>
            <p className="text-sm text-muted-foreground">Dni dopusta</p>
          </CardContent></Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Reports;
