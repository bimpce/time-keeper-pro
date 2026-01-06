import { TimeEntry } from "@/hooks/useTimeEntries";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimelineProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
}

// Format time to HH:MM:SS
const formatTime = (time: string) => time.slice(0, 8);

// Separate arrivals and departures into parallel columns
const separateEntries = (entries: TimeEntry[]) => {
  const arrivals = entries
    .filter((e) => e.entry_type === "arrival")
    .sort((a, b) => a.entry_time.localeCompare(b.entry_time));
  const departures = entries
    .filter((e) => e.entry_type === "departure")
    .sort((a, b) => a.entry_time.localeCompare(b.entry_time));
  
  const maxRows = Math.max(arrivals.length, departures.length, 10);
  
  return { arrivals, departures, maxRows };
};

export function Timeline({ entries, onEdit }: TimelineProps) {
  const { arrivals, departures, maxRows } = separateEntries(entries);

  const handleEntryClick = (entry: TimeEntry) => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="grid grid-cols-2">
        <div className="border-r border-border px-3 py-2 font-semibold text-foreground bg-muted/50">
          Od
        </div>
        <div className="px-3 py-2 font-semibold text-foreground bg-muted/50">
          Do
        </div>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-2">
          {/* Od (Arrivals) column */}
          <div className="border-r border-border">
            {Array.from({ length: maxRows }).map((_, index) => {
              const entry = arrivals[index];
              return (
                <div
                  key={`arrival-${index}`}
                  className="px-1 py-0.5 border-b border-border last:border-b-0"
                >
                  <Input
                    readOnly
                    value={entry ? formatTime(entry.entry_time) : ""}
                    onClick={() => entry && handleEntryClick(entry)}
                    className={`h-8 font-mono text-sm border-border bg-background cursor-pointer hover:bg-accent/50 focus:ring-1 focus:ring-primary ${
                      entry ? "text-foreground" : "text-transparent"
                    }`}
                    placeholder=""
                  />
                </div>
              );
            })}
          </div>
          {/* Do (Departures) column */}
          <div>
            {Array.from({ length: maxRows }).map((_, index) => {
              const entry = departures[index];
              return (
                <div
                  key={`departure-${index}`}
                  className="px-1 py-0.5 border-b border-border last:border-b-0"
                >
                  <Input
                    readOnly
                    value={entry ? formatTime(entry.entry_time) : ""}
                    onClick={() => entry && handleEntryClick(entry)}
                    className={`h-8 font-mono text-sm border-border bg-background cursor-pointer hover:bg-accent/50 focus:ring-1 focus:ring-primary ${
                      entry ? "text-foreground" : "text-transparent"
                    }`}
                    placeholder=""
                  />
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}