-- Add batch_number column to goods_receipt_items table
ALTER TABLE public.goods_receipt_items 
ADD COLUMN batch_number text;