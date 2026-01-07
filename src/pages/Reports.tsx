import { useState, useMemo } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useAbsences } from "@/hooks/useAbsences";
import { calculateDailySummary, formatSecondsToTime, getWeekNumber } from "@/lib/timeCalculations";
import { getSlovenianHolidays, isHoliday } from "@/lib/slovenianHolidays";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Calendar, TrendingUp, Users, Palmtree } from "lucide-react";

const STANDARD_WORK_SECONDS = 28800; // 8 hours in seconds

const Reports = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entries } = useTimeEntries();
  const { absences, getAbsenceForDate } = useAbsences();

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const holidays = useMemo(() => getSlovenianHolidays(year), [year]);

  // Check if a date is a weekend (Saturday = 6, Sunday = 0)
  const isWeekendDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Calculate effective work seconds for a date (using gross time)
  const getEffectiveWorkSeconds = (dateStr: string) => {
    const summary = calculateDailySummary(entries, dateStr, { absences, holidays });
    const holiday = isHoliday(dateStr, holidays);
    const absence = getAbsenceForDate(dateStr);
    const isWeekend = isWeekendDate(dateStr);
    
    // If there's actual work entered, use gross time (first arrival to last departure)
    if (summary.grossSeconds > 0) {
      return summary.grossSeconds;
    }
    
    // Holidays and absences on weekdays count as 8 hours
    if (!isWeekend && (holiday || absence)) {
      return STANDARD_WORK_SECONDS;
    }
    
    return 0;
  };

  // Check if work on a day is overtime (weekend or holiday)
  const isOvertimeDay = (dateStr: string) => {
    const isWeekend = isWeekendDate(dateStr);
    const holiday = isHoliday(dateStr, holidays);
    return isWeekend || !!holiday;
  };

  // Calculate weekly summary including holidays and absences
  const calculateWeekSummary = () => {
    let totalWorkSeconds = 0;
    let totalOvertimeSeconds = 0;
    let daysWorked = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      const effectiveSeconds = getEffectiveWorkSeconds(dateStr);
      const summary = calculateDailySummary(entries, dateStr, { absences, holidays });
      
      if (effectiveSeconds > 0) {
        totalWorkSeconds += effectiveSeconds;
        daysWorked++;
        
        // Work on weekends/holidays counts entirely as overtime
        if (isOvertimeDay(dateStr) && summary.grossSeconds > 0) {
          totalOvertimeSeconds += summary.grossSeconds;
        } else {
          // Regular day overtime (work > 8 hours)
          totalOvertimeSeconds += summary.overtimeSeconds;
        }
      }
    }

    return {
      totalWorkSeconds,
      totalOvertimeSeconds,
      daysWorked,
      averageDailySeconds: daysWorked > 0 ? totalWorkSeconds / daysWorked : 0,
    };
  };

  // Calculate monthly summary including holidays and absences
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
      
      // Count required work days (Monday-Friday, including holidays)
      if (!isWeekend) {
        requiredWorkDays++;
        
        // Count vacation days (only on weekdays)
        if (absence?.absence_type === "vacation") {
          vacationDays++;
        }
      }
      
      const effectiveSeconds = getEffectiveWorkSeconds(dateStr);
      const summary = calculateDailySummary(entries, dateStr, { absences, holidays });
      
      if (effectiveSeconds > 0) {
        totalWorkSeconds += effectiveSeconds;
        daysWorked++;
        
        // Work on weekends/holidays counts entirely as overtime
        if (isOvertimeDay(dateStr) && summary.grossSeconds > 0) {
          totalOvertimeSeconds += summary.grossSeconds;
        } else {
          // Regular day overtime (work > 8 hours)
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

  const weeklySummary = calculateWeekSummary();
  const monthlySummary = calculateMonthSummary();

  const prevWeek = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
  const nextWeek = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <h1 className="text-xl font-bold">Poročila</h1>
        </div>
      </header>

      <main className="container py-4">
        <Tabs defaultValue="weekly">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="weekly" className="flex-1">Teden</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Mesec</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="h-5 w-5" /></Button>
              <div className="text-center">
                <span className="font-semibold">Teden {getWeekNumber(weekStart)}</span>
                <p className="text-sm text-muted-foreground">
                  {weekStart.toLocaleDateString("sl-SI", { day: "numeric", month: "short" })} – {(() => {
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return weekEnd.toLocaleDateString("sl-SI", { day: "numeric", month: "short" });
                  })()}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={nextWeek}><ChevronRight className="h-5 w-5" /></Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="pt-4 text-center">
                <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-mono font-bold">{formatSecondsToTime(weeklySummary.totalWorkSeconds)}</p>
                <p className="text-sm text-muted-foreground">Skupaj delo</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-warning mb-2" />
                <p className="text-2xl font-mono font-bold">+{formatSecondsToTime(weeklySummary.totalOvertimeSeconds)}</p>
                <p className="text-sm text-muted-foreground">Nadure</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{weeklySummary.daysWorked}</p>
                <p className="text-sm text-muted-foreground">Dni dela</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-mono font-bold">{formatSecondsToTime(Math.round(weeklySummary.averageDailySeconds))}</p>
                <p className="text-sm text-muted-foreground">Povprečje/dan</p>
              </CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default Reports;
