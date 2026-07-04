import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VacationSettings {
  id: string;
  user_id: string;
  tracking_enabled: boolean;
  current_year: number;
  carryover_days: number;
  annual_quota_days: number;
}

export interface UpsertVacationSettings {
  tracking_enabled: boolean;
  current_year: number;
  carryover_days: number;
  annual_quota_days: number;
}

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
};

export function useVacationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["vacation_settings"],
    queryFn: async () => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("vacation_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as VacationSettings | null;
    },
  });

  const upsert = useMutation({
    mutationFn: async (values: UpsertVacationSettings) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("vacation_settings")
        .upsert(
          {
            user_id: userId,
            tracking_enabled: values.tracking_enabled,
            current_year: values.current_year,
            carryover_days: values.carryover_days,
            annual_quota_days: values.annual_quota_days,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacation_settings"] });
      toast({ title: "Nastavitve dopusta shranjene" });
    },
    onError: (error) => {
      toast({ title: "Napaka", description: error.message, variant: "destructive" });
    },
  });

  return {
    settings: query.data ?? null,
    isLoading: query.isLoading,
    upsert,
  };
}
