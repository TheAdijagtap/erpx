-- Add HSN code column to proforma_products table
ALTER TABLE public.proforma_products 
ADD COLUMN hsn_code TEXT;