import { DailySummary, formatSecondsToTime } from "@/lib/timeCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coffee, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface DaySummaryCardProps {
  summary: DailySummary;
}

export function DaySummaryCard({ summary }: DaySummaryCardProps) {
  const { workSeconds, breakSeconds, actualBreakSeconds, unusedBreakSeconds, overtimeSeconds, isComplete } = summary;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-mono font-bold time-display">{formatSecondsToTime(workSeconds)}</p>
            <p className="text-xs text-muted-foreground">Delo</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-muted flex items-center justify-center mb-2">
              <Coffee className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-2xl font-mono font-bold time-display">{formatSecondsToTime(breakSeconds)}</p>
            <p className="text-xs text-muted-foreground">Odmor</p>
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
        
        {/* Break usage details */}
        {summary.entries.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Poraba odmora:</span>
              </div>
              <div className="flex gap-4 font-mono text-sm">
                <span>
                  <span className="text-muted-foreground mr-1">Dejanski:</span>
                  <span className="font-medium">{formatSecondsToTime(actualBreakSeconds)}</span>
                </span>
                <span>
                  <span className="text-muted-foreground mr-1">Preostalo:</span>
                  <span className={`font-medium ${unusedBreakSeconds > 0 ? "text-success" : ""}`}>
                    {formatSecondsToTime(unusedBreakSeconds)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}