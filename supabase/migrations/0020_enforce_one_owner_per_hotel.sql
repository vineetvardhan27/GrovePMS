-- Migration: 0020_enforce_one_owner_per_hotel.sql
-- Description: Enforce core business rule: One hotel = exactly one Owner account.

-- 1. Create partial unique index on public.staff ensuring only 1 owner per hotel_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_one_owner_per_hotel
    ON public.staff (hotel_id)
    WHERE role = 'owner';

-- 2. Security validation function to prevent unauthorized owner promotion
CREATE OR REPLACE FUNCTION public.check_single_owner_before_insert_or_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'owner' THEN
        IF EXISTS (
            SELECT 1 FROM public.staff 
            WHERE hotel_id = NEW.hotel_id 
              AND role = 'owner' 
              AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'A hotel can have only one Owner account. Hotel % already has an active Owner.', NEW.hotel_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enforce_single_owner ON public.staff;
CREATE TRIGGER trg_enforce_single_owner
    BEFORE INSERT OR UPDATE OF role, hotel_id ON public.staff
    FOR EACH ROW EXECUTE PROCEDURE public.check_single_owner_before_insert_or_update();
