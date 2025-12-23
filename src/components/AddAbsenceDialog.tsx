import { useState } from "react";
import { format } from "date-fns";
import { sl } from "date-fns/locale";
import { CalendarIcon, Briefcase, Palmtree, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AbsenceType } from "@/hooks/useAbsences";

interface AddAbsenceDialogProps {
  onSubmit: (data: {
    absence_type: AbsenceType;
    start_date: string;
    end_date: string;
    note?: string;
  }) => void;
  isLoading: boolean;
  defaultDate?: string;
}

const absenceTypes: { value: AbsenceType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "sick_leave", label: "Bolniška", icon: <Thermometer className="h-5 w-5" />, color: "bg-orange-500/20 text-orange-600 border-orange-500/30" },
  { value: "vacation", label: "Dopust", icon: <Palmtree className="h-5 w-5" />, color: "bg-green-500/20 text-green-600 border-green-500/30" },
  { value: "work_from_home", label: "Delo od doma", icon: <Briefcase className="h-5 w-5" />, color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
];

export function AddAbsenceDialog({ onSubmit, isLoading, defaultDate }: AddAbsenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AbsenceType | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: defaultDate ? new Date(defaultDate + "T00:00:00") : undefined,
    to: undefined,
  });

  // Update date range when defaultDate changes
  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && defaultDate) {
      setDateRange({ from: new Date(defaultDate + "T00:00:00"), to: undefined });
    }
  };
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!selectedType || !dateRange.from) return;

    onSubmit({
      absence_type: selectedType,
      start_date: format(dateRange.from, "yyyy-MM-dd"),
      end_date: format(dateRange.to || dateRange.from, "yyyy-MM-dd"),
      note: note || undefined,
    });

    setOpen(false);
    setSelectedType(null);
    setDateRange({ from: undefined, to: undefined });
    setNote("");
  };

  const isValid = selectedType && dateRange.from;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Dodaj odsotnost / delo od doma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj odsotnost</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Absence Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vrsta</label>
            <div className="grid grid-cols-3 gap-2">
              {absenceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    selectedType === type.value
                      ? type.color + " border-current"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {type.icon}
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Datum</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d. MMM", { locale: sl })} -{" "}
                        {format(dateRange.to, "d. MMM yyyy", { locale: sl })}
                      </>
                    ) : (
                      format(dateRange.from, "d. MMMM yyyy", { locale: sl })
                    )
                  ) : (
                    <span>Izberi datum</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={1}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Opomba (neobvezno)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dodaj opombo..."
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Prekliči
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading ? "Shranjujem..." : "Shrani"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
