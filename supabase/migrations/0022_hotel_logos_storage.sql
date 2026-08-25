-- Migration 0022: Hotel Logos Storage Bucket Setup
-- Configures public bucket for hotel property branding and invoice logos

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hotel-logos',
    'hotel-logos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

-- Storage Policy: Anyone can view public hotel logos
DROP POLICY IF EXISTS "Public Hotel Logos Viewable by All" ON storage.objects;
CREATE POLICY "Public Hotel Logos Viewable by All"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'hotel-logos');

-- Storage Policy: Authenticated staff can upload and manage hotel logos
DROP POLICY IF EXISTS "Staff can upload hotel logos" ON storage.objects;
CREATE POLICY "Staff can upload hotel logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'hotel-logos');

DROP POLICY IF EXISTS "Staff can update/delete hotel logos" ON storage.objects;
CREATE POLICY "Staff can update/delete hotel logos"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'hotel-logos')
    WITH CHECK (bucket_id = 'hotel-logos');
