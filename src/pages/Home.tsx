import { useState, useMemo } from "react";
import { useTimeEntries, TimeEntry } from "@/hooks/useTimeEntries";
import { useAbsences } from "@/hooks/useAbsences";
import { calculateDailySummary } from "@/lib/timeCalculations";
import { getSlovenianHolidays } from "@/lib/slovenianHolidays";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { Timeline } from "@/components/Timeline";
import { DaySummaryCard } from "@/components/DaySummaryCard";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { AddAbsenceDialog } from "@/components/AddAbsenceDialog";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Home as HomeIcon, Palmtree, Thermometer } from "lucide-react";

const Home = () => {
  const today = new Date().toISOString().split("T")[0];
  const year = new Date().getFullYear();
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useTimeEntries(today);
  const { absences, getAbsenceForDate, createAbsence } = useAbsences();
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const holidays = useMemo(() => getSlovenianHolidays(year), [year]);

  const todayEntries = entries.filter((e) => e.entry_date === today);
  const summary = calculateDailySummary(entries, today, { absences, holidays });
  const todayAbsence = getAbsenceForDate(today);

  const formattedDate = new Date().toLocaleDateString("sl-SI", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const getAbsenceLabel = (type: string) => {
    switch (type) {
      case "work_from_home": return { label: "Delo od doma", icon: HomeIcon, variant: "secondary" as const };
      case "vacation": return { label: "Dopust", icon: Palmtree, variant: "default" as const };
      case "sick_leave": return { label: "Bolniška", icon: Thermometer, variant: "destructive" as const };
      default: return { label: type, icon: Clock, variant: "secondary" as const };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Delovne Ure</h1>
              <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
            </div>
            {todayAbsence && (() => {
              const { label, icon: Icon, variant } = getAbsenceLabel(todayAbsence.absence_type);
              return (
                <Badge variant={variant} className="gap-1">
                  <Icon className="h-3 w-3" />
                  {label}
                </Badge>
              );
            })()}
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <DaySummaryCard summary={summary} />

            {!todayAbsence && (
              <AddAbsenceDialog
                onSubmit={(data) => createAbsence.mutate(data)}
                isLoading={createAbsence.isPending}
                defaultDate={today}
              />
            )}
            
            <TimeEntryForm
              onSubmit={(data) => createEntry.mutate(data)}
              isLoading={createEntry.isPending}
              defaultDate={today}
            />

            <div>
              <h2 className="text-lg font-semibold mb-3">Današnji vnosi</h2>
              <Timeline
                entries={todayEntries}
                onUpdate={(id, newTime) => {
                  const entry = todayEntries.find((e) => e.id === id);
                  if (entry) {
                    updateEntry.mutate({
                      id,
                      entry_type: entry.entry_type as "arrival" | "departure",
                      entry_time: newTime,
                      entry_date: entry.entry_date,
                    });
                  }
                }}
                onAdd={(entryType, time) => {
                  createEntry.mutate({
                    entry_type: entryType,
                    entry_time: time,
                    entry_date: today,
                  });
                }}
                onDelete={(id) => deleteEntry.mutate(id)}
              />
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;