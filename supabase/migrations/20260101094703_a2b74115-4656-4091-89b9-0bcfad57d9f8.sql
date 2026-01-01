-- Add qc_date column to goods_receipts table
ALTER TABLE public.goods_receipts 
ADD COLUMN qc_date date NULL;