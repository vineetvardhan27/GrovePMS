-- Migration 0023: Guest Documents and Secure Private Storage
-- Description: Private bucket for guest ID cards, guest_documents table, audit logs, and multi-tenant RLS

-- 1. Helper functions for resolving staff identity with auth ID and email fallback
CREATE OR REPLACE FUNCTION public.get_current_staff_hotel_id()
RETURNS UUID AS $$
    SELECT hotel_id FROM public.staff 
    WHERE (id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())) 
      AND is_active = true 
    LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_staff_role()
RETURNS TEXT AS $$
    SELECT role FROM public.staff 
    WHERE (id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())) 
      AND is_active = true 
    LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 2. Create Private Storage Bucket for Guest ID Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'guest-documents',
    'guest-documents',
    false, -- Strictly private bucket!
    10485760, -- 10MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE 
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];

-- 3. Create guest_documents table
CREATE TABLE IF NOT EXISTS public.guest_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL DEFAULT 'Aadhaar',
    document_number_masked TEXT,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID REFERENCES public.staff(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast tenant-scoped lookups
CREATE INDEX IF NOT EXISTS idx_guest_documents_guest_hotel ON public.guest_documents (guest_id, hotel_id);
CREATE INDEX IF NOT EXISTS idx_guest_documents_hotel_active ON public.guest_documents (hotel_id, is_active);

-- 4. Create guest_document_audit_logs table
CREATE TABLE IF NOT EXISTS public.guest_document_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.guest_documents(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id),
    action TEXT NOT NULL, -- 'viewed', 'uploaded', 'replaced', 'deleted', 'downloaded'
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_doc_audit_doc ON public.guest_document_audit_logs (document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_doc_audit_hotel ON public.guest_document_audit_logs (hotel_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.guest_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_document_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for guest_documents
DROP POLICY IF EXISTS "Authorized staff can view guest documents" ON public.guest_documents;
CREATE POLICY "Authorized staff can view guest documents"
    ON public.guest_documents FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

DROP POLICY IF EXISTS "Authorized staff can insert guest documents" ON public.guest_documents;
CREATE POLICY "Authorized staff can insert guest documents"
    ON public.guest_documents FOR INSERT
    TO authenticated
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
        AND EXISTS (
            SELECT 1 FROM public.guests g
            WHERE g.id = guest_id AND g.hotel_id = public.get_current_staff_hotel_id()
        )
    );

DROP POLICY IF EXISTS "Authorized staff can update guest documents" ON public.guest_documents;
CREATE POLICY "Authorized staff can update guest documents"
    ON public.guest_documents FOR UPDATE
    TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

DROP POLICY IF EXISTS "Owner and manager can delete guest documents" ON public.guest_documents;
CREATE POLICY "Owner and manager can delete guest documents"
    ON public.guest_documents FOR DELETE
    TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

-- 6. RLS Policies for guest_document_audit_logs
DROP POLICY IF EXISTS "Authorized staff can view audit logs" ON public.guest_document_audit_logs;
CREATE POLICY "Authorized staff can view audit logs"
    ON public.guest_document_audit_logs FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

DROP POLICY IF EXISTS "Authorized staff can insert audit logs" ON public.guest_document_audit_logs;
CREATE POLICY "Authorized staff can insert audit logs"
    ON public.guest_document_audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

-- 7. Storage Policies for guest-documents private bucket
-- Storage objects path structure: hotel/{hotel_id}/guests/{guest_id}/documents/{document_id}/{filename} or {hotel_id}/{guest_id}/{document_id}.{ext}

DROP POLICY IF EXISTS "Authorized staff can read private guest documents" ON storage.objects;
CREATE POLICY "Authorized staff can read private guest documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'guest-documents'
        AND (
            ((storage.foldername(name))[1] = 'hotel' AND (storage.foldername(name))[2] = public.get_current_staff_hotel_id()::text)
            OR (storage.foldername(name))[1] = public.get_current_staff_hotel_id()::text
        )
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

DROP POLICY IF EXISTS "Authorized staff can upload private guest documents" ON storage.objects;
CREATE POLICY "Authorized staff can upload private guest documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'guest-documents'
        AND (
            ((storage.foldername(name))[1] = 'hotel' AND (storage.foldername(name))[2] = public.get_current_staff_hotel_id()::text)
            OR (storage.foldername(name))[1] = public.get_current_staff_hotel_id()::text
        )
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

DROP POLICY IF EXISTS "Authorized staff can update or delete private guest documents" ON storage.objects;
CREATE POLICY "Authorized staff can update or delete private guest documents"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
        bucket_id = 'guest-documents'
        AND (
            ((storage.foldername(name))[1] = 'hotel' AND (storage.foldername(name))[2] = public.get_current_staff_hotel_id()::text)
            OR (storage.foldername(name))[1] = public.get_current_staff_hotel_id()::text
        )
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );
