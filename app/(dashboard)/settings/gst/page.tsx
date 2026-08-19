import { getHotel } from '../../../../lib/hotels/queries';
import { getCurrentStaff } from '../../../../lib/auth/session';
import GSTSettingsForm from './GSTSettingsForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function GSTSettingsPage() {
  const staff = await getCurrentStaff();

  // Role check: Only owner & manager
  if (staff && staff.role !== 'owner' && staff.role !== 'manager') {
    redirect('/dashboard?access_denied=true');
  }

  const hotel = await getHotel();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-border-subtle">
        <Link
          href="/settings"
          className="p-2 rounded-lg bg-white border border-border-subtle text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-display text-brand-forest">GST &amp; Tax Settings</h1>
          <p className="text-body text-ink-muted">
            Configure dynamic GST percentage, GSTIN, and tax invoice headers stored in hotels.settings
          </p>
        </div>
      </div>

      <GSTSettingsForm
        hotelId={hotel.id}
        initialSettings={hotel.settings}
        hotelName={hotel.name}
      />
    </div>
  );
}
