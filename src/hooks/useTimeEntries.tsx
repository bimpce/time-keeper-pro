import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { timeEntrySchema, updateTimeEntrySchema } from "@/lib/validation";


export type EntryType = "arrival" | "departure";

export interface TimeEntry {
  id: string;
  user_id: string;
  entry_date: string;
  entry_type: EntryType;
  entry_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryData {
  entry_date: string;
  entry_type: EntryType;
  entry_time: string;
}

export interface UpdateEntryData {
  id: string;
  entry_type?: EntryType;
  entry_time?: string;
  entry_date?: string;
}

// Helper to get authenticated user ID
const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
};

export function useTimeEntries(date?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: ["time-entries", date],
    queryFn: async () => {
      const userId = await getUserId();
      
      let query = supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: false })
        .order("entry_time", { ascending: true });

      if (date) {
        query = query.eq("entry_date", date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TimeEntry[];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (data: CreateEntryData) => {
      const parsed = timeEntrySchema.parse(data);
      const userId = await getUserId();


      const { data: entry, error } = await supabase
        .from("time_entries")
        .insert({
          user_id: userId,
          entry_date: parsed.entry_date,
          entry_type: parsed.entry_type,
          entry_time: parsed.entry_time,
        })
        .select()
        .single();


      if (error) throw error;
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({
        title: "Vnos dodan",
        description: "Časovni vnos je bil uspešno shranjen.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Napaka",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async (data: UpdateEntryData) => {
      const { id, ...updates } = data;
      const { data: entry, error } = await supabase
        .from("time_entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({
        title: "Vnos posodobljen",
        description: "Časovni vnos je bil uspešno posodobljen.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Napaka",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({
        title: "Vnos izbrisan",
        description: "Časovni vnos je bil uspešno izbrisan.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Napaka",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    entries: entriesQuery.data ?? [],
    isLoading: entriesQuery.isLoading,
    error: entriesQuery.error,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}