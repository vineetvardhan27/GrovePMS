-- Migration: 0021_fix_on_auth_user_trigger.sql
-- Description: Fix handle_new_user_staff to prevent unauthorized or unintended default staff insertion

CREATE OR REPLACE FUNCTION public.handle_new_user_staff()
RETURNS TRIGGER AS $$
DECLARE
    invited_hotel_id UUID;
    invited_role TEXT;
    user_full_name TEXT;
BEGIN
    -- Only provision staff if hotel_id is explicitly provided in user metadata
    IF NEW.raw_user_meta_data->>'hotel_id' IS NOT NULL AND NEW.raw_user_meta_data->>'hotel_id' != '' THEN
        invited_hotel_id := (NEW.raw_user_meta_data->>'hotel_id')::UUID;
        invited_role := COALESCE(NEW.raw_user_meta_data->>'role', 'reception');
        user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

        INSERT INTO public.staff (id, hotel_id, email, full_name, role, is_active, created_at, updated_at)
        VALUES (NEW.id, invited_hotel_id, NEW.email, user_full_name, invited_role, true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            hotel_id = EXCLUDED.hotel_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_staff();
