import { DailySummary, formatMinutesToTime } from "@/lib/timeCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coffee, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface DaySummaryCardProps {
  summary: DailySummary;
}

export function DaySummaryCard({ summary }: DaySummaryCardProps) {
  const { workMinutes, breakMinutes, overtimeMinutes, isComplete } = summary;

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
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-mono font-bold time-display">{formatMinutesToTime(workMinutes)}</p>
            <p className="text-xs text-muted-foreground">Delo</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-muted flex items-center justify-center mb-2">
              <Coffee className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-2xl font-mono font-bold time-display">{formatMinutesToTime(breakMinutes)}</p>
            <p className="text-xs text-muted-foreground">Odmor</p>
          </div>
          <div className="text-center">
            <div className={`h-12 w-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
              overtimeMinutes > 0 ? "bg-warning/10" : "bg-muted"
            }`}>
              <TrendingUp className={`h-6 w-6 ${overtimeMinutes > 0 ? "text-warning" : "text-muted-foreground"}`} />
            </div>
            <p className={`text-2xl font-mono font-bold time-display ${overtimeMinutes > 0 ? "text-warning" : ""}`}>
              {overtimeMinutes > 0 ? "+" : ""}{formatMinutesToTime(overtimeMinutes)}
            </p>
            <p className="text-xs text-muted-foreground">Nadure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}