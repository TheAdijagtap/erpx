-- Add logo and signature columns to profiles table for business branding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS signature TEXT;