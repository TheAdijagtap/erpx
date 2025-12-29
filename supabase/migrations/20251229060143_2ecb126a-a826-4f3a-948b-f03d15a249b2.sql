-- Create a function to get database size statistics
CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'database_size_bytes', pg_database_size(current_database()),
    'database_size_mb', round((pg_database_size(current_database()) / 1024.0 / 1024.0)::numeric, 2)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users (admin check will be done in code)
GRANT EXECUTE ON FUNCTION public.get_database_size() TO authenticated;