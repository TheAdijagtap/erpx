
-- Add gender field to employees
ALTER TABLE public.employees ADD COLUMN gender text DEFAULT NULL;

-- Create payroll_rules table for configurable allowances/deductions
CREATE TABLE public.payroll_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'allowance', -- 'allowance' or 'deduction'
  calculation_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'percentage'
  value NUMERIC NOT NULL DEFAULT 0,
  gender_condition TEXT DEFAULT NULL, -- NULL = all, 'M' = male only, 'F' = female only
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payroll rules" ON public.payroll_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payroll rules" ON public.payroll_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payroll rules" ON public.payroll_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payroll rules" ON public.payroll_rules FOR DELETE USING (auth.uid() = user_id);
