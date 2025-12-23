import { useState } from "react";
import { useTimeEntries, TimeEntry } from "@/hooks/useTimeEntries";
import { calculateDailySummary, formatMinutesToTime } from "@/lib/timeCalculations";
import { Timeline } from "@/components/Timeline";
import { DaySummaryCard } from "@/components/DaySummaryCard";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useTimeEntries();
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const getDayStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const summary = calculateDailySummary(entries, dateStr);
    if (summary.workMinutes === 0) return "none";
    if (summary.workMinutes >= 480) return "full";
    return "partial";
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selectedSummary = selectedDate ? calculateDailySummary(entries, selectedDate) : null;
  const selectedEntries = selectedDate ? entries.filter((e) => e.entry_date === selectedDate) : [];

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
                const status = getDayStatus(day);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split("T")[0];
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                      ${isSelected ? "bg-primary text-primary-foreground" : ""}
                      ${!isSelected && status === "full" ? "bg-success/20 text-success" : ""}
                      ${!isSelected && status === "partial" ? "bg-warning/20 text-warning" : ""}
                      ${!isSelected && status === "none" ? "hover:bg-muted" : ""}
                      ${isToday && !isSelected ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedDate && selectedSummary && (
          <>
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