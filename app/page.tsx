import { redirect } from 'next/navigation';
import { getCurrentStaff } from '../lib/auth/session';

export default async function HomePage() {
  const staff = await getCurrentStaff();
  if (staff) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
