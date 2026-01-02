-- Create storage bucket for shared documents (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shared-documents', 'shared-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to shared documents
CREATE POLICY "Public can read shared documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'shared-documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shared-documents' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'shared-documents' AND auth.uid()::text = (storage.foldername(name))[1]);