-- Migration: 0026_subscription_billing_system.sql
-- Description: Core subscription billing, payment transactions, customer profiles, and webhook events schema for Grove PMS

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SUBSCRIPTIONS TABLE
-- Tracks recurring SaaS subscription agreements per hotel property
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL DEFAULT 'Grove Operating System',
    razorpay_plan_id TEXT,
    razorpay_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'created' CHECK (
        status IN ('created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired')
    ),
    amount INTEGER NOT NULL CHECK (amount >= 0), -- Stored in paise (e.g. 99900 for ₹999 or 117882 for ₹1,178.82)
    currency TEXT NOT NULL DEFAULT 'INR',
    billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (
        billing_interval IN ('monthly', 'yearly', 'quarterly')
    ),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    next_billing_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotel_id ON public.subscriptions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_sub_id ON public.subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================================
-- 2. PAYMENT TRANSACTIONS TABLE
-- Audits individual SaaS subscription payments, renewals, and refunds
-- (Completely isolated from guest hotel room folio payments in the 'payments' table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    razorpay_payment_id TEXT UNIQUE,
    amount INTEGER NOT NULL CHECK (amount > 0), -- Stored in paise
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (
        status IN ('created', 'authorized', 'captured', 'refunded', 'failed')
    ),
    payment_method TEXT, -- e.g. 'card', 'upi', 'netbanking', 'mandate'
    invoice_reference TEXT, -- Generated invoice code e.g. 'GROVE-INV-2026-001'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_hotel_id ON public.payment_transactions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment_id ON public.payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);


-- ============================================================================
-- 3. BILLING CUSTOMERS TABLE
-- Stores tax, legal invoicing, and contact details for each hotel tenant
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.billing_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL UNIQUE REFERENCES public.hotels(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    billing_address TEXT,
    city TEXT,
    state TEXT,
    gstin TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for billing_customers
CREATE INDEX IF NOT EXISTS idx_billing_customers_hotel_id ON public.billing_customers(hotel_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_email ON public.billing_customers(email);
CREATE INDEX IF NOT EXISTS idx_billing_customers_gstin ON public.billing_customers(gstin);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_billing_customers_updated_at ON public.billing_customers;
CREATE TRIGGER update_billing_customers_updated_at
    BEFORE UPDATE ON public.billing_customers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================================
-- 4. WEBHOOK EVENTS TABLE
-- Immutable event store for Razorpay webhooks (idempotency & audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        processing_status IN ('pending', 'processed', 'failed', 'ignored')
    ),
    processed_at TIMESTAMPTZ,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_razorpay_event_id ON public.webhook_events(razorpay_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON public.webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at DESC);


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation adhering to Grove role-based authorization
-- ============================================================================

-- A. Subscriptions RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hotel owner and manager can view hotel subscriptions" ON public.subscriptions;
CREATE POLICY "Hotel owner and manager can view hotel subscriptions"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.get_my_hotel_id()
        AND public.get_my_staff_role() IN ('owner', 'manager')
    );

-- Allow server-side service_role full control
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- B. Payment Transactions RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hotel owner and manager can view payment transactions" ON public.payment_transactions;
CREATE POLICY "Hotel owner and manager can view payment transactions"
    ON public.payment_transactions FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.get_my_hotel_id()
        AND public.get_my_staff_role() IN ('owner', 'manager')
    );

-- Allow server-side service_role full control
DROP POLICY IF EXISTS "Service role can manage payment transactions" ON public.payment_transactions;
CREATE POLICY "Service role can manage payment transactions"
    ON public.payment_transactions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- C. Billing Customers RLS
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hotel owner and manager can view billing customer" ON public.billing_customers;
CREATE POLICY "Hotel owner and manager can view billing customer"
    ON public.billing_customers FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.get_my_hotel_id()
        AND public.get_my_staff_role() IN ('owner', 'manager')
    );

DROP POLICY IF EXISTS "Hotel owner can update billing customer profile" ON public.billing_customers;
CREATE POLICY "Hotel owner can update billing customer profile"
    ON public.billing_customers FOR UPDATE
    TO authenticated
    USING (
        hotel_id = public.get_my_hotel_id()
        AND public.get_my_staff_role() = 'owner'
    )
    WITH CHECK (
        hotel_id = public.get_my_hotel_id()
        AND public.get_my_staff_role() = 'owner'
    );

-- Allow server-side service_role full control
DROP POLICY IF EXISTS "Service role can manage billing customers" ON public.billing_customers;
CREATE POLICY "Service role can manage billing customers"
    ON public.billing_customers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- D. Webhook Events RLS
-- Webhooks are strictly internal system records. No client access allowed.
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.webhook_events;
CREATE POLICY "Service role can manage webhook events"
    ON public.webhook_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ============================================================================
-- 6. SECURITY DEFINER HELPER FUNCTION
-- Inspects active subscription status without modifying hotel activation state
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_hotel_subscription_status(target_hotel_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_name TEXT,
    status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    next_billing_at TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS subscription_id,
        s.plan_name,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.next_billing_at,
        (s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > NOW())) AS is_active
    FROM public.subscriptions s
    WHERE s.hotel_id = target_hotel_id
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

