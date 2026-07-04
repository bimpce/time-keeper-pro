
CREATE TABLE public.vacation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tracking_enabled boolean NOT NULL DEFAULT false,
  current_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
  carryover_days numeric(5,1) NOT NULL DEFAULT 0,
  annual_quota_days numeric(5,1) NOT NULL DEFAULT 25,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vacation_settings TO authenticated;
GRANT ALL ON public.vacation_settings TO service_role;

ALTER TABLE public.vacation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vacation settings" ON public.vacation_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vacation settings" ON public.vacation_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vacation settings" ON public.vacation_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own vacation settings" ON public.vacation_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_vacation_settings_updated_at
  BEFORE UPDATE ON public.vacation_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
