import type { Metadata } from 'next';
import LandingPageClient from '../components/landing/LandingPageClient';
import JsonLd from '@/components/seo/JsonLd';
import { getSoftwareApplicationSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = {
  title: 'Grove PMS | Hotel Property Management Software',
  description:
    'Simplify hotel operations with Grove PMS. Manage reservations, room availability, guest records, billing, payments, inventory, and reports in one platform.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Grove PMS | Hotel Property Management Software',
    description:
      'Simplify hotel operations with Grove PMS. Manage reservations, room availability, guest records, billing, payments, inventory, and reports in one platform.',
    url: 'https://www.grovepms.me/',
    type: 'website',
    images: [
      {
        url: '/Grove.png',
        width: 512,
        height: 512,
        alt: 'Grove PMS — Hotel Property Management Software',
      },
    ],
  },
};

export default function HomePage() {
  const softwareSchema = getSoftwareApplicationSchema();

  return (
    <>
      <JsonLd data={softwareSchema} />
      <LandingPageClient />
    </>
  );
}

