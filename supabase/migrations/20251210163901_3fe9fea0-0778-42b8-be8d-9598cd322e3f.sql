-- Create inventory transactions table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  reason TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transactions" 
ON public.inventory_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.inventory_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.inventory_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_transactions_item_id ON public.inventory_transactions(item_id);
CREATE INDEX idx_transactions_user_id ON public.inventory_transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.inventory_transactions(created_at DESC);