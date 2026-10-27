import type { Metadata } from 'next';
import { getCurrentStaff } from '@/lib/auth/session';
import PricingClient from './PricingClient';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — Affordable Hotel Management Software',
  description:
    'Simple and affordable hotel PMS for independent hotels, boutique properties, homestays and guesthouses. Manage reservations, guests, billing, payments, inventory and reports with Grove PMS.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Grove PMS Pricing — Affordable Hotel Management Software',
    description:
      'Simple and affordable hotel PMS for independent hotels, boutique properties, homestays and guesthouses. Manage reservations, guests, billing, payments, inventory and reports with Grove PMS.',
    url: 'https://www.grovepms.me/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grove PMS Pricing — Affordable Hotel Management Software',
    description:
      'Simple and affordable hotel PMS for independent hotels, boutique properties, homestays and guesthouses. Manage reservations, guests, billing, payments, inventory and reports with Grove PMS.',
  },
};

export default async function PricingPage() {
  const staff = await getCurrentStaff();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Pricing', item: '/pricing' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <PricingClient
        staffName={staff?.full_name}
        staffRole={staff?.role}
      />
    </>
  );
}
