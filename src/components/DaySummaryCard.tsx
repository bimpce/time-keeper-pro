import { DailySummary, formatSecondsToTime } from "@/lib/timeCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coffee, TrendingUp, CheckCircle, AlertCircle, Timer, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DaySummaryCardProps {
  summary: DailySummary;
}

export function DaySummaryCard({ summary }: DaySummaryCardProps) {
  const { workSeconds, grossSeconds, breakSeconds, actualBreakSeconds, unusedBreakSeconds, exceededBreakSeconds, overtimeSeconds, isComplete } = summary;

  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center justify-between">
          <span>Povzetek dneva</span>
          {summary.entries.length > 0 && (
            <span className={`text-sm font-normal flex items-center gap-1 ${isComplete ? "text-success" : "text-warning"}`}>
              {isComplete ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Zaključeno
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  V teku
                </>
              )}
            </span>
          )}
        </h2>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-mono font-bold time-display">{formatSecondsToTime(workSeconds)}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    Neto delo
                    <Info className="h-3 w-3" />
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Dejanski čas dela brez odmorov. Seštevek vseh obdobij med prihodom in odhodom.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="h-12 w-12 mx-auto rounded-xl bg-muted flex items-center justify-center mb-2">
                    <Timer className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-mono font-bold time-display">{formatSecondsToTime(grossSeconds)}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    Bruto čas
                    <Info className="h-3 w-3" />
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Celoten čas od prvega prihoda do zadnjega odhoda, vključno z odmori.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className={`h-12 w-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
              exceededBreakSeconds > 0 ? "bg-destructive/10" : "bg-muted"
            }`}>
              <Coffee className={`h-6 w-6 ${exceededBreakSeconds > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <p className="text-lg font-mono font-bold time-display">
              {formatSecondsToTime(actualBreakSeconds)}
              {exceededBreakSeconds > 0 && (
                <span className="text-destructive"> (+{formatSecondsToTime(exceededBreakSeconds)})</span>
              )}
              {unusedBreakSeconds > 0 && (
                <span className="text-success"> (-{formatSecondsToTime(unusedBreakSeconds)})</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Poraba odmora {exceededBreakSeconds > 0 ? "(prekoračeno)" : unusedBreakSeconds > 0 ? "(preostanek)" : ""}
            </p>
          </div>
          <div className="text-center">
            <div className={`h-12 w-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
              overtimeSeconds > 0 ? "bg-warning/10" : "bg-muted"
            }`}>
              <TrendingUp className={`h-6 w-6 ${overtimeSeconds > 0 ? "text-warning" : "text-muted-foreground"}`} />
            </div>
            <p className={`text-2xl font-mono font-bold time-display ${overtimeSeconds > 0 ? "text-warning" : ""}`}>
              {overtimeSeconds > 0 ? "+" : ""}{formatSecondsToTime(overtimeSeconds)}
            </p>
            <p className="text-xs text-muted-foreground">Nadure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}