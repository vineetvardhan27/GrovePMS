import type { Metadata } from 'next';
import { getCurrentStaff } from '@/lib/auth/session';
import PricingClient from './PricingClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Grove PMS Pricing — Affordable Hotel Management Software',
  description:
    'Simple and affordable hotel PMS for independent hotels, boutique properties, homestays and guesthouses. Manage reservations, guests, billing, payments, inventory and reports with Grove PMS.',
  openGraph: {
    title: 'Grove PMS Pricing — Affordable Hotel Management Software',
    description:
      'Simple and affordable hotel PMS for independent hotels, boutique properties, homestays and guesthouses. Manage reservations, guests, billing, payments, inventory and reports with Grove PMS.',
    type: 'website',
  },
};

export default async function PricingPage() {
  const staff = await getCurrentStaff();

  return (
    <PricingClient
      staffName={staff?.full_name}
      staffRole={staff?.role}
    />
  );
}
