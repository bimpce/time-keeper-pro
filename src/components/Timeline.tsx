import { TimeEntry } from "@/hooks/useTimeEntries";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TimelineProps {
  entries: TimeEntry[];
  onUpdate?: (id: string, newTime: string) => void;
  onAdd?: (entryType: "arrival" | "departure", time: string) => void;
  onDelete?: (id: string) => void;
}

// Format time to HH:MM:SS
const formatTime = (time: string) => time.slice(0, 8);

// Validate and normalize time to HH:MM:SS format
const normalizeTime = (time: string): string | null => {
  const parts = time.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parts.length === 3 ? parseInt(parts[2], 10) : 0;
  
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
  
  const maxRows = Math.max(arrivals.length, departures.length, 5) + 1;
  
  return { arrivals, departures, maxRows };
};

interface EditableCellProps {
  entry: TimeEntry | undefined;
  entryType: "arrival" | "departure";
  onUpdate?: (id: string, newTime: string) => void;
  onAdd?: (entryType: "arrival" | "departure", time: string) => void;
  onDelete?: (id: string) => void;
}

function EditableCell({ entry, entryType, onUpdate, onAdd, onDelete }: EditableCellProps) {
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
    
    const normalized = normalizeTime(value);
    
    if (entry && onUpdate) {
      if (normalized && normalized !== formatTime(entry.entry_time)) {
        onUpdate(entry.id, normalized);
      } else {
        setValue(formatTime(entry.entry_time));
      }
    } else if (!entry && onAdd && normalized) {
      onAdd(entryType, normalized);
      setValue("");
    } else {
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(entry ? formatTime(entry.entry_time) : "");
    }
  };

  const handleClick = () => {
    if (onUpdate || onAdd) {
      setIsEditing(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entry && onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <div className="px-1 py-0.5 border-b border-border last:border-b-0 group relative">
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          readOnly={!isEditing}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClick={handleClick}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isEditing ? "HH:MM:SS" : ""}
          className={`h-8 font-mono text-sm border-border bg-background flex-1 ${
            isEditing 
              ? "ring-2 ring-primary" 
              : "cursor-pointer hover:bg-accent/50"
          } ${entry ? "text-foreground" : isEditing ? "text-foreground" : "text-muted-foreground/30"}`}
        />
        {entry && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
            title="Izbriši"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function Timeline({ entries, onUpdate, onAdd, onDelete }: TimelineProps) {
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
                entryType="arrival"
                onUpdate={onUpdate}
                onAdd={onAdd}
                onDelete={onDelete}
              />
            ))}
          </div>
          {/* Do (Departures) column */}
          <div>
            {Array.from({ length: maxRows }).map((_, index) => (
              <EditableCell
                key={`departure-${index}`}
                entry={departures[index]}
                entryType="departure"
                onUpdate={onUpdate}
                onAdd={onAdd}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
