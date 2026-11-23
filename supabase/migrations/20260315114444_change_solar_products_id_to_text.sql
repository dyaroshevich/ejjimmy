-- Change id column from UUID to TEXT in solar_products table
ALTER TABLE public.solar_products ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.solar_products ALTER COLUMN id DROP DEFAULT;
