-- Add hsn_code column to purchase_order_items table
ALTER TABLE public.purchase_order_items 
ADD COLUMN hsn_code text;