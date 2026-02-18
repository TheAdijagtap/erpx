-- Enable realtime for all main tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_order_additional_charges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goods_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goods_receipt_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goods_receipt_additional_charges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proforma_invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proforma_invoice_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proforma_invoice_additional_charges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proforma_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scrap_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scrap_note_items;