import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Palmtree, Archive, CalendarDays } from "lucide-react";
import type { VacationBalance } from "@/lib/vacationCalculations";

interface Props {
  year: number;
  balance: VacationBalance;
  compact?: boolean;
}

export function VacationSummary({ year, balance, compact }: Props) {
  const total = balance.totalAvailable;
  const pct = total > 0 ? Math.min(100, (balance.used / total) * 100) : 0;

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palmtree className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Dopust {year}</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {balance.used} / {total} dni
          </span>
        </div>

        <Progress value={pct} />

        <div className={compact ? "grid grid-cols-3 gap-2 text-center" : "grid grid-cols-3 gap-3 text-center"}>
          <div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Archive className="h-3 w-3" /> Preneseni
            </div>
            <p className="text-lg font-bold">{balance.remainingCarryover}</p>
            <p className="text-[10px] text-muted-foreground">od {balance.carryover}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> Tekoče leto
            </div>
            <p className="text-lg font-bold">{balance.remainingAnnual}</p>
            <p className="text-[10px] text-muted-foreground">od {balance.annualQuota}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Palmtree className="h-3 w-3" /> Preostalo
            </div>
            <p className="text-lg font-bold text-primary">{balance.remainingTotal}</p>
            <p className="text-[10px] text-muted-foreground">dni skupaj</p>
          </div>
        </div>

        {balance.carryover > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Porabljenih iz prenesenega: <strong>{balance.usedFromCarryover}</strong> ·
            iz tekočega: <strong>{balance.usedFromAnnual}</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
