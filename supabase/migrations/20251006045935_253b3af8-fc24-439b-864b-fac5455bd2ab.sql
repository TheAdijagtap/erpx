-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  address TEXT,
  gst_number TEXT,
  contact_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  gst_number TEXT,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suppliers"
  ON public.suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suppliers"
  ON public.suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON public.suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON public.suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL,
  current_stock DECIMAL DEFAULT 0 NOT NULL,
  reorder_level DECIMAL,
  unit_price DECIMAL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  description TEXT,
  hsn_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
  ON public.inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory"
  ON public.inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
  ON public.inventory_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory"
  ON public.inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  gst_number TEXT,
  status TEXT DEFAULT 'active',
  total_proformas INTEGER DEFAULT 0,
  total_value DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id);

-- Create proforma invoices table
CREATE TABLE public.proforma_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_gst TEXT,
  date DATE NOT NULL,
  subtotal DECIMAL NOT NULL,
  tax_amount DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL,
  notes TEXT,
  payment_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own proforma invoices"
  ON public.proforma_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proforma invoices"
  ON public.proforma_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proforma invoices"
  ON public.proforma_invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proforma invoices"
  ON public.proforma_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Create proforma invoice items table
CREATE TABLE public.proforma_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proforma_invoice_id UUID REFERENCES public.proforma_invoices(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  hsn_code TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  rate DECIMAL NOT NULL,
  amount DECIMAL NOT NULL
);

ALTER TABLE public.proforma_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own proforma invoice items"
  ON public.proforma_invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proforma_invoices
      WHERE id = proforma_invoice_items.proforma_invoice_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own proforma invoice items"
  ON public.proforma_invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proforma_invoices
      WHERE id = proforma_invoice_items.proforma_invoice_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own proforma invoice items"
  ON public.proforma_invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.proforma_invoices
      WHERE id = proforma_invoice_items.proforma_invoice_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own proforma invoice items"
  ON public.proforma_invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.proforma_invoices
      WHERE id = proforma_invoice_items.proforma_invoice_id
      AND user_id = auth.uid()
    )
  );

-- Create purchase orders table
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  date DATE NOT NULL,
  expected_delivery DATE,
  status TEXT DEFAULT 'pending',
  subtotal DECIMAL NOT NULL,
  tax_amount DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase orders"
  ON public.purchase_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchase orders"
  ON public.purchase_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase orders"
  ON public.purchase_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase orders"
  ON public.purchase_orders FOR DELETE
  USING (auth.uid() = user_id);

-- Create purchase order items table
CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  rate DECIMAL NOT NULL,
  amount DECIMAL NOT NULL
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase order items"
  ON public.purchase_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders
      WHERE id = purchase_order_items.purchase_order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own purchase order items"
  ON public.purchase_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders
      WHERE id = purchase_order_items.purchase_order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own purchase order items"
  ON public.purchase_order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders
      WHERE id = purchase_order_items.purchase_order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own purchase order items"
  ON public.purchase_order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders
      WHERE id = purchase_order_items.purchase_order_id
      AND user_id = auth.uid()
    )
  );

-- Create goods receipts table
CREATE TABLE public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gr_number TEXT NOT NULL,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goods receipts"
  ON public.goods_receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goods receipts"
  ON public.goods_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goods receipts"
  ON public.goods_receipts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goods receipts"
  ON public.goods_receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Create goods receipt items table
CREATE TABLE public.goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID REFERENCES public.goods_receipts(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity_ordered DECIMAL NOT NULL,
  quantity_received DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT
);

ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goods receipt items"
  ON public.goods_receipt_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.goods_receipts
      WHERE id = goods_receipt_items.goods_receipt_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own goods receipt items"
  ON public.goods_receipt_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goods_receipts
      WHERE id = goods_receipt_items.goods_receipt_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own goods receipt items"
  ON public.goods_receipt_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.goods_receipts
      WHERE id = goods_receipt_items.goods_receipt_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own goods receipt items"
  ON public.goods_receipt_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.goods_receipts
      WHERE id = goods_receipt_items.goods_receipt_id
      AND user_id = auth.uid()
    )
  );

-- Create customer activities table
CREATE TABLE public.customer_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.customer_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer activities"
  ON public.customer_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customer activities"
  ON public.customer_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer activities"
  ON public.customer_activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer activities"
  ON public.customer_activities FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();