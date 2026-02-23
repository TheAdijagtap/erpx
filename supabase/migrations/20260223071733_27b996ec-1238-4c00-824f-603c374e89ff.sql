-- Add overtime_hours column to attendance table
ALTER TABLE public.attendance ADD COLUMN overtime_hours numeric DEFAULT 0;