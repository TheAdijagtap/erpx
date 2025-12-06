-- Create proforma_products table
CREATE TABLE public.proforma_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'PCS',
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.proforma_products ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own proforma products" 
ON public.proforma_products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proforma products" 
ON public.proforma_products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proforma products" 
ON public.proforma_products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proforma products" 
ON public.proforma_products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_proforma_products_updated_at
BEFORE UPDATE ON public.proforma_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();