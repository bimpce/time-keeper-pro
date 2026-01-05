-- First, drop all policies that depend on is_dev_user function

-- Drop time_entries policies
DROP POLICY IF EXISTS "Users can create their own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view their own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.time_entries;

-- Drop absences policies
DROP POLICY IF EXISTS "Users can create their own absences" ON public.absences;
DROP POLICY IF EXISTS "Users can view their own absences" ON public.absences;
DROP POLICY IF EXISTS "Users can update their own absences" ON public.absences;
DROP POLICY IF EXISTS "Users can delete their own absences" ON public.absences;

-- Now drop the is_dev_user function
DROP FUNCTION IF EXISTS public.is_dev_user(uuid);

-- Recreate time_entries RLS policies (secure - owner only)
CREATE POLICY "Users can create their own entries" 
ON public.time_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own entries" 
ON public.time_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.time_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.time_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Recreate absences RLS policies (secure - owner only)
CREATE POLICY "Users can create their own absences" 
ON public.absences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own absences" 
ON public.absences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own absences" 
ON public.absences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own absences" 
ON public.absences 
FOR DELETE 
USING (auth.uid() = user_id);