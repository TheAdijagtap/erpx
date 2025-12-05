-- Add trial_start_date column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing users to start their trial from now
UPDATE public.profiles SET trial_start_date = now() WHERE trial_start_date IS NULL;