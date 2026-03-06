ALTER TABLE public.locations ADD COLUMN is_default boolean NOT NULL DEFAULT false;

-- Ensure only one default location per user
CREATE UNIQUE INDEX locations_user_default_idx ON public.locations (user_id) WHERE is_default = true;