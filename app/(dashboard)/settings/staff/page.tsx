import { getCurrentStaff } from '../../../../lib/auth/session';
import { getHotel } from '../../../../lib/hotels/queries';
import { getHotelStaffMembers } from '../../../../lib/staff/actions';
import StaffManager from './StaffManager';
import { redirect } from 'next/navigation';
import SettingsHeader from '../../../../components/settings/SettingsHeader';

export const dynamic = 'force-dynamic';

export default async function StaffSettingsPage() {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect('/login');
  }

  // Role gating: Owner only
  if (staff.role !== 'owner') {
    redirect('/dashboard?access_denied=true');
  }


  const [hotel, staffList] = await Promise.all([
    getHotel(staff.hotel_id),
    getHotelStaffMembers(staff.hotel_id),
  ]);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Staff & User Management"
        description="Configure staff accounts, operational roles, and property authorizations"
        currentPage="Staff / Users"
      />

      <StaffManager
        initialStaff={staffList}
        currentUserRole={staff.role}
        currentUserId={staff.id}
        hotelName={hotel.name}
      />
    </div>
  );
}
