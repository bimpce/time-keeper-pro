import { TimeEntry } from "@/hooks/useTimeEntries";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TimelineProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
}

interface EntryPair {
  arrival: TimeEntry | null;
  departure: TimeEntry | null;
  duration: string;
}

// Format time to HH:MM:SS
const formatTime = (time: string) => time.slice(0, 8);

// Calculate duration between two times
const calculateDuration = (arrival: string, departure: string): string => {
  const [arrH, arrM, arrS] = arrival.split(":").map(Number);
  const [depH, depM, depS] = departure.split(":").map(Number);
  
  const arrSeconds = arrH * 3600 + arrM * 60 + (arrS || 0);
  const depSeconds = depH * 3600 + depM * 60 + (depS || 0);
  
  let diffSeconds = depSeconds - arrSeconds;
  if (diffSeconds < 0) diffSeconds = 0;
  
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;
  
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Pair arrivals with departures
const pairEntries = (entries: TimeEntry[]): EntryPair[] => {
  const sorted = [...entries].sort((a, b) => a.entry_time.localeCompare(b.entry_time));
  const pairs: EntryPair[] = [];
  
  let currentArrival: TimeEntry | null = null;
  
  for (const entry of sorted) {
    if (entry.entry_type === "arrival") {
      if (currentArrival) {
        // Previous arrival without departure
        pairs.push({ arrival: currentArrival, departure: null, duration: "" });
      }
      currentArrival = entry;
    } else {
      // Departure
      if (currentArrival) {
        const duration = calculateDuration(currentArrival.entry_time, entry.entry_time);
        pairs.push({ arrival: currentArrival, departure: entry, duration });
        currentArrival = null;
      } else {
        // Departure without arrival
        pairs.push({ arrival: null, departure: entry, duration: "" });
      }
    }
  }
  
  // Add remaining arrival without departure
  if (currentArrival) {
    pairs.push({ arrival: currentArrival, departure: null, duration: "" });
  }
  
  return pairs;
};

export function Timeline({ entries, onEdit, onDelete }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Ni vnosov za ta dan</p>
        <p className="text-sm mt-1">Dodajte svoj prvi vnos</p>
      </div>
    );
  }

  const pairs = pairEntries(entries);

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-foreground">Prihod</TableHead>
            <TableHead className="font-semibold text-foreground">Odhod</TableHead>
            <TableHead className="font-semibold text-foreground">Čas</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pairs.map((pair, index) => (
            <TableRow key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <TableCell className="font-mono text-arrival font-medium">
                {pair.arrival ? formatTime(pair.arrival.entry_time) : "—"}
              </TableCell>
              <TableCell className="font-mono text-departure font-medium">
                {pair.departure ? formatTime(pair.departure.entry_time) : "—"}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {pair.duration || "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 justify-end">
                  {pair.arrival && onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(pair.arrival!)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Uredi prihod"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {pair.departure && onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(pair.departure!)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Uredi odhod"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {pair.arrival && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(pair.arrival!.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Izbriši prihod"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  {pair.departure && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(pair.departure!.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Izbriši odhod"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}