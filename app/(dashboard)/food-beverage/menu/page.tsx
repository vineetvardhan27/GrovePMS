import { redirect } from 'next/navigation';
import { FB_ROUTES } from '../../../../lib/fb/routes';

export const dynamic = 'force-dynamic';

export default function FBMenuRedirectPage() {
  redirect(FB_ROUTES.MENU);
}
