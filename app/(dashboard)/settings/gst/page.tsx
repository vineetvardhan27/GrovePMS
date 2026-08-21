import { getHotel } from '../../../../lib/hotels/queries';
import { getCurrentStaff } from '../../../../lib/auth/session';
import GSTSettingsForm from './GSTSettingsForm';
import { redirect } from 'next/navigation';
import SettingsHeader from '../../../../components/settings/SettingsHeader';

export default async function GSTSettingsPage() {
  const staff = await getCurrentStaff();

  // Role check: Only owner & manager
  if (staff && staff.role !== 'owner' && staff.role !== 'manager') {
    redirect('/dashboard?access_denied=true');
  }

  const hotel = await getHotel();

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="GST & Tax Settings"
        description="Configure dynamic GST percentage, GSTIN, and tax invoice headers stored in hotels.settings"
        currentPage="GST & Taxes"
      />

      <GSTSettingsForm
        hotelId={hotel.id}
        initialSettings={hotel.settings}
        hotelName={hotel.name}
      />
    </div>
  );
}
