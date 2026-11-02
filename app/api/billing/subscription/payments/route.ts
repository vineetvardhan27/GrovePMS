import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../../lib/auth/session';
import { getServiceSupabaseClient } from '../../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const hotelId = staff.hotel_id;
    if (!hotelId) {
      return NextResponse.json({ error: 'No hotel property found for this staff member.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const adminSupabase = getServiceSupabaseClient();

    // Query payment_transactions table for this hotel property
    const { data: transactions, error, count } = (await (adminSupabase
      .from('payment_transactions') as any)
      .select('*', { count: 'exact' })
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)) as { data: any[]; error: any; count: number | null };

    if (error) {
      console.error('[BILLING PAYMENTS] Error fetching payment transactions:', error.message);
      return NextResponse.json({ error: 'Failed to retrieve payment transactions.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (err: any) {
    console.error('[BILLING PAYMENTS] Exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load payment transactions.' },
      { status: 500 }
    );
  }
}

