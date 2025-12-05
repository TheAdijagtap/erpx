-- Update the handle_new_user function to include phone number from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, contact_number)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'phone');
  RETURN NEW;
END;
$$;