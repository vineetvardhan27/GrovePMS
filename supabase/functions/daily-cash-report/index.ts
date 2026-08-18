// Supabase Edge Function: daily-cash-report
// Aggregates cash and digital collections for the daily manager/owner report

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
    const { hotel_id, target_date } = await req.json();

    if (!hotel_id) {
      return new Response(
        JSON.stringify({ error: 'Missing hotel_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reportDate = target_date || new Date().toISOString().split('T')[0];
    const startIso = `${reportDate}T00:00:00.000Z`;
    const endIso = `${reportDate}T23:59:59.999Z`;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query all payments recorded on this target date
    const { data: payments, error: payErr } = await supabase
      .from('payments')
      .select('amount, payment_mode, payment_type')
      .eq('hotel_id', hotel_id)
      .gte('created_at', startIso)
      .lte('created_at', endIso);

    if (payErr) {
      return new Response(JSON.stringify({ error: payErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let cashCollection = 0;
    let upiCollection = 0;
    let cardCollection = 0;
    let bankCollection = 0;
    let otherCollection = 0;
    let totalRefunds = 0;

    (payments || []).forEach((p: any) => {
      const amount = Number(p.amount) || 0;
      if (p.payment_type === 'refund') {
        totalRefunds += amount;
        return;
      }

      switch (p.payment_mode) {
        case 'cash':
          cashCollection += amount;
          break;
        case 'upi':
          upiCollection += amount;
          break;
        case 'card':
          cardCollection += amount;
          break;
        case 'bank_transfer':
          bankCollection += amount;
          break;
        default:
          otherCollection += amount;
          break;
      }
    });

    const grossCollection = cashCollection + upiCollection + cardCollection + bankCollection + otherCollection;
    const netCollection = grossCollection - totalRefunds;

    return new Response(
      JSON.stringify({
        hotel_id,
        date: reportDate,
        cash_collection: cashCollection,
        upi_collection: upiCollection,
        card_collection: cardCollection,
        bank_collection: bankCollection,
        other_collection: otherCollection,
        gross_collection: grossCollection,
        refunds: totalRefunds,
        net_collection: netCollection,
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
