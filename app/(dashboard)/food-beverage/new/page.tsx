import { getCurrentStaff } from '../../../../lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getFBMenuItemsWithDetails,
  getInHouseGuestsForFBBilling,
} from '../../../../lib/fb/queries';
import { getHotelSettings } from '../../../../lib/hotels/queries';
import NewFBBillForm from '../../../../components/fb/NewFBBillForm';

export const dynamic = 'force-dynamic';

export default async function NewFBBillPage() {
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect('/login');
  }

  const hotelId = staff.hotel_id;

  const [menuItems, inHouseGuests, hotelSettings] = await Promise.all([
    getFBMenuItemsWithDetails(hotelId),
    getInHouseGuestsForFBBilling(hotelId),
    getHotelSettings(hotelId),
  ]);

  const defaultGstRate = Number(hotelSettings.gst_percentage ?? hotelSettings.gst_rate ?? 5);

  return (
    <NewFBBillForm
      menuItems={menuItems}
      inHouseGuests={inHouseGuests}
      defaultGstRate={defaultGstRate}
    />
  );
}
