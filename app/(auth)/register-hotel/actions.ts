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
  hotelId?: string;
  ownerFullName?: string;
  propertyType?: string;
  totalRooms?: number;
  totalFloors?: number;
  selectedPlan?: string;
  city?: string;
  state?: string;
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
  // ── Step 1: Property Identity ──
  const hotelName = (formData.get('hotel_name') as string)?.trim();
  const propertyType = (formData.get('property_type') as string)?.trim() || 'boutique';
  const propertyDescription = (formData.get('property_description') as string)?.trim() || '';

  // ── Step 2: Location & Contact ──
  const country = (formData.get('country') as string)?.trim() || 'India';
  const state = (formData.get('state') as string)?.trim() || 'Sikkim';
  const city = (formData.get('city') as string)?.trim() || 'Gangtok';
  const address = (formData.get('address') as string)?.trim() || '';
  const pinCode = (formData.get('pin_code') as string)?.trim() || '737101';
  const phone = (formData.get('phone') as string)?.trim() || '';
  const businessEmail = (formData.get('business_email') as string)?.trim() || '';
  const website = (formData.get('website') as string)?.trim() || '';
  const gstNumber = (formData.get('gst_number') as string)?.trim() || '';

  // ── Step 3: Rooms & Operations (Visual Builder Payload) ──
  const propertyLayoutJson = (formData.get('property_layout_json') as string)?.trim() || '';
  const totalFloors = Math.max(1, Math.min(30, parseInt((formData.get('total_floors') as string) || '3', 10) || 3));
  const totalRooms = Math.max(1, Math.min(250, parseInt((formData.get('total_rooms') as string) || '15', 10) || 15));
  const checkInTime = (formData.get('check_in_time') as string)?.trim() || '12:00';
  const checkOutTime = (formData.get('check_out_time') as string)?.trim() || '11:00';
  const facilitiesRaw = (formData.get('facilities') as string) || '';

  // ── Step 4: Owner Account & Subscription ──
  const ownerFullName = (formData.get('owner_full_name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const ownerPhone = (formData.get('owner_phone') as string)?.trim() || phone;
  const password = (formData.get('password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();
  const selectedPlan = (formData.get('selected_plan') as string)?.trim() || 'monthly_999';

  // 1. Validation
  if (!hotelName) {
    return {
      error: 'Please enter your Hotel or Property Name.',
      code: 'VALIDATION_ERROR',
    };
  }

  if (!ownerFullName || !email || !password) {
    return {
      error: 'Please provide all required owner fields: Owner Name, Login Email, and Password.',
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

    // Parse facilities
    let parsedFacilities: string[] = ['wifi', 'room_service', 'housekeeping'];
    if (facilitiesRaw) {
      try {
        const parsed = JSON.parse(facilitiesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedFacilities = parsed;
        }
      } catch {
        const split = facilitiesRaw.split(',').map((s) => s.trim()).filter(Boolean);
        if (split.length > 0) parsedFacilities = split;
      }
    }

    // Parse Visual Room Builder Layout JSON if available
    let parsedLayout: {
      categories?: Array<{
        id: string;
        name: string;
        description: string;
        base_rate: number;
        weekend_rate: number | null;
        max_occupancy: number;
        extra_bed_rate: number;
        child_charge: number;
        adult_capacity: number;
        child_capacity: number;
        bed_count: number;
        bed_type: string;
        amenities: string[];
        color: string;
      }>;
      floors?: Array<{
        id: string;
        floorNumber: number;
        name: string;
        startingRoomNumber: number;
        allocations: Array<{ id: string; categoryId: string; quantity: number }>;
      }>;
      generatedRooms?: Array<{
        id: string;
        roomNumber: string;
        floor: number;
        floorName: string;
        categoryId: string;
        categoryName: string;
        baseRate: number;
        weekendRate: number | null;
      }>;
    } | null = null;

    if (propertyLayoutJson) {
      try {
        parsedLayout = JSON.parse(propertyLayoutJson);
      } catch (parseErr) {
        console.warn('Could not parse property_layout_json:', parseErr);
      }
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
      country,
      pin_code: pinCode,
      phone: phone || ownerPhone || '+91 98000 00000',
      email: businessEmail || email,
      website: website || null,
      property_type: propertyType,
      property_description: propertyDescription,
      total_floors: totalFloors,
      total_rooms: totalRooms,
      facilities: parsedFacilities,
      selected_plan: selectedPlan,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      checkin_time: checkInTime,
      checkout_time: checkOutTime,
      currency_symbol: '₹',
      currency_code: 'INR',
      logo_url: null,
      property_layout: parsedLayout || null,
    };

    const formattedAddress = address
      ? `${address}, ${city}, ${state} - ${pinCode}, ${country}`
      : `${city}, ${state}, ${country}`;

    const { data: newHotel, error: hotelErr } = (await admin
      .from('hotels')
      .insert({
        name: hotelName,
        slug: hotelSlug,
        address: formattedAddress,
        phone: phone || ownerPhone || '+91 98000 00000',
        email: businessEmail || email,
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
        phone: ownerPhone,
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

    // 6. Step D: Seed initial categories and rooms matching the visual builder layout
    try {
      if (
        parsedLayout?.categories &&
        parsedLayout.categories.length > 0 &&
        parsedLayout.generatedRooms &&
        parsedLayout.generatedRooms.length > 0
      ) {
        // ── 6A. Insert configured categories from Visual Room Builder ──
        const categoryInsertions = parsedLayout.categories.map((c) => ({
          hotel_id: createdHotelId,
          name: c.name,
          description: c.description || null,
          base_rate: Number(c.base_rate) || 2500,
          weekend_rate: c.weekend_rate ? Number(c.weekend_rate) : null,
          max_occupancy: Number(c.max_occupancy) || 2,
          extra_bed_rate: c.extra_bed_rate ? Number(c.extra_bed_rate) : 0,
        }));

        const { data: createdCategories, error: catInsertErr } = (await admin
          .from('room_categories')
          .insert(categoryInsertions)
          .select('id, name')) as { data: Array<{ id: string; name: string }> | null; error: any };

        if (createdCategories && createdCategories.length > 0) {
          // Map client category ID/Name to database UUID
          const categoryMap = new Map<string, string>();
          parsedLayout.categories.forEach((catObj) => {
            const match =
              createdCategories.find(
                (cc) => cc.name.trim().toLowerCase() === catObj.name.trim().toLowerCase()
              ) || createdCategories[0];
            categoryMap.set(catObj.id, match.id);
            categoryMap.set(catObj.name, match.id);
          });

          // ── 6B. Insert exact generated rooms from Visual Room Builder ──
          const roomsToInsert = parsedLayout.generatedRooms.map((gr) => {
            const dbCatId =
              categoryMap.get(gr.categoryId) ||
              categoryMap.get(gr.categoryName) ||
              createdCategories[0].id;

            return {
              hotel_id: createdHotelId,
              category_id: dbCatId,
              room_number: gr.roomNumber,
              floor: gr.floor || 1,
              status: 'available' as const,
              housekeeping_status: 'clean' as const,
            };
          });

          await admin.from('rooms').insert(roomsToInsert);
        }
      } else {
        // ── 6B. Fallback Standard Seeding ──
        const defaultCategories = [
          {
            hotel_id: createdHotelId,
            name: 'Deluxe Room',
            description: 'Spacious guest room with scenic mountain views and king-size bedding.',
            base_rate: 3500,
            weekend_rate: 4200,
            max_occupancy: 3,
            extra_bed_rate: 800,
          },
          {
            hotel_id: createdHotelId,
            name: 'Super Deluxe Room',
            description: 'Upgraded luxury room with private balcony and premium hospitality amenities.',
            base_rate: 5000,
            weekend_rate: 6000,
            max_occupancy: 3,
            extra_bed_rate: 1000,
          },
          {
            hotel_id: createdHotelId,
            name: 'Executive Suite',
            description: 'Ultra-luxurious suite featuring private lounge, panoramic valley views, and master bath.',
            base_rate: 8500,
            weekend_rate: 10200,
            max_occupancy: 4,
            extra_bed_rate: 1500,
          },
        ];

        const { data: createdCategories } = (await admin
          .from('room_categories')
          .insert(defaultCategories)
          .select('id, name')) as { data: Array<{ id: string; name: string }> | null; error: any };

        if (createdCategories && createdCategories.length > 0) {
          const roomsToCreate = [];
          const roomsPerFloor = Math.ceil(totalRooms / totalFloors);

          let currentRoomCount = 0;
          for (let floor = 1; floor <= totalFloors && currentRoomCount < totalRooms; floor++) {
            const roomsOnThisFloor = Math.min(roomsPerFloor, totalRooms - currentRoomCount);
            for (let r = 1; r <= roomsOnThisFloor; r++) {
              const roomNum = `${floor}${r < 10 ? '0' + r : r}`;
              const catIndex = currentRoomCount % createdCategories.length;
              const categoryId = createdCategories[catIndex].id;

              roomsToCreate.push({
                hotel_id: createdHotelId,
                category_id: categoryId,
                room_number: roomNum,
                floor: floor,
                status: 'available' as const,
                housekeeping_status: 'clean' as const,
              });
              currentRoomCount++;
            }
          }

          if (roomsToCreate.length > 0) {
            await admin.from('rooms').insert(roomsToCreate);
          }
        }
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
      hotelId: createdHotelId,
      ownerFullName,
      propertyType,
      totalRooms,
      totalFloors,
      selectedPlan,
      city,
      state,
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
