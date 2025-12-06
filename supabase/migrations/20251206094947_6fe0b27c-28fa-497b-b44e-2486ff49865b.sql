-- Fix function search path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Add admin role to necrus@yahoo.com user
SELECT public.add_admin_by_email('necrus@yahoo.com');