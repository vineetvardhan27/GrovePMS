import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../../lib/auth/session';
import { getServiceSupabaseClient } from '../../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const hotelId = staff.hotel_id;
    if (!hotelId) {
      return NextResponse.json({ error: 'No hotel property found for this account.' }, { status: 400 });
    }

    if (staff.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden. Only the property owner can modify official billing and tax details.' },
        { status: 403 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const customerName = (body.customer_name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const billingAddress = (body.billing_address || '').trim();
    const city = (body.city || '').trim();
    const state = (body.state || '').trim();
    const gstin = (body.gstin || '').trim().toUpperCase();

    if (!customerName) {
      return NextResponse.json({ error: 'Legal entity or contact name is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid invoicing email address is required.' }, { status: 400 });
    }

    if (gstin) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin)) {
        return NextResponse.json(
          { error: 'Invalid GSTIN format (must be 15 alphanumeric characters e.g. 07AAACH7409R1ZZ).' },
          { status: 400 }
        );
      }
    }

    const adminSupabase = getServiceSupabaseClient();

    const { data: updatedCustomer, error: upsertErr } = (await (adminSupabase
      .from('billing_customers') as any)
      .upsert(
        {
          hotel_id: hotelId,
          customer_name: customerName,
          email,
          phone: phone || null,
          billing_address: billingAddress || null,
          city: city || null,
          state: state || null,
          gstin: gstin || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'hotel_id' }
      )
      .select()
      .single()) as { data: any; error: any };

    if (upsertErr) {
      console.error('[BILLING CUSTOMER] Upsert error:', upsertErr.message);
      return NextResponse.json({ error: 'Failed to update billing profile in database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Billing details updated successfully.',
      customer: updatedCustomer,
    });
  } catch (err: any) {
    console.error('[BILLING CUSTOMER] Exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while saving billing details.' },
      { status: 500 }
    );
  }
}

