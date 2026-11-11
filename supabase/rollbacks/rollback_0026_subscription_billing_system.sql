-- Rollback Migration for: 0026_subscription_billing_system.sql
-- Description: Reverses tables, triggers, functions, and policies introduced for subscription billing

-- 1. Drop helper functions
DROP FUNCTION IF EXISTS public.get_hotel_subscription_status(UUID);

-- 2. Drop triggers
DROP TRIGGER IF EXISTS update_billing_customers_updated_at ON public.billing_customers;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;

-- 3. Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.billing_customers CASCADE;
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

