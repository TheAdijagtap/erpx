-- Set REPLICA IDENTITY FULL so DELETE events include all columns for realtime filtering
ALTER TABLE public.inventory_items REPLICA IDENTITY FULL;
ALTER TABLE public.suppliers REPLICA IDENTITY FULL;
ALTER TABLE public.purchase_orders REPLICA IDENTITY FULL;
ALTER TABLE public.goods_receipts REPLICA IDENTITY FULL;
ALTER TABLE public.proforma_invoices REPLICA IDENTITY FULL;
ALTER TABLE public.proforma_products REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.inventory_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.scrap_notes REPLICA IDENTITY FULL;