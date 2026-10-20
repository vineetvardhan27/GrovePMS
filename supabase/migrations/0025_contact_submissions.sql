-- Migration 0025: Contact Submissions Table
-- Description: Stores contact form inquiries from marketing & public pages for audit, durability, and CRM tracking.

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    hotel_name TEXT,
    phone TEXT,
    category TEXT NOT NULL DEFAULT 'sales',
    ip_address TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'received', -- 'received', 'delivered', 'delivery_failed'
    delivery_provider TEXT,
    delivery_message_id TEXT,
    delivery_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance and query indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
ON public.contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
ON public.contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
ON public.contact_submissions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow full access to service_role (used by backend API route)
CREATE POLICY "Service role can manage contact_submissions"
ON public.contact_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
