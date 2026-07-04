import { useMemo, useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Palmtree } from "lucide-react";
import { useVacationSettings } from "@/hooks/useVacationSettings";
import { useAbsences } from "@/hooks/useAbsences";
import { computeVacationBalance } from "@/lib/vacationCalculations";
import { VacationSummary } from "@/components/VacationSummary";

const Vacation = () => {
  const { settings, isLoading, upsert } = useVacationSettings();
  const { absences } = useAbsences();

  const currentYear = new Date().getFullYear();

  const [enabled, setEnabled] = useState(false);
  const [year, setYear] = useState(currentYear);
  const [carryover, setCarryover] = useState<string>("0");
  const [quota, setQuota] = useState<string>("25");

  useEffect(() => {
    if (settings) {
      setEnabled(settings.tracking_enabled);
      setYear(settings.current_year);
      setCarryover(String(settings.carryover_days));
      setQuota(String(settings.annual_quota_days));
    }
  }, [settings]);

  const balance = useMemo(() => {
    if (!settings?.tracking_enabled) return null;
    return computeVacationBalance(
      absences,
      settings.current_year,
      Number(settings.carryover_days),
      Number(settings.annual_quota_days)
    );
  }, [absences, settings]);

  const handleSave = () => {
    upsert.mutate({
      tracking_enabled: enabled,
      current_year: Number(year) || currentYear,
      carryover_days: Number(carryover) || 0,
      annual_quota_days: Number(quota) || 0,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Palmtree className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dopust</h1>
            <p className="text-sm text-muted-foreground">Spremljanje porabe dopusta</p>
          </div>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            {settings?.tracking_enabled && balance && (
              <VacationSummary year={settings.current_year} balance={balance} />
            )}

            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vac-enabled" className="text-base">Spremljanje dopusta</Label>
                    <p className="text-xs text-muted-foreground">Omogoči prikaz porabe in kvot dopusta</p>
                  </div>
                  <Switch id="vac-enabled" checked={enabled} onCheckedChange={setEnabled} />
                </div>

                {enabled && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="vac-year">Tekoče leto</Label>
                      <Input
                        id="vac-year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="vac-carry">Preneseni dopust iz preteklega leta (dni)</Label>
                      <Input
                        id="vac-carry"
                        type="number"
                        step="0.5"
                        min="0"
                        value={carryover}
                        onChange={(e) => setCarryover(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Preneseni dopust se porabi prvi.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="vac-quota">Letna kvota za {year} (dni)</Label>
                      <Input
                        id="vac-quota"
                        type="number"
                        step="0.5"
                        min="0"
                        value={quota}
                        onChange={(e) => setQuota(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Button onClick={handleSave} disabled={upsert.isPending} className="w-full">
                  Shrani nastavitve
                </Button>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground text-center">
              Porabljeni dnevi se štejejo iz vnosov odsotnosti tipa »Dopust« (samo delovni dnevi, brez praznikov).
            </p>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Vacation;
