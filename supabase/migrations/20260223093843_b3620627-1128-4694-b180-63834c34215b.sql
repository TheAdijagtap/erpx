-- Enable realtime for HR tables not yet added
-- Using IF NOT EXISTS pattern via DO block
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payslips;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Ensure REPLICA IDENTITY FULL for proper delete sync
ALTER TABLE public.leaves REPLICA IDENTITY FULL;
ALTER TABLE public.employees REPLICA IDENTITY FULL;
ALTER TABLE public.attendance REPLICA IDENTITY FULL;
ALTER TABLE public.payslips REPLICA IDENTITY FULL;