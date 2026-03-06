
-- Drop existing foreign keys and recreate with ON DELETE SET NULL
ALTER TABLE public.stock_transfer_items DROP CONSTRAINT IF EXISTS stock_transfer_items_item_id_fkey;
ALTER TABLE public.stock_transfer_items ADD CONSTRAINT stock_transfer_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;

ALTER TABLE public.bom_items DROP CONSTRAINT IF EXISTS bom_items_item_id_fkey;
ALTER TABLE public.bom_items ADD CONSTRAINT bom_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_item_id_fkey;
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;

ALTER TABLE public.goods_receipt_items DROP CONSTRAINT IF EXISTS goods_receipt_items_item_id_fkey;
ALTER TABLE public.goods_receipt_items ADD CONSTRAINT goods_receipt_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;

ALTER TABLE public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_item_id_fkey;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;

ALTER TABLE public.item_price_history DROP CONSTRAINT IF EXISTS item_price_history_item_id_fkey;
ALTER TABLE public.item_price_history ADD CONSTRAINT item_price_history_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;
