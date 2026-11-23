-- Create Storage Buckets for PDF Proposals and Product Images
-- This ensures the buckets exist and have correct RLS policies

-- 1. Create buckets (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
-- Note: Supabase Storage has its own RLS on the storage.objects table

-- 3. Create Policies for Proposals
-- Anyone can read a proposal if they have the link (Public Read)
CREATE POLICY "Public Access Proposals"
ON storage.objects FOR SELECT
USING ( bucket_id = 'proposals' );

-- Only authenticated users (Admins) can upload/update/delete proposals
CREATE POLICY "Admins can manage proposals"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'proposals' )
WITH CHECK ( bucket_id = 'proposals' );

-- 4. Create Policies for Products
-- Anyone can read product images
CREATE POLICY "Public Access Products"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Only authenticated users (Admins) can manage product images
CREATE POLICY "Admins can manage products"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'products' )
WITH CHECK ( bucket_id = 'products' );
