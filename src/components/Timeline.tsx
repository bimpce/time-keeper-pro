import { TimeEntry } from "@/hooks/useTimeEntries";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";

interface TimelineProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onUpdate?: (id: string, newTime: string) => void;
  onDelete?: (id: string) => void;
}

// Format time to HH:MM:SS
const formatTime = (time: string) => time.slice(0, 8);

// Validate time format HH:MM:SS
const isValidTime = (time: string): boolean => {
  const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
  return regex.test(time);
};

// Normalize time to HH:MM:SS format
const normalizeTime = (time: string): string | null => {
  const parts = time.split(":");
  if (parts.length !== 3) return null;
  
  const [h, m, s] = parts.map((p) => parseInt(p, 10));
  if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return null;
  
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

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

interface EditableCellProps {
  entry: TimeEntry | undefined;
  onUpdate?: (id: string, newTime: string) => void;
}

function EditableCell({ entry, onUpdate }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(entry ? formatTime(entry.entry_time) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(entry ? formatTime(entry.entry_time) : "");
  }, [entry]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (!entry || !onUpdate) return;
    
    const normalized = normalizeTime(value);
    if (normalized && normalized !== formatTime(entry.entry_time)) {
      onUpdate(entry.id, normalized);
    } else {
      setValue(formatTime(entry.entry_time));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(entry ? formatTime(entry.entry_time) : "");
    }
  };

  const handleClick = () => {
    if (entry && onUpdate) {
      setIsEditing(true);
    }
  };

  return (
    <div className="px-1 py-0.5 border-b border-border last:border-b-0">
      <Input
        ref={inputRef}
        readOnly={!isEditing}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`h-8 font-mono text-sm border-border bg-background ${
          isEditing 
            ? "ring-2 ring-primary" 
            : "cursor-pointer hover:bg-accent/50"
        } ${entry ? "text-foreground" : "text-transparent"}`}
        placeholder=""
      />
    </div>
  );
}

export function Timeline({ entries, onUpdate }: TimelineProps) {
  const { arrivals, departures, maxRows } = separateEntries(entries);

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
            {Array.from({ length: maxRows }).map((_, index) => (
              <EditableCell
                key={`arrival-${index}`}
                entry={arrivals[index]}
                onUpdate={onUpdate}
              />
            ))}
          </div>
          {/* Do (Departures) column */}
          <div>
            {Array.from({ length: maxRows }).map((_, index) => (
              <EditableCell
                key={`departure-${index}`}
                entry={departures[index]}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
