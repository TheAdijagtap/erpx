-- Add contact_person and customer_phone columns to proforma_invoices
ALTER TABLE public.proforma_invoices
ADD COLUMN IF NOT EXISTS contact_person text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_email text;