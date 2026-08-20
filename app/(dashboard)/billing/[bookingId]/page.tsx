import { generateBill } from '../../../../lib/billing/actions';
import { getBookingById } from '../../../../lib/bookings/queries';
import BillView from '../../../../components/billing/BillView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface BillPageProps {
  params: { bookingId: string };
  searchParams?: { gst?: string };
}


export default async function BillPage({ params, searchParams }: BillPageProps) {
  const includeGst = searchParams?.gst !== 'false'; // GST on by default

  const booking = await getBookingById(params.bookingId);
  if (!booking) {
    notFound();
  }

  const bill = await generateBill(params.bookingId, includeGst);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href="/billing"
          className="p-2 rounded-lg bg-white border border-border-subtle text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-display text-brand-forest">Tax Invoice / Guest Folio</h1>
          <p className="text-body text-ink-muted">
            Booking #{booking.booking_number} — {booking.guest.full_name}
          </p>
        </div>
      </div>

      <BillView
        initialBill={bill}
        bookingStatus={booking.booking_status}
      />
    </div>
  );
}
