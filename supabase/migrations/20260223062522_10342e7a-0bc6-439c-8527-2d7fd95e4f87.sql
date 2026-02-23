
-- Sub-user links table
CREATE TABLE public.sub_user_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL,
  sub_user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sub_user_links ENABLE ROW LEVEL SECURITY;

-- Sub-user feature permissions table
CREATE TABLE public.sub_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_user_id uuid NOT NULL,
  feature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sub_user_id, feature)
);
ALTER TABLE public.sub_user_permissions ENABLE ROW LEVEL SECURITY;

-- Function: get_data_owner_id - returns parent_user_id if sub-user, otherwise self
CREATE OR REPLACE FUNCTION public.get_data_owner_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT parent_user_id FROM public.sub_user_links WHERE sub_user_id = _user_id),
    _user_id
  )
$$;

-- Function: is_sub_user - checks if user is a sub-user
CREATE OR REPLACE FUNCTION public.is_sub_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.sub_user_links WHERE sub_user_id = _user_id)
$$;

-- Function: has_feature_access - checks if sub-user has access to a feature
CREATE OR REPLACE FUNCTION public.has_feature_access(_user_id uuid, _feature text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Main users have access to everything
    NOT EXISTS (SELECT 1 FROM public.sub_user_links WHERE sub_user_id = _user_id)
    OR
    -- Sub-users need explicit permission
    EXISTS (SELECT 1 FROM public.sub_user_permissions WHERE sub_user_id = _user_id AND feature = _feature)
$$;

-- RLS for sub_user_links
CREATE POLICY "Parents can view their sub-users" ON public.sub_user_links FOR SELECT USING (auth.uid() = parent_user_id);
CREATE POLICY "Sub-users can view their own link" ON public.sub_user_links FOR SELECT USING (auth.uid() = sub_user_id);
CREATE POLICY "Parents can create sub-users" ON public.sub_user_links FOR INSERT WITH CHECK (auth.uid() = parent_user_id);
CREATE POLICY "Parents can delete sub-users" ON public.sub_user_links FOR DELETE USING (auth.uid() = parent_user_id);

-- RLS for sub_user_permissions
CREATE POLICY "Parents can manage permissions" ON public.sub_user_permissions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.sub_user_links WHERE sub_user_id = sub_user_permissions.sub_user_id AND parent_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sub_user_links WHERE sub_user_id = sub_user_permissions.sub_user_id AND parent_user_id = auth.uid()));
CREATE POLICY "Sub-users can view own permissions" ON public.sub_user_permissions FOR SELECT
  USING (auth.uid() = sub_user_id);

-- ============================================
-- UPDATE ALL EXISTING RLS POLICIES
-- Tables with direct user_id column
-- ============================================

-- INVENTORY_ITEMS
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can create their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.inventory_items;
CREATE POLICY "Users can view their own inventory" ON public.inventory_items FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own inventory" ON public.inventory_items FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own inventory" ON public.inventory_items FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own inventory" ON public.inventory_items FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- INVENTORY_TRANSACTIONS
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.inventory_transactions;
CREATE POLICY "Users can view their own transactions" ON public.inventory_transactions FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.inventory_transactions FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- ITEM_PRICE_HISTORY
DROP POLICY IF EXISTS "Users can view their own price history" ON public.item_price_history;
DROP POLICY IF EXISTS "Users can create their own price history" ON public.item_price_history;
DROP POLICY IF EXISTS "Users can update their own price history" ON public.item_price_history;
DROP POLICY IF EXISTS "Users can delete their own price history" ON public.item_price_history;
CREATE POLICY "Users can view their own price history" ON public.item_price_history FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own price history" ON public.item_price_history FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own price history" ON public.item_price_history FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own price history" ON public.item_price_history FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- PURCHASE_ORDERS
DROP POLICY IF EXISTS "Users can view their own purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Users can create their own purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Users can update their own purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Users can delete their own purchase orders" ON public.purchase_orders;
CREATE POLICY "Users can view their own purchase orders" ON public.purchase_orders FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own purchase orders" ON public.purchase_orders FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own purchase orders" ON public.purchase_orders FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own purchase orders" ON public.purchase_orders FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- GOODS_RECEIPTS
DROP POLICY IF EXISTS "Users can view their own goods receipts" ON public.goods_receipts;
DROP POLICY IF EXISTS "Users can create their own goods receipts" ON public.goods_receipts;
DROP POLICY IF EXISTS "Users can update their own goods receipts" ON public.goods_receipts;
DROP POLICY IF EXISTS "Users can delete their own goods receipts" ON public.goods_receipts;
CREATE POLICY "Users can view their own goods receipts" ON public.goods_receipts FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own goods receipts" ON public.goods_receipts FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own goods receipts" ON public.goods_receipts FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own goods receipts" ON public.goods_receipts FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- SUPPLIERS
DROP POLICY IF EXISTS "Users can view their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can create their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON public.suppliers;
CREATE POLICY "Users can view their own suppliers" ON public.suppliers FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own suppliers" ON public.suppliers FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own suppliers" ON public.suppliers FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own suppliers" ON public.suppliers FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- PROFORMA_INVOICES
DROP POLICY IF EXISTS "Users can view their own proforma invoices" ON public.proforma_invoices;
DROP POLICY IF EXISTS "Users can create their own proforma invoices" ON public.proforma_invoices;
DROP POLICY IF EXISTS "Users can update their own proforma invoices" ON public.proforma_invoices;
DROP POLICY IF EXISTS "Users can delete their own proforma invoices" ON public.proforma_invoices;
CREATE POLICY "Users can view their own proforma invoices" ON public.proforma_invoices FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own proforma invoices" ON public.proforma_invoices FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own proforma invoices" ON public.proforma_invoices FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own proforma invoices" ON public.proforma_invoices FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- PROFORMA_PRODUCTS
DROP POLICY IF EXISTS "Users can view their own proforma products" ON public.proforma_products;
DROP POLICY IF EXISTS "Users can create their own proforma products" ON public.proforma_products;
DROP POLICY IF EXISTS "Users can update their own proforma products" ON public.proforma_products;
DROP POLICY IF EXISTS "Users can delete their own proforma products" ON public.proforma_products;
CREATE POLICY "Users can view their own proforma products" ON public.proforma_products FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own proforma products" ON public.proforma_products FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own proforma products" ON public.proforma_products FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own proforma products" ON public.proforma_products FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- CUSTOMERS
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
CREATE POLICY "Users can view their own customers" ON public.customers FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own customers" ON public.customers FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own customers" ON public.customers FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own customers" ON public.customers FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- CUSTOMER_ACTIVITIES
DROP POLICY IF EXISTS "Users can view their own customer activities" ON public.customer_activities;
DROP POLICY IF EXISTS "Users can create their own customer activities" ON public.customer_activities;
DROP POLICY IF EXISTS "Users can update their own customer activities" ON public.customer_activities;
DROP POLICY IF EXISTS "Users can delete their own customer activities" ON public.customer_activities;
CREATE POLICY "Users can view their own customer activities" ON public.customer_activities FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own customer activities" ON public.customer_activities FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own customer activities" ON public.customer_activities FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own customer activities" ON public.customer_activities FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- EMPLOYEES
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can create their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON public.employees;
CREATE POLICY "Users can view their own employees" ON public.employees FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own employees" ON public.employees FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own employees" ON public.employees FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own employees" ON public.employees FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- ATTENDANCE
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can create their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can update their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can delete their own attendance" ON public.attendance;
CREATE POLICY "Users can view their own attendance" ON public.attendance FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own attendance" ON public.attendance FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own attendance" ON public.attendance FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own attendance" ON public.attendance FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- LEAVES
DROP POLICY IF EXISTS "Users can view their own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Users can create their own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Users can update their own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Users can delete their own leaves" ON public.leaves;
CREATE POLICY "Users can view their own leaves" ON public.leaves FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own leaves" ON public.leaves FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own leaves" ON public.leaves FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own leaves" ON public.leaves FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- PAYSLIPS
DROP POLICY IF EXISTS "Users can view their own payslips" ON public.payslips;
DROP POLICY IF EXISTS "Users can create their own payslips" ON public.payslips;
DROP POLICY IF EXISTS "Users can update their own payslips" ON public.payslips;
DROP POLICY IF EXISTS "Users can delete their own payslips" ON public.payslips;
CREATE POLICY "Users can view their own payslips" ON public.payslips FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own payslips" ON public.payslips FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own payslips" ON public.payslips FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own payslips" ON public.payslips FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- PAYROLL_RULES
DROP POLICY IF EXISTS "Users can view their own payroll rules" ON public.payroll_rules;
DROP POLICY IF EXISTS "Users can create their own payroll rules" ON public.payroll_rules;
DROP POLICY IF EXISTS "Users can update their own payroll rules" ON public.payroll_rules;
DROP POLICY IF EXISTS "Users can delete their own payroll rules" ON public.payroll_rules;
CREATE POLICY "Users can view their own payroll rules" ON public.payroll_rules FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own payroll rules" ON public.payroll_rules FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own payroll rules" ON public.payroll_rules FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own payroll rules" ON public.payroll_rules FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- SCRAP_NOTES
DROP POLICY IF EXISTS "Users can view their own scrap notes" ON public.scrap_notes;
DROP POLICY IF EXISTS "Users can create their own scrap notes" ON public.scrap_notes;
DROP POLICY IF EXISTS "Users can update their own scrap notes" ON public.scrap_notes;
DROP POLICY IF EXISTS "Users can delete their own scrap notes" ON public.scrap_notes;
CREATE POLICY "Users can view their own scrap notes" ON public.scrap_notes FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own scrap notes" ON public.scrap_notes FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can update their own scrap notes" ON public.scrap_notes FOR UPDATE USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own scrap notes" ON public.scrap_notes FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- T_CODES
DROP POLICY IF EXISTS "Users can view their own t_codes" ON public.t_codes;
DROP POLICY IF EXISTS "Users can create their own t_codes" ON public.t_codes;
DROP POLICY IF EXISTS "Users can delete their own t_codes" ON public.t_codes;
CREATE POLICY "Users can view their own t_codes" ON public.t_codes FOR SELECT USING (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can create their own t_codes" ON public.t_codes FOR INSERT WITH CHECK (get_data_owner_id(auth.uid()) = user_id);
CREATE POLICY "Users can delete their own t_codes" ON public.t_codes FOR DELETE USING (get_data_owner_id(auth.uid()) = user_id);

-- ============================================
-- CHILD TABLES - update EXISTS clauses
-- ============================================

-- PURCHASE_ORDER_ITEMS
DROP POLICY IF EXISTS "Users can view their own purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Users can create their own purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Users can update their own purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Users can delete their own purchase order items" ON public.purchase_order_items;
CREATE POLICY "Users can view their own purchase order items" ON public.purchase_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own purchase order items" ON public.purchase_order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can update their own purchase order items" ON public.purchase_order_items FOR UPDATE USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own purchase order items" ON public.purchase_order_items FOR DELETE USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = get_data_owner_id(auth.uid())));

-- PURCHASE_ORDER_ADDITIONAL_CHARGES
DROP POLICY IF EXISTS "Users can view their own PO additional charges" ON public.purchase_order_additional_charges;
DROP POLICY IF EXISTS "Users can create their own PO additional charges" ON public.purchase_order_additional_charges;
DROP POLICY IF EXISTS "Users can delete their own PO additional charges" ON public.purchase_order_additional_charges;
CREATE POLICY "Users can view their own PO additional charges" ON public.purchase_order_additional_charges FOR SELECT USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_additional_charges.purchase_order_id AND purchase_orders.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own PO additional charges" ON public.purchase_order_additional_charges FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_additional_charges.purchase_order_id AND purchase_orders.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own PO additional charges" ON public.purchase_order_additional_charges FOR DELETE USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_additional_charges.purchase_order_id AND purchase_orders.user_id = get_data_owner_id(auth.uid())));

-- GOODS_RECEIPT_ITEMS
DROP POLICY IF EXISTS "Users can view their own goods receipt items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Users can create their own goods receipt items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Users can update their own goods receipt items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Users can delete their own goods receipt items" ON public.goods_receipt_items;
CREATE POLICY "Users can view their own goods receipt items" ON public.goods_receipt_items FOR SELECT USING (EXISTS (SELECT 1 FROM goods_receipts WHERE goods_receipts.id = goods_receipt_items.goods_receipt_id AND goods_receipts.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own goods receipt items" ON public.goods_receipt_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM goods_receipts WHERE goods_receipts.id = goods_receipt_items.goods_receipt_id AND goods_receipts.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can update their own goods receipt items" ON public.goods_receipt_items FOR UPDATE USING (EXISTS (SELECT 1 FROM goods_receipts WHERE goods_receipts.id = goods_receipt_items.goods_receipt_id AND goods_receipts.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own goods receipt items" ON public.goods_receipt_items FOR DELETE USING (EXISTS (SELECT 1 FROM goods_receipts WHERE goods_receipts.id = goods_receipt_items.goods_receipt_id AND goods_receipts.user_id = get_data_owner_id(auth.uid())));

-- GOODS_RECEIPT_ADDITIONAL_CHARGES
DROP POLICY IF EXISTS "Users can view their own GR additional charges" ON public.goods_receipt_additional_charges;
DROP POLICY IF EXISTS "Users can create their own GR additional charges" ON public.goods_receipt_additional_charges;
DROP POLICY IF EXISTS "Users can delete their own GR additional charges" ON public.goods_receipt_additional_charges;
CREATE POLICY "Users can view their own GR additional charges" ON public.goods_receipt_additional_charges FOR SELECT USING (EXISTS (SELECT 1 FROM goods_receipts WHERE goods_receipts.id = goods_receipt_additional_charges.goods_receipt_id AND goods_receipts.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own GR additional charges" ON public.goods_receipt_additional_charges FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM goods_receipts WHERE goods_receipts.id = goods_receipt_additional_charges.goods_receipt_id AND goods_receipts.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own GR additional charges" ON public.goods_receipt_additional_charges FOR DELETE USING (EXISTS (SELECT 1 FROM goods_receipts WHERE goods_receipts.id = goods_receipt_additional_charges.goods_receipt_id AND goods_receipts.user_id = get_data_owner_id(auth.uid())));

-- PROFORMA_INVOICE_ITEMS
DROP POLICY IF EXISTS "Users can view their own proforma invoice items" ON public.proforma_invoice_items;
DROP POLICY IF EXISTS "Users can create their own proforma invoice items" ON public.proforma_invoice_items;
DROP POLICY IF EXISTS "Users can update their own proforma invoice items" ON public.proforma_invoice_items;
DROP POLICY IF EXISTS "Users can delete their own proforma invoice items" ON public.proforma_invoice_items;
CREATE POLICY "Users can view their own proforma invoice items" ON public.proforma_invoice_items FOR SELECT USING (EXISTS (SELECT 1 FROM proforma_invoices WHERE proforma_invoices.id = proforma_invoice_items.proforma_invoice_id AND proforma_invoices.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own proforma invoice items" ON public.proforma_invoice_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM proforma_invoices WHERE proforma_invoices.id = proforma_invoice_items.proforma_invoice_id AND proforma_invoices.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can update their own proforma invoice items" ON public.proforma_invoice_items FOR UPDATE USING (EXISTS (SELECT 1 FROM proforma_invoices WHERE proforma_invoices.id = proforma_invoice_items.proforma_invoice_id AND proforma_invoices.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own proforma invoice items" ON public.proforma_invoice_items FOR DELETE USING (EXISTS (SELECT 1 FROM proforma_invoices WHERE proforma_invoices.id = proforma_invoice_items.proforma_invoice_id AND proforma_invoices.user_id = get_data_owner_id(auth.uid())));

-- PROFORMA_INVOICE_ADDITIONAL_CHARGES
DROP POLICY IF EXISTS "Users can view their own PI additional charges" ON public.proforma_invoice_additional_charges;
DROP POLICY IF EXISTS "Users can create their own PI additional charges" ON public.proforma_invoice_additional_charges;
DROP POLICY IF EXISTS "Users can delete their own PI additional charges" ON public.proforma_invoice_additional_charges;
CREATE POLICY "Users can view their own PI additional charges" ON public.proforma_invoice_additional_charges FOR SELECT USING (EXISTS (SELECT 1 FROM proforma_invoices WHERE proforma_invoices.id = proforma_invoice_additional_charges.proforma_invoice_id AND proforma_invoices.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own PI additional charges" ON public.proforma_invoice_additional_charges FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM proforma_invoices WHERE proforma_invoices.id = proforma_invoice_additional_charges.proforma_invoice_id AND proforma_invoices.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own PI additional charges" ON public.proforma_invoice_additional_charges FOR DELETE USING (EXISTS (SELECT 1 FROM proforma_invoices WHERE proforma_invoices.id = proforma_invoice_additional_charges.proforma_invoice_id AND proforma_invoices.user_id = get_data_owner_id(auth.uid())));

-- SCRAP_NOTE_ITEMS
DROP POLICY IF EXISTS "Users can view their own scrap note items" ON public.scrap_note_items;
DROP POLICY IF EXISTS "Users can create their own scrap note items" ON public.scrap_note_items;
DROP POLICY IF EXISTS "Users can update their own scrap note items" ON public.scrap_note_items;
DROP POLICY IF EXISTS "Users can delete their own scrap note items" ON public.scrap_note_items;
CREATE POLICY "Users can view their own scrap note items" ON public.scrap_note_items FOR SELECT USING (EXISTS (SELECT 1 FROM scrap_notes WHERE scrap_notes.id = scrap_note_items.scrap_note_id AND scrap_notes.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can create their own scrap note items" ON public.scrap_note_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM scrap_notes WHERE scrap_notes.id = scrap_note_items.scrap_note_id AND scrap_notes.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can update their own scrap note items" ON public.scrap_note_items FOR UPDATE USING (EXISTS (SELECT 1 FROM scrap_notes WHERE scrap_notes.id = scrap_note_items.scrap_note_id AND scrap_notes.user_id = get_data_owner_id(auth.uid())));
CREATE POLICY "Users can delete their own scrap note items" ON public.scrap_note_items FOR DELETE USING (EXISTS (SELECT 1 FROM scrap_notes WHERE scrap_notes.id = scrap_note_items.scrap_note_id AND scrap_notes.user_id = get_data_owner_id(auth.uid())));
