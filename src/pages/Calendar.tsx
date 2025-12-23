import { useState, useMemo } from "react";
import { useTimeEntries, TimeEntry } from "@/hooks/useTimeEntries";
import { useAbsences, Absence, AbsenceType } from "@/hooks/useAbsences";
import { calculateDailySummary, formatMinutesToTime } from "@/lib/timeCalculations";
import { getSlovenianHolidays, isHoliday } from "@/lib/slovenianHolidays";
import { Timeline } from "@/components/Timeline";
import { DaySummaryCard } from "@/components/DaySummaryCard";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { AddAbsenceDialog } from "@/components/AddAbsenceDialog";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Trash2, Thermometer, Palmtree, Briefcase } from "lucide-react";

const absenceLabels: Record<AbsenceType, { label: string; icon: React.ReactNode; colorClass: string }> = {
  sick_leave: { label: "Bolniška", icon: <Thermometer className="h-4 w-4" />, colorClass: "bg-orange-500/20 text-orange-600 border-orange-500/30" },
  vacation: { label: "Dopust", icon: <Palmtree className="h-4 w-4" />, colorClass: "bg-green-500/20 text-green-600 border-green-500/30" },
  work_from_home: { label: "Delo od doma", icon: <Briefcase className="h-4 w-4" />, colorClass: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
};

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useTimeEntries();
  const { absences, createAbsence, deleteAbsence, getAbsenceForDate } = useAbsences();
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const holidays = useMemo(() => getSlovenianHolidays(year), [year]);

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const getDaySummaryInfo = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const summary = calculateDailySummary(entries, dateStr);
    const holiday = isHoliday(dateStr, holidays);
    const absence = getAbsenceForDate(dateStr);
    
    // Holidays and absences count as 8 hours (480 minutes)
    const effectiveWorkMinutes = holiday || absence ? 480 : summary.workMinutes;
    
    let status = "none";
    if (effectiveWorkMinutes > 0 && effectiveWorkMinutes < 480) status = "partial";
    if (effectiveWorkMinutes >= 480) status = "full";
    return { status, workMinutes: effectiveWorkMinutes, isHoliday: !!holiday, absence };
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selectedSummary = selectedDate ? calculateDailySummary(entries, selectedDate) : null;
  const selectedEntries = selectedDate ? entries.filter((e) => e.entry_date === selectedDate) : [];
  const selectedHoliday = selectedDate ? isHoliday(selectedDate, holidays) : undefined;
  const selectedAbsence = selectedDate ? getAbsenceForDate(selectedDate) : undefined;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold capitalize">
              {currentMonth.toLocaleDateString("sl-SI", { month: "long", year: "numeric" })}
            </h1>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
              {["Po", "To", "Sr", "Če", "Pe", "So", "Ne"].map((d) => (
                <div key={d} className="py-2 text-muted-foreground font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const { status, workMinutes, absence } = getDaySummaryInfo(day);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split("T")[0];
                const holiday = isHoliday(dateStr, holidays);
                const isWeekend = (i % 7) >= 5;
                
                // Get absence-specific styling
                const getAbsenceStyle = () => {
                  if (!absence || isSelected) return "";
                  const info = absenceLabels[absence.absence_type];
                  return info.colorClass;
                };
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors p-1 relative
                      ${isSelected ? "bg-primary text-primary-foreground" : ""}
                      ${!isSelected && !absence && status === "full" ? "bg-success/20 text-success" : ""}
                      ${!isSelected && !absence && status === "partial" ? "bg-warning/20 text-warning" : ""}
                      ${!isSelected && !absence && status === "none" && !holiday && !isWeekend ? "hover:bg-muted" : ""}
                      ${!isSelected && !absence && (holiday || isWeekend) && status === "none" ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : ""}
                      ${!isSelected && absence ? getAbsenceStyle() : ""}
                      ${isToday && !isSelected ? "ring-2 ring-primary" : ""}
                    `}
                    title={holiday?.name || (absence ? absenceLabels[absence.absence_type].label : undefined)}
                  >
                    <span>{day}</span>
                    {workMinutes > 0 && (
                      <span className={`text-[10px] font-mono ${isSelected ? "text-primary-foreground/80" : "opacity-70"}`}>
                        {formatMinutesToTime(workMinutes)}
                      </span>
                    )}
                    {(holiday || absence) && !isSelected && (
                      <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                        absence 
                          ? absence.absence_type === "sick_leave" ? "bg-orange-500" 
                            : absence.absence_type === "vacation" ? "bg-green-500" 
                            : "bg-blue-500"
                          : "bg-destructive"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-success/20" />
                <span>Poln dan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-warning/20" />
                <span>Delno</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-destructive/10" />
                <span>Praznik</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500/20" />
                <span>Bolniška</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-500/20" />
                <span>Dopust</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500/20" />
                <span>Od doma</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AddAbsenceDialog 
          onSubmit={(data) => createAbsence.mutate(data)} 
          isLoading={createAbsence.isPending} 
        />

        {selectedDate && selectedSummary && (
          <>
            {selectedHoliday && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="py-3 text-center">
                  <p className="text-destructive font-medium">{selectedHoliday.name}</p>
                </CardContent>
              </Card>
            )}
            {selectedAbsence && (
              <Card className={`border ${absenceLabels[selectedAbsence.absence_type].colorClass}`}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {absenceLabels[selectedAbsence.absence_type].icon}
                    <span className="font-medium">{absenceLabels[selectedAbsence.absence_type].label}</span>
                    {selectedAbsence.note && (
                      <span className="text-sm text-muted-foreground">- {selectedAbsence.note}</span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteAbsence.mutate(selectedAbsence.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
            <DaySummaryCard summary={selectedSummary} />
            <TimeEntryForm onSubmit={(data) => createEntry.mutate({ ...data, entry_date: selectedDate })} isLoading={createEntry.isPending} defaultDate={selectedDate} />
            <Timeline entries={selectedEntries} onEdit={setEditingEntry} onDelete={(id) => deleteEntry.mutate(id)} />
          </>
        )}
      </main>

      <EditEntryDialog entry={editingEntry} open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)} onSubmit={(data) => updateEntry.mutate(data)} isLoading={updateEntry.isPending} />
      <BottomNav />
    </div>
  );
};

export default CalendarPage;
