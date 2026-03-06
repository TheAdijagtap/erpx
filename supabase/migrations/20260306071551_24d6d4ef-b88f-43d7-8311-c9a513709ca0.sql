
-- Locations table for stock transfer
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own locations" ON public.locations FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own locations" ON public.locations FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own locations" ON public.locations FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own locations" ON public.locations FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- Stock transfers table
CREATE TABLE public.stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transfer_number text NOT NULL,
  from_location_id uuid REFERENCES public.locations(id),
  to_location_id uuid REFERENCES public.locations(id),
  status text NOT NULL DEFAULT 'COMPLETED',
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stock transfers" ON public.stock_transfers FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own stock transfers" ON public.stock_transfers FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own stock transfers" ON public.stock_transfers FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own stock transfers" ON public.stock_transfers FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- Stock transfer items
CREATE TABLE public.stock_transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_transfer_id uuid NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.inventory_items(id),
  item_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL DEFAULT 'pcs'
);

ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transfer items" ON public.stock_transfer_items FOR SELECT USING (EXISTS (SELECT 1 FROM stock_transfers WHERE stock_transfers.id = stock_transfer_items.stock_transfer_id AND stock_transfers.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own transfer items" ON public.stock_transfer_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM stock_transfers WHERE stock_transfers.id = stock_transfer_items.stock_transfer_id AND stock_transfers.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own transfer items" ON public.stock_transfer_items FOR DELETE USING (EXISTS (SELECT 1 FROM stock_transfers WHERE stock_transfers.id = stock_transfer_items.stock_transfer_id AND stock_transfers.user_id = get_data_owner_id(auth.uid())));

-- BOM (Bill of Materials) table
CREATE TABLE public.bom (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_name text NOT NULL,
  product_description text,
  unit text NOT NULL DEFAULT 'pcs',
  quantity numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bom ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own BOMs" ON public.bom FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own BOMs" ON public.bom FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own BOMs" ON public.bom FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own BOMs" ON public.bom FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- BOM items (raw materials)
CREATE TABLE public.bom_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id uuid NOT NULL REFERENCES public.bom(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.inventory_items(id),
  item_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL DEFAULT 'pcs',
  unit_price numeric DEFAULT 0
);

ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own BOM items" ON public.bom_items FOR SELECT USING (EXISTS (SELECT 1 FROM bom WHERE bom.id = bom_items.bom_id AND bom.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own BOM items" ON public.bom_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bom WHERE bom.id = bom_items.bom_id AND bom.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can update their own BOM items" ON public.bom_items FOR UPDATE USING (EXISTS (SELECT 1 FROM bom WHERE bom.id = bom_items.bom_id AND bom.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own BOM items" ON public.bom_items FOR DELETE USING (EXISTS (SELECT 1 FROM bom WHERE bom.id = bom_items.bom_id AND bom.user_id = get_data_owner_id(auth.uid())));
