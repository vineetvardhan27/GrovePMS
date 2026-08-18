-- Migration: 0004_auth_triggers.sql
-- Description: Trigger and helper function to synchronize Supabase auth.users with public.staff

-- Function to handle new user registration or role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user_staff()
RETURNS TRIGGER AS $$
DECLARE
    default_hotel_id UUID;
    user_role TEXT;
    user_full_name TEXT;
BEGIN
    -- Resolve default hotel ID (Hotel Greenery View)
    SELECT id INTO default_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    
    -- Fallback to first hotel if slug not found
    IF default_hotel_id IS NULL THEN
        SELECT id INTO default_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    -- Extract role from user metadata or default to 'reception'
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'reception');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    -- Upsert staff record
    INSERT INTO public.staff (id, hotel_id, email, full_name, role, is_active)
    VALUES (NEW.id, default_hotel_id, NEW.email, user_full_name, user_role, true)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute upon auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_staff();
