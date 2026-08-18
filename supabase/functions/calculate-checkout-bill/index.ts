// Supabase Edge Function: calculate-checkout-bill
// Calculates checkout bills with dynamic GST rate from hotel settings per PRD §6.7 & Rules.md §2

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
    const { booking_id, include_gst } = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'Missing booking_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch booking with hotel settings
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (room_number),
        guests:guest_id (full_name, phone),
        hotels:hotel_id (name, settings)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingErr || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch payments made against this booking
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, payment_type')
      .eq('booking_id', booking_id);

    const totalPaid = (payments || []).reduce((acc: number, p: any) => {
      return p.payment_type === 'refund' ? acc - Number(p.amount) : acc + Number(p.amount);
    }, 0);

    const roomCharges = Number(booking.total_amount);
    const hotelSettings = booking.hotels?.settings || {};
    const applyGst = include_gst !== undefined ? include_gst : (hotelSettings.gst_enabled ?? true);
    const gstRate = Number(hotelSettings.gst_percentage || 12);

    let gstAmount = 0;
    let netTotal = roomCharges;

    if (applyGst) {
      gstAmount = Math.round(((roomCharges * gstRate) / 100) * 100) / 100;
      netTotal = roomCharges + gstAmount;
    }

    const balanceDue = Math.max(0, netTotal - totalPaid);

    return new Response(
      JSON.stringify({
        booking_id,
        booking_number: booking.booking_number,
        guest_name: booking.guests?.full_name,
        room_number: booking.rooms?.room_number,
        room_charges: roomCharges,
        gst_enabled: applyGst,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        net_total: netTotal,
        total_paid: totalPaid,
        balance_due: balanceDue,
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
