import type { Metadata } from 'next';
import { getCurrentStaff } from '@/lib/auth/session';
import { getHotel } from '@/lib/hotels/queries';
import SubscriptionClient from './SubscriptionClient';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { PrepopulatedProfile } from '@/components/subscription/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Subscribe to Grove PMS — Checkout & Property Licensing',
  description:
    'Complete your hotel subscription for Grove Hospitality OS at ₹999/month. Transparent pricing, zero booking commissions, and instant workspace activation for independent hotels.',
  alternates: {
    canonical: '/subscription',
  },
  openGraph: {
    title: 'Subscribe to Grove PMS — Hotel Management Software Checkout',
    description:
      'Complete your hotel subscription for Grove Hospitality OS at ₹999/month. Transparent pricing, zero booking commissions, and instant workspace activation.',
    url: 'https://www.grovepms.me/subscription',
    type: 'website',
  },
};

export default async function SubscriptionPage() {
  const staff = await getCurrentStaff();
  let hotel = null;

  if (staff?.hotel_id) {
    try {
      hotel = await getHotel(staff.hotel_id);
    } catch (err) {
      console.error('Error fetching hotel for subscription checkout:', err);
    }
  }

  const prepopulatedProfile: PrepopulatedProfile = {
    hotelName: staff?.hotel_name || hotel?.name || '',
    ownerName: staff?.full_name || '',
    email: staff?.email || '',
    phone: hotel?.settings?.phone || hotel?.phone || '',
    billingAddress: hotel?.settings?.address || hotel?.address || '',
    city: hotel?.settings?.city || '',
    state: hotel?.settings?.state || '',
    pincode: hotel?.settings?.pin_code || '',
    gstin: hotel?.settings?.gst_number || '',
    isAuthenticated: Boolean(staff),
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Pricing', item: '/pricing' },
    { name: 'Subscription Checkout', item: '/subscription' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <SubscriptionClient
        staffName={staff?.full_name}
        staffRole={staff?.role}
        prepopulatedProfile={prepopulatedProfile}
      />
    </>
  );
}

