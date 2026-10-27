import type { Metadata } from 'next';
import FaqsClient from './FaqsClient';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema, getFaqSchema } from '@/lib/seo/structuredData';
import { faqsData } from './faqsData';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs)',
  description:
    'Got questions about Grove PMS? Read answers regarding front desk operations, GST invoicing, housekeeping status, multi-property isolation, and onboarding.',
  alternates: {
    canonical: '/faqs',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQs) | Grove PMS',
    description:
      'Got questions about Grove PMS? Read answers regarding front desk operations, GST invoicing, housekeeping status, multi-property isolation, and onboarding.',
    url: 'https://www.grovepms.me/faqs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions (FAQs) | Grove PMS',
    description:
      'Got questions about Grove PMS? Read answers regarding front desk operations, GST invoicing, housekeeping status, multi-property isolation, and onboarding.',
  },
};

export default function FAQsPage() {
  const faqSchema = getFaqSchema(faqsData);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'FAQs', item: '/faqs' },
  ]);

  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      <FaqsClient />
    </>
  );
}
