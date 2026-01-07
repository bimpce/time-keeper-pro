import { useState, useMemo } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useAbsences } from "@/hooks/useAbsences";
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
    const lastDay = new Date(year, month + 1, 0);
    
    let totalWorkSeconds = 0;
    let totalOvertimeSeconds = 0;
    let daysWorked = 0;
    let requiredWorkDays = 0;
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
      
      const effectiveSeconds = getEffectiveWorkSeconds(dateStr);
      const summary = calculateDailySummary(entries, dateStr, { absences, holidays });
      
      if (effectiveSeconds > 0) {
        totalWorkSeconds += effectiveSeconds;
        daysWorked++;
        
        if (isOvertimeDay(dateStr) && summary.grossSeconds > 0) {
          totalOvertimeSeconds += summary.grossSeconds;
        } else {
          totalOvertimeSeconds += summary.overtimeSeconds;
        }
      }
    }

    return {
      totalWorkSeconds,
      totalOvertimeSeconds,
      daysWorked,
      averageDailySeconds: daysWorked > 0 ? totalWorkSeconds / daysWorked : 0,
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
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
          <span className="font-semibold capitalize">{currentDate.toLocaleDateString("sl-SI", { month: "long", year: "numeric" })} ({monthlySummary.requiredHours} h)</span>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card><CardContent className="pt-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-mono font-bold">{formatSecondsToTime(monthlySummary.totalWorkSeconds)}</p>
            <p className="text-sm text-muted-foreground">Skupaj delo</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-warning mb-2" />
            <p className="text-2xl font-mono font-bold">+{formatSecondsToTime(monthlySummary.totalOvertimeSeconds)}</p>
            <p className="text-sm text-muted-foreground">Nadure</p>
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
