-- Add optional specification columns to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN item_code text,
ADD COLUMN make text,
ADD COLUMN mpn text;