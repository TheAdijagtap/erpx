
-- Add default terms & conditions columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_po_terms text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_pi_terms text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_gr_terms text;
