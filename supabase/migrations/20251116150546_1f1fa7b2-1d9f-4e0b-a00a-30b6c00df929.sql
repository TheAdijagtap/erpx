-- Add company name and email fields to passkeys table
ALTER TABLE public.passkeys
ADD COLUMN company_name TEXT,
ADD COLUMN email TEXT;