-- Add subscription_end_date column to profiles
ALTER TABLE public.profiles ADD COLUMN subscription_end_date timestamp with time zone DEFAULT NULL;

-- Set subscription for info@gdlights.co user (28 days from now)
UPDATE public.profiles 
SET subscription_end_date = now() + interval '28 days'
WHERE email = 'info@gdlights.co';