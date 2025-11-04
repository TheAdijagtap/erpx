-- Create price tracking table
CREATE TABLE public.item_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  po_number TEXT,
  supplier_name TEXT,
  recorded_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.item_price_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own price history" 
ON public.item_price_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price history" 
ON public.item_price_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price history" 
ON public.item_price_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price history" 
ON public.item_price_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_item_price_history_item_id ON public.item_price_history(item_id);
CREATE INDEX idx_item_price_history_user_id ON public.item_price_history(user_id);