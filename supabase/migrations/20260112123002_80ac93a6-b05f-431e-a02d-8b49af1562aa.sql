-- Add persisted status to proforma invoices
ALTER TABLE public.proforma_invoices
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'SENT';

-- Optional: keep values consistent (no-op for existing valid values)
UPDATE public.proforma_invoices
SET status = upper(status)
WHERE status IS NOT NULL;
