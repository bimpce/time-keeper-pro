import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TimeEntry, EntryType } from "@/hooks/useTimeEntries";

interface EditEntryDialogProps {
  entry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { id: string; entry_type?: EntryType; entry_time?: string; entry_date?: string }) => void;
  isLoading?: boolean;
}

export function EditEntryDialog({ entry, open, onOpenChange, onSubmit, isLoading }: EditEntryDialogProps) {
  const [entryType, setEntryType] = useState<EntryType>("arrival");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [date, setDate] = useState("");

  // Populate form when entry changes or dialog opens
  useEffect(() => {
    if (entry && open) {
      const [h, m, s] = entry.entry_time.split(":");
      setHours(h || "");
      setMinutes(m || "");
      setSeconds(s || "00");
      setEntryType(entry.entry_type);
      setDate(entry.entry_date);
    }
  }, [entry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !hours || !minutes) return;

    const entry_time = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    onSubmit({ id: entry.id, entry_type: entryType, entry_time, entry_date: date });
    onOpenChange(false);
  };

  const handleHoursChange = (value: string) => {
    const num = parseInt(value);
    if (value === "" || (num >= 0 && num <= 23)) {
      setHours(value);
    }
  };

  const handleMinutesChange = (value: string) => {
    const num = parseInt(value);
    if (value === "" || (num >= 0 && num <= 59)) {
      setMinutes(value);
    }
  };

  const handleSecondsChange = (value: string) => {
    const num = parseInt(value);
    if (value === "" || (num >= 0 && num <= 59)) {
      setSeconds(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Uredi vnos</DialogTitle>
          <DialogDescription>Spremenite podatke časovnega vnosa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Vrsta vnosa</Label>
            <RadioGroup
              value={entryType}
              onValueChange={(value) => setEntryType(value as EntryType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arrival" id="edit-arrival" />
                <Label htmlFor="edit-arrival" className="text-arrival font-medium cursor-pointer">
                  Prihod
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="departure" id="edit-departure" />
                <Label htmlFor="edit-departure" className="text-departure font-medium cursor-pointer">
                  Odhod
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Čas (HH:MM:SS)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="UU"
                value={hours}
                onChange={(e) => handleHoursChange(e.target.value)}
                className="text-center font-mono text-lg"
                min={0}
                max={23}
                required
              />
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <Input
                type="number"
                placeholder="MM"
                value={minutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                className="text-center font-mono text-lg"
                min={0}
                max={59}
                required
              />
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <Input
                type="number"
                placeholder="SS"
                value={seconds}
                onChange={(e) => handleSecondsChange(e.target.value)}
                className="text-center font-mono text-lg"
                min={0}
                max={59}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="edit-date">Datum</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Shranjevanje..." : "Shrani spremembe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}