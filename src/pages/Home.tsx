import { useState } from "react";
import { useTimeEntries, TimeEntry } from "@/hooks/useTimeEntries";
import { calculateDailySummary } from "@/lib/timeCalculations";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { Timeline } from "@/components/Timeline";
import { DaySummaryCard } from "@/components/DaySummaryCard";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

const Home = () => {
  const today = new Date().toISOString().split("T")[0];
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useTimeEntries(today);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const todayEntries = entries.filter((e) => e.entry_date === today);
  const summary = calculateDailySummary(entries, today);

  const formattedDate = new Date().toLocaleDateString("sl-SI", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Delovne Ure</h1>
              <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
            </div>
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
            
            <TimeEntryForm
              onSubmit={(data) => createEntry.mutate(data)}
              isLoading={createEntry.isPending}
              defaultDate={today}
            />

            <div>
              <h2 className="text-lg font-semibold mb-3">Današnji vnosi</h2>
              <Timeline
                entries={todayEntries}
                onEdit={setEditingEntry}
                onDelete={(id) => deleteEntry.mutate(id)}
              />
            </div>
          </>
        )}
      </main>

      <EditEntryDialog
        entry={editingEntry}
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onSubmit={(data) => updateEntry.mutate(data)}
        isLoading={updateEntry.isPending}
      />

      <BottomNav />
    </div>
  );
};

export default Home;