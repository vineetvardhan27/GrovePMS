import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = {
  title: 'Contact Sales, Product Demos & Hotel Support',
  description:
    'Contact the Grove PMS team for hotel demonstrations, property onboarding, multi-property pricing, and 24/7 technical support for hospitality operators.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Grove PMS | Sales, Product Demos & Hotel Support',
    description:
      'Contact the Grove PMS team for hotel demonstrations, property onboarding, multi-property pricing, and 24/7 technical support for hospitality operators.',
    url: 'https://www.grovepms.me/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Grove PMS | Sales, Product Demos & Hotel Support',
    description:
      'Contact the Grove PMS team for hotel demonstrations, property onboarding, multi-property pricing, and 24/7 technical support for hospitality operators.',
  },
};

export default function ContactPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Contact', item: '/contact' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ContactClient />
    </>
  );
}
