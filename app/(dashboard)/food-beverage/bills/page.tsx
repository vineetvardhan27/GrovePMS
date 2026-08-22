import { redirect } from 'next/navigation';
import { FB_ROUTES } from '../../../../lib/fb/routes';

export const dynamic = 'force-dynamic';

export default function FBBillsRedirectPage() {
  redirect(FB_ROUTES.BILLS);
}
