-- Create table for T-Codes
CREATE TABLE public.t_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goods_receipt_id UUID NOT NULL,
  goods_receipt_item_id UUID NOT NULL,
  t_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  gr_number TEXT NOT NULL,
  batch_number TEXT,
  unit TEXT NOT NULL,
  sticker_number INTEGER NOT NULL,
  total_stickers INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.t_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own t_codes"
ON public.t_codes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own t_codes"
ON public.t_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own t_codes"
ON public.t_codes
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_t_codes_gr_id ON public.t_codes(goods_receipt_id);
CREATE INDEX idx_t_codes_user_id ON public.t_codes(user_id);