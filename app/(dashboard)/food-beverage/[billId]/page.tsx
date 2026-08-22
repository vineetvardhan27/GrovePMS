import { getCurrentStaff } from '../../../../lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { getFBBillById } from '../../../../lib/fb/queries';
import { getHotelSettings } from '../../../../lib/hotels/queries';
import FBInvoiceView from '../../../../components/fb/FBInvoiceView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { billId: string };
}

export default async function FBBillDetailPage({ params }: PageProps) {
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect('/login');
  }

  const [bill, hotelSettings] = await Promise.all([
    getFBBillById(params.billId, staff.hotel_id),
    getHotelSettings(staff.hotel_id),
  ]);

  if (!bill) {
    notFound();
  }

  return (
    <FBInvoiceView
      bill={bill}
      hotelSettings={hotelSettings}
      userRole={staff.role}
    />
  );
}
