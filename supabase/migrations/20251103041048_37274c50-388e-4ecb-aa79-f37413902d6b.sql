-- Create scrap_notes table
CREATE TABLE public.scrap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scrap_number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create scrap_note_items table
CREATE TABLE public.scrap_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scrap_note_id UUID NOT NULL REFERENCES public.scrap_notes(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL
);

-- Enable RLS
ALTER TABLE public.scrap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_note_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scrap_notes
CREATE POLICY "Users can view their own scrap notes"
  ON public.scrap_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scrap notes"
  ON public.scrap_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrap notes"
  ON public.scrap_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrap notes"
  ON public.scrap_notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for scrap_note_items
CREATE POLICY "Users can view their own scrap note items"
  ON public.scrap_note_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scrap_notes
    WHERE scrap_notes.id = scrap_note_items.scrap_note_id
    AND scrap_notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own scrap note items"
  ON public.scrap_note_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scrap_notes
    WHERE scrap_notes.id = scrap_note_items.scrap_note_id
    AND scrap_notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own scrap note items"
  ON public.scrap_note_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.scrap_notes
    WHERE scrap_notes.id = scrap_note_items.scrap_note_id
    AND scrap_notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own scrap note items"
  ON public.scrap_note_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.scrap_notes
    WHERE scrap_notes.id = scrap_note_items.scrap_note_id
    AND scrap_notes.user_id = auth.uid()
  ));

-- Add trigger for updated_at
CREATE TRIGGER update_scrap_notes_updated_at
  BEFORE UPDATE ON public.scrap_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();