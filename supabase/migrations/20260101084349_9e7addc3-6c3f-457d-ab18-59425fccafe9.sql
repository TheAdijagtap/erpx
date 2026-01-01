-- Add batch_number column to inventory_transactions table
ALTER TABLE public.inventory_transactions
ADD COLUMN batch_number text;