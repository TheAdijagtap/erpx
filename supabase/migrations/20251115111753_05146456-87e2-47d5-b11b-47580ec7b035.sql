-- Create passkeys table
CREATE TABLE public.passkeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passkey TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (no public access - only edge functions with service role)
ALTER TABLE public.passkeys ENABLE ROW LEVEL SECURITY;

-- Insert initial passkeys
INSERT INTO public.passkeys (passkey) VALUES 
  ('ASDFGHJKL'),
  ('ZXCVBNM');