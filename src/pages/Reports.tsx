import { useState } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { calculateWeeklySummary, calculateMonthlySummary, formatMinutesToTime, getWeekNumber } from "@/lib/timeCalculations";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Calendar, TrendingUp, Users } from "lucide-react";

const Reports = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entries } = useTimeEntries();

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weeklySummary = calculateWeeklySummary(entries, weekStart);
  const monthlySummary = calculateMonthlySummary(entries, currentDate.getFullYear(), currentDate.getMonth());

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
              <span className="font-semibold">Teden {getWeekNumber(weekStart)}</span>
              <Button variant="ghost" size="icon" onClick={nextWeek}><ChevronRight className="h-5 w-5" /></Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="pt-4 text-center">
                <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-mono font-bold">{formatMinutesToTime(weeklySummary.totalWorkMinutes)}</p>
                <p className="text-sm text-muted-foreground">Skupaj delo</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-warning mb-2" />
                <p className="text-2xl font-mono font-bold">+{formatMinutesToTime(weeklySummary.totalOvertimeMinutes)}</p>
                <p className="text-sm text-muted-foreground">Nadure</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{weeklySummary.daysWorked}</p>
                <p className="text-sm text-muted-foreground">Dni dela</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-mono font-bold">{formatMinutesToTime(Math.round(weeklySummary.averageDailyMinutes))}</p>
                <p className="text-sm text-muted-foreground">Povprečje/dan</p>
              </CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
              <span className="font-semibold capitalize">{currentDate.toLocaleDateString("sl-SI", { month: "long", year: "numeric" })}</span>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="pt-4 text-center">
                <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-mono font-bold">{formatMinutesToTime(monthlySummary.totalWorkMinutes)}</p>
                <p className="text-sm text-muted-foreground">Skupaj delo</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-warning mb-2" />
                <p className="text-2xl font-mono font-bold">+{formatMinutesToTime(monthlySummary.totalOvertimeMinutes)}</p>
                <p className="text-sm text-muted-foreground">Nadure</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{monthlySummary.daysWorked}</p>
                <p className="text-sm text-muted-foreground">Dni dela</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-mono font-bold">{formatMinutesToTime(Math.round(monthlySummary.averageDailyMinutes))}</p>
                <p className="text-sm text-muted-foreground">Povprečje/dan</p>
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