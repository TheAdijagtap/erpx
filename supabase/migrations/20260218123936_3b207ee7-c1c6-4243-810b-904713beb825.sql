
-- Create storage bucket for shared documents
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-documents', 'shared-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload shared docs
CREATE POLICY "Auth users upload shared docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shared-documents' AND auth.uid() IS NOT NULL);

-- Allow users to delete own shared docs
CREATE POLICY "Auth users delete shared docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'shared-documents' AND auth.uid() IS NOT NULL);
