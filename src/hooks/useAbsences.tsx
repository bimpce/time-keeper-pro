import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AbsenceType = "sick_leave" | "vacation" | "work_from_home";

export interface Absence {
  id: string;
  user_id: string;
  absence_type: AbsenceType;
  start_date: string;
  end_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAbsenceData {
  absence_type: AbsenceType;
  start_date: string;
  end_date: string;
  note?: string;
}

// Helper to get authenticated user ID
const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
};

export function useAbsences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const absencesQuery = useQuery({
    queryKey: ["absences"],
    queryFn: async () => {
      const userId = await getUserId();

      const { data, error } = await supabase
        .from("absences")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as Absence[];
    },
  });

  const createAbsence = useMutation({
    mutationFn: async (absenceData: CreateAbsenceData) => {
      const userId = await getUserId();

      const { data, error } = await supabase
        .from("absences")
        .insert({
          user_id: userId,
          ...absenceData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast({ title: "Odsotnost dodana" });
    },
    onError: (error) => {
      toast({ title: "Napaka", description: error.message, variant: "destructive" });
    },
  });

  const updateAbsence = useMutation({
    mutationFn: async ({ id, ...absenceData }: CreateAbsenceData & { id: string }) => {
      const { data, error } = await supabase
        .from("absences")
        .update(absenceData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast({ title: "Odsotnost posodobljena" });
    },
    onError: (error) => {
      toast({ title: "Napaka", description: error.message, variant: "destructive" });
    },
  });

  const deleteAbsence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("absences").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast({ title: "Odsotnost izbrisana" });
    },
    onError: (error) => {
      toast({ title: "Napaka", description: error.message, variant: "destructive" });
    },
  });

  // Helper to check if a date falls within any absence
  const getAbsenceForDate = (dateStr: string): Absence | undefined => {
    return absencesQuery.data?.find((absence) => {
      return dateStr >= absence.start_date && dateStr <= absence.end_date;
    });
  };

  return {
    absences: absencesQuery.data ?? [],
    isLoading: absencesQuery.isLoading,
    error: absencesQuery.error,
    createAbsence,
    updateAbsence,
    deleteAbsence,
    getAbsenceForDate,
  };
}
