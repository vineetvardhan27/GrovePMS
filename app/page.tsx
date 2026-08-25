import { getCurrentStaff } from '../lib/auth/session';
import LandingPageClient from '../components/landing/LandingPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Grove — Hospitality OS',
  description:
    'The unified operating system for modern hospitality. Manage rooms, reservations, guests, billing, F&B, banquet events, housekeeping, inventory, and reporting from one connected platform.',
};

export default async function HomePage() {
  const staff = await getCurrentStaff();

  return (
    <LandingPageClient
      staffName={staff?.full_name}
      staffRole={staff?.role}
    />
  );
}
