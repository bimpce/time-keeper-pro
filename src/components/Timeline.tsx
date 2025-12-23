import { TimeEntry } from "@/hooks/useTimeEntries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";

interface TimelineProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
}

export function Timeline({ entries, onEdit, onDelete }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Ni vnosov za ta dan</p>
        <p className="text-sm mt-1">Dodajte svoj prvi vnos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <Card key={entry.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    entry.entry_type === "arrival"
                      ? "bg-arrival/10 text-arrival"
                      : "bg-departure/10 text-departure"
                  }`}
                >
                  {entry.entry_type === "arrival" ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {entry.entry_type === "arrival" ? "Prihod" : "Odhod"}
                  </p>
                  <p className="text-2xl font-mono font-semibold time-display">
                    {entry.entry_time.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(entry)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(entry.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}