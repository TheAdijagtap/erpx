-- Create additional charges tables for PO, GR, and PI

-- Additional charges for Purchase Orders
CREATE TABLE public.purchase_order_additional_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.purchase_order_additional_charges ENABLE ROW LEVEL SECURITY;

-- RLS policies for PO additional charges
CREATE POLICY "Users can view their own PO additional charges"
ON public.purchase_order_additional_charges
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.purchase_orders
  WHERE purchase_orders.id = purchase_order_additional_charges.purchase_order_id
  AND purchase_orders.user_id = auth.uid()
));

CREATE POLICY "Users can create their own PO additional charges"
ON public.purchase_order_additional_charges
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.purchase_orders
  WHERE purchase_orders.id = purchase_order_additional_charges.purchase_order_id
  AND purchase_orders.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own PO additional charges"
ON public.purchase_order_additional_charges
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.purchase_orders
  WHERE purchase_orders.id = purchase_order_additional_charges.purchase_order_id
  AND purchase_orders.user_id = auth.uid()
));

-- Additional charges for Goods Receipts
CREATE TABLE public.goods_receipt_additional_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.goods_receipt_additional_charges ENABLE ROW LEVEL SECURITY;

-- RLS policies for GR additional charges
CREATE POLICY "Users can view their own GR additional charges"
ON public.goods_receipt_additional_charges
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.goods_receipts
  WHERE goods_receipts.id = goods_receipt_additional_charges.goods_receipt_id
  AND goods_receipts.user_id = auth.uid()
));

CREATE POLICY "Users can create their own GR additional charges"
ON public.goods_receipt_additional_charges
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.goods_receipts
  WHERE goods_receipts.id = goods_receipt_additional_charges.goods_receipt_id
  AND goods_receipts.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own GR additional charges"
ON public.goods_receipt_additional_charges
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.goods_receipts
  WHERE goods_receipts.id = goods_receipt_additional_charges.goods_receipt_id
  AND goods_receipts.user_id = auth.uid()
));

-- Additional charges for Proforma Invoices
CREATE TABLE public.proforma_invoice_additional_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proforma_invoice_id UUID NOT NULL REFERENCES public.proforma_invoices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.proforma_invoice_additional_charges ENABLE ROW LEVEL SECURITY;

-- RLS policies for PI additional charges
CREATE POLICY "Users can view their own PI additional charges"
ON public.proforma_invoice_additional_charges
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.proforma_invoices
  WHERE proforma_invoices.id = proforma_invoice_additional_charges.proforma_invoice_id
  AND proforma_invoices.user_id = auth.uid()
));

CREATE POLICY "Users can create their own PI additional charges"
ON public.proforma_invoice_additional_charges
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.proforma_invoices
  WHERE proforma_invoices.id = proforma_invoice_additional_charges.proforma_invoice_id
  AND proforma_invoices.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own PI additional charges"
ON public.proforma_invoice_additional_charges
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.proforma_invoices
  WHERE proforma_invoices.id = proforma_invoice_additional_charges.proforma_invoice_id
  AND proforma_invoices.user_id = auth.uid()
));