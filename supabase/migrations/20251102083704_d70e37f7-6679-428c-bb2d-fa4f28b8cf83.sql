-- Align goods receipts schema with app needs
-- Add missing status and totals to goods_receipts
ALTER TABLE public.goods_receipts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'QUALITY_CHECK',
  ADD COLUMN IF NOT EXISTS subtotal numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total numeric NOT NULL DEFAULT 0;

-- Add unit_price and amount to goods_receipt_items
ALTER TABLE public.goods_receipt_items
  ADD COLUMN IF NOT EXISTS unit_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount numeric NOT NULL DEFAULT 0;
