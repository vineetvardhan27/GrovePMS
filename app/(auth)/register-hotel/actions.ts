'use server';

import { redirect } from 'next/navigation';
import { createClient as createServerSupabaseClient } from '../../../lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface RegisterHotelState {
  error?: string;
  success?: boolean;
  message?: string;
  hotelName?: string;
  ownerEmail?: string;
  code?: 'EMAIL_EXISTS' | 'VALIDATION_ERROR' | 'CREATION_ERROR';
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server configuration error: Service role key is missing.');
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}

export async function registerHotelAndOwner(
  prevState: RegisterHotelState | null,
  formData: FormData
): Promise<RegisterHotelState> {
  const hotelName = (formData.get('hotel_name') as string)?.trim();
  const ownerFullName = (formData.get('owner_full_name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const city = (formData.get('city') as string)?.trim() || 'New Delhi';
  const state = (formData.get('state') as string)?.trim() || 'Delhi';
  const pinCode = (formData.get('pin_code') as string)?.trim() || '110001';
  const gstNumber = (formData.get('gst_number') as string)?.trim() || '';

  // 1. Validation
  if (!hotelName || !ownerFullName || !email || !password) {
    return {
      error: 'Please provide all required fields: Hotel Name, Owner Name, Work Email, and Password.',
      code: 'VALIDATION_ERROR',
    };
  }

  if (password.length < 6) {
    return {
      error: 'Password must be at least 6 characters long.',
      code: 'VALIDATION_ERROR',
    };
  }

  if (confirmPassword && password !== confirmPassword) {
    return {
      error: 'Passwords do not match. Please re-enter your password.',
      code: 'VALIDATION_ERROR',
    };
  }

  let createdHotelId: string | null = null;
  let createdAuthUserId: string | null = null;

  try {
    const admin = getAdminClient();

    // 2. Pre-check: Verify email does not already exist in staff or auth
    const { data: existingStaff } = await admin
      .from('staff')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();

    if (existingStaff) {
      return {
        error: 'An account already exists with this email address. Please use another email address or sign in with your existing account.',
        code: 'EMAIL_EXISTS',
      };
    }

    const { data: authUsersList } = await admin.auth.admin.listUsers();
    const existingAuthUser = authUsersList?.users?.find((u) => u.email?.toLowerCase() === email);
    if (existingAuthUser) {
      return {
        error: 'An account already exists with this email address. Please use another email address or sign in with your existing account.',
        code: 'EMAIL_EXISTS',
      };
    }

    // 3. Step A: Create Hotel Record First (to establish tenant ID)
    const hotelSlug = generateSlug(hotelName);
    const initialSettings = {
      gst_enabled: true,
      gst_percentage: 12,
      gst_rate: 12,
      gst_number: gstNumber || null,
      pan_number: null,
      address: address || hotelName,
      city,
      state,
      pin_code: pinCode,
      phone: phone || '+91 98000 00000',
      email,
      check_in_time: '12:00',
      check_out_time: '11:00',
      currency_symbol: '₹',
      currency_code: 'INR',
      logo_url: null,
    };

    const { data: newHotel, error: hotelErr } = (await admin
      .from('hotels')
      .insert({
        name: hotelName,
        slug: hotelSlug,
        address: address || `${city}, ${state}`,
        phone: phone || '+91 98000 00000',
        email,
        settings: initialSettings,
      })
      .select('id, name, slug')
      .single()) as { data: { id: string; name: string; slug: string } | null; error: any };

    if (hotelErr || !newHotel) {
      console.error('Error creating hotel record:', hotelErr?.message);
      return {
        error: "We couldn't create your hotel property right now. Please check your details and try again.",
        code: 'CREATION_ERROR',
      };
    }

    createdHotelId = newHotel.id;

    // 4. Step B: Create Supabase Auth User with hotel_id in metadata
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: ownerFullName,
        role: 'owner',
        hotel_id: createdHotelId,
      },
    });

    if (authErr || !authData?.user) {
      console.error('Error creating auth identity:', authErr?.message);
      // Clean up created hotel
      await admin.from('hotels').delete().eq('id', createdHotelId);
      createdHotelId = null;

      if (authErr?.message?.includes('already registered')) {
        return {
          error: 'An account already exists with this email address. Please use another email address or sign in with your existing account.',
          code: 'EMAIL_EXISTS',
        };
      }
      return {
        error: "We couldn't set up the owner credentials. Please try again.",
        code: 'CREATION_ERROR',
      };
    }

    createdAuthUserId = authData.user.id;

    // 5. Step C: Upsert Owner Staff Record
    const { error: staffErr } = await admin.from('staff').upsert({
      id: createdAuthUserId,
      hotel_id: createdHotelId,
      email,
      full_name: ownerFullName,
      role: 'owner',
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (staffErr) {
      console.error('Error creating owner staff profile:', staffErr.message);
      // Rollback both auth user and hotel
      await admin.from('staff').delete().eq('id', createdAuthUserId);
      await admin.auth.admin.deleteUser(createdAuthUserId);
      await admin.from('hotels').delete().eq('id', createdHotelId);
      createdAuthUserId = null;
      createdHotelId = null;

      return {
        error: "We couldn't finish setting up the owner account. No partial account was created. Please try again.",
        code: 'CREATION_ERROR',
      };
    }

    // 6. Step D: Seed initial categories and rooms
    try {
      const defaultCategories = [
        {
          hotel_id: createdHotelId,
          name: 'Deluxe Room',
          description: 'Spacious room with king bed and scenic view',
          base_rate: 3500,
          weekend_rate: 4200,
          max_occupancy: 2,
          extra_bed_rate: 800,
        },
        {
          hotel_id: createdHotelId,
          name: 'Super Deluxe Room',
          description: 'Premium luxury room with balcony',
          base_rate: 5000,
          weekend_rate: 6000,
          max_occupancy: 3,
          extra_bed_rate: 1000,
        },
        {
          hotel_id: createdHotelId,
          name: 'Executive Suite',
          description: 'Ultra-luxurious suite with private lounge',
          base_rate: 8500,
          weekend_rate: 10000,
          max_occupancy: 4,
          extra_bed_rate: 1500,
        },
      ];

      const { data: createdCategories } = (await admin
        .from('room_categories')
        .insert(defaultCategories)
        .select('id, name')) as { data: Array<{ id: string; name: string }> | null; error: any };

      if (createdCategories && createdCategories.length > 0) {
        const deluxeId = createdCategories[0].id;
        const superDeluxeId = createdCategories[1]?.id || deluxeId;
        const suiteId = createdCategories[2]?.id || deluxeId;

        const initialRooms = [
          { hotel_id: createdHotelId, category_id: deluxeId, room_number: '101', floor: 1, status: 'available' },
          { hotel_id: createdHotelId, category_id: deluxeId, room_number: '102', floor: 1, status: 'available' },
          { hotel_id: createdHotelId, category_id: superDeluxeId, room_number: '201', floor: 2, status: 'available' },
          { hotel_id: createdHotelId, category_id: superDeluxeId, room_number: '202', floor: 2, status: 'available' },
          { hotel_id: createdHotelId, category_id: suiteId, room_number: '301', floor: 3, status: 'available' },
        ];

        await admin.from('rooms').insert(initialRooms);
      }
    } catch (seedErr) {
      console.warn('Non-fatal initial room seeding note:', seedErr);
    }

    // 7. Step E: Auto-authenticate session for the newly registered owner
    try {
      const clientSupabase = createServerSupabaseClient();
      await clientSupabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (loginErr) {
      console.warn('Auto sign-in notice:', loginErr);
    }

    return {
      success: true,
      hotelName,
      ownerEmail: email,
      message: 'Hotel workspace created successfully! Your owner account is ready.',
    };
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') throw err;
    console.error('registerHotelAndOwner unexpected error:', err);

    // Clean up if dangling
    if (createdAuthUserId) {
      try {
        const admin = getAdminClient();
        await admin.auth.admin.deleteUser(createdAuthUserId);
      } catch {}
    }
    if (createdHotelId) {
      try {
        const admin = getAdminClient();
        await admin.from('hotels').delete().eq('id', createdHotelId);
      } catch {}
    }

    return {
      error: 'Something went wrong while connecting to the server. Please check your connection and try again.',
      code: 'CREATION_ERROR',
    };
  }
}

