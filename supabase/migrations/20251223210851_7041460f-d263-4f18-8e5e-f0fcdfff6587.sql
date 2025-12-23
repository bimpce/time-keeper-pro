-- Create enum for absence types
CREATE TYPE public.absence_type AS ENUM ('sick_leave', 'vacation', 'work_from_home');

-- Create absences table
CREATE TABLE public.absences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  absence_type absence_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable Row Level Security
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own absences" 
ON public.absences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own absences" 
ON public.absences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own absences" 
ON public.absences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own absences" 
ON public.absences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_absences_updated_at
BEFORE UPDATE ON public.absences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();