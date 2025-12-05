-- Update the handle_new_user function to include trial_start_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, contact_number, trial_start_date)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'phone', now());
  RETURN NEW;
END;
$$;