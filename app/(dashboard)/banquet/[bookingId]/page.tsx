import { getCurrentStaff } from '../../../../lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { getBanquetFolio, getBanquetInvoice } from '../../../../lib/banquet/queries';
import BanquetEventWorkspace from '../../../../components/banquet/BanquetEventWorkspace';

export const dynamic = 'force-dynamic';

interface BanquetBookingPageProps {
  params: {
    bookingId: string;
  };
}

export default async function BanquetBookingPage({ params }: BanquetBookingPageProps) {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect('/login');
  }

  const [folio, invoice] = await Promise.all([
    getBanquetFolio(params.bookingId),
    getBanquetInvoice(params.bookingId),
  ]);

  if (!folio || !invoice) {
    notFound();
  }

  return (
    <BanquetEventWorkspace
      folio={folio}
      invoice={invoice}
      userRole={staff.role}
    />
  );
}
