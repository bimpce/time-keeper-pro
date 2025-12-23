import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EntryType } from "@/hooks/useTimeEntries";

interface TimeEntryFormProps {
  onSubmit: (data: { entry_type: EntryType; entry_time: string; entry_date: string }) => void;
  isLoading?: boolean;
  defaultDate?: string;
}

export function TimeEntryForm({ onSubmit, isLoading, defaultDate }: TimeEntryFormProps) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [entryType, setEntryType] = useState<EntryType>("arrival");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("00");
  const [date, setDate] = useState(defaultDate || today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !minutes) return;

    const entry_time = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    onSubmit({ entry_type: entryType, entry_time, entry_date: date });
    
    // Reset form
    setHours("");
    setMinutes("");
    setSeconds("00");
    setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full gap-2">
          <Plus className="h-5 w-5" />
          Dodaj vnos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nov časovni vnos</DialogTitle>
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
                <RadioGroupItem value="arrival" id="arrival" />
                <Label htmlFor="arrival" className="text-arrival font-medium cursor-pointer">
                  Prihod
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="departure" id="departure" />
                <Label htmlFor="departure" className="text-departure font-medium cursor-pointer">
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
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Shranjevanje..." : "Shrani"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}