
-- Remove storage policies for shared-documents bucket
DROP POLICY IF EXISTS "Auth users upload shared docs" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete shared docs" ON storage.objects;
DROP POLICY IF EXISTS "Public can read shared documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload shared documents" ON storage.objects;

-- Delete all objects in the bucket first
DELETE FROM storage.objects WHERE bucket_id = 'shared-documents';

-- Delete the bucket
DELETE FROM storage.buckets WHERE id = 'shared-documents';
