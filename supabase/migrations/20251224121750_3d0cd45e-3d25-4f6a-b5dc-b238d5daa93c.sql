-- Create a function to check if a user_id is the dev user (for dev mode bypass)
CREATE OR REPLACE FUNCTION public.is_dev_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT check_user_id = '19b14a87-979d-4a60-b7ec-5994ce3bfac0'::uuid
$$;

-- Drop existing restrictive policies and recreate as permissive with dev bypass
DROP POLICY IF EXISTS "Users can view their own absences" ON public.absences;
DROP POLICY IF EXISTS "Users can create their own absences" ON public.absences;
DROP POLICY IF EXISTS "Users can update their own absences" ON public.absences;
DROP POLICY IF EXISTS "Users can delete their own absences" ON public.absences;

CREATE POLICY "Users can view their own absences" ON public.absences
FOR SELECT USING (auth.uid() = user_id OR public.is_dev_user(user_id));

CREATE POLICY "Users can create their own absences" ON public.absences
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_dev_user(user_id));

CREATE POLICY "Users can update their own absences" ON public.absences
FOR UPDATE USING (auth.uid() = user_id OR public.is_dev_user(user_id));

CREATE POLICY "Users can delete their own absences" ON public.absences
FOR DELETE USING (auth.uid() = user_id OR public.is_dev_user(user_id));

-- Same for time_entries
DROP POLICY IF EXISTS "Users can view their own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.time_entries;

CREATE POLICY "Users can view their own entries" ON public.time_entries
FOR SELECT USING (auth.uid() = user_id OR public.is_dev_user(user_id));

CREATE POLICY "Users can create their own entries" ON public.time_entries
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_dev_user(user_id));

CREATE POLICY "Users can update their own entries" ON public.time_entries
FOR UPDATE USING (auth.uid() = user_id OR public.is_dev_user(user_id));

CREATE POLICY "Users can delete their own entries" ON public.time_entries
FOR DELETE USING (auth.uid() = user_id OR public.is_dev_user(user_id));