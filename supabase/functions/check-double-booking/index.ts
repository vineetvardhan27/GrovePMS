// Supabase Edge Function: check-double-booking
// Enforces server-side double-booking prevention per Rules.md §2

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { hotel_id, room_id, check_in_date, check_out_date, exclude_booking_id } = await req.json();

    if (!hotel_id || !room_id || !check_in_date || !check_out_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: hotel_id, room_id, check_in_date, check_out_date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query overlapping active bookings for the same room
    let query = supabase
      .from('bookings')
      .select('id, booking_number, check_in_date, check_out_date, booking_status')
      .eq('hotel_id', hotel_id)
      .eq('room_id', room_id)
      .neq('booking_status', 'cancelled')
      .lt('check_in_date', check_out_date)
      .gt('check_out_date', check_in_date);

    if (exclude_booking_id) {
      query = query.neq('id', exclude_booking_id);
    }

    const { data: conflicts, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isAvailable = !conflicts || conflicts.length === 0;

    return new Response(
      JSON.stringify({
        is_available: isAvailable,
        conflicts: conflicts || [],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
