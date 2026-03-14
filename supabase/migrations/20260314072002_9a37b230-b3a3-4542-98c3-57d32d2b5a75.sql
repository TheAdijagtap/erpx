
-- Add missing UPDATE policies for stock_transfer_items
CREATE POLICY "Users can update their own transfer items"
ON public.stock_transfer_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM stock_transfers
    WHERE stock_transfers.id = stock_transfer_items.stock_transfer_id
    AND stock_transfers.user_id = get_data_owner_id(auth.uid())
  )
);

-- Add missing UPDATE policy for proforma_invoice_additional_charges
CREATE POLICY "Users can update their own PI additional charges"
ON public.proforma_invoice_additional_charges
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM proforma_invoices
    WHERE proforma_invoices.id = proforma_invoice_additional_charges.proforma_invoice_id
    AND proforma_invoices.user_id = get_data_owner_id(auth.uid())
  )
);

-- Add missing UPDATE policy for goods_receipt_additional_charges
CREATE POLICY "Users can update their own GR additional charges"
ON public.goods_receipt_additional_charges
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM goods_receipts
    WHERE goods_receipts.id = goods_receipt_additional_charges.goods_receipt_id
    AND goods_receipts.user_id = get_data_owner_id(auth.uid())
  )
);
