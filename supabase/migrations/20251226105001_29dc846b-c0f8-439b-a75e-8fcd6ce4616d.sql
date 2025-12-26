-- Add payment_terms column to purchase_orders table
ALTER TABLE public.purchase_orders ADD COLUMN payment_terms TEXT;