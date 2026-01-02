-- Delete the shared-documents storage bucket and its contents
DELETE FROM storage.objects WHERE bucket_id = 'shared-documents';
DELETE FROM storage.buckets WHERE id = 'shared-documents';