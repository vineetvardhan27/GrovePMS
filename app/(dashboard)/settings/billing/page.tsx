import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';
import PageHeader from '../../../../components/shared/PageHeader';
import { getCurrentStaff } from '../../../../lib/auth/session';
import {
  getHotelSubscription,
  getHotelPaymentTransactions,
  getHotelBillingCustomer,
} from '../../../../lib/subscription/queries';
import { resolveSubscriptionAccess } from '../../../../lib/subscription/lifecycle';
import BillingDashboardClient from '../../../../components/settings/billing/BillingDashboardClient';
import { BillingDashboardData } from '../../../../components/settings/billing/types';

export const dynamic = 'force-dynamic';

export default async function BillingSettingsPage() {
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect('/login?redirectTo=/settings/billing');
  }

  const hotelId = staff.hotel_id;
  if (!hotelId) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink">No Hotel Associated</h2>
        <p className="text-sm text-ink-muted">
          Your staff account is not linked to any active hotel property.
        </p>
      </div>
    );
  }

  // Fetch initial server state
  const [subscription, transactions, customer] = await Promise.all([
    getHotelSubscription(hotelId),
    getHotelPaymentTransactions(hotelId),
    getHotelBillingCustomer(hotelId),
  ]);

  const access = resolveSubscriptionAccess(subscription);
  const canManage = staff.role === 'owner';

  const initialData: BillingDashboardData = {
    hotel: {
      id: hotelId,
      name: staff.hotel_name || 'Hotel Property',
    },
    user: {
      role: staff.role,
      canManage,
    },
    subscription,
    access,
    customer,
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Billing & Subscription"
          description="Manage your Grove PMS SaaS subscription, payment methods, recurring billing, and invoices"
          icon={CreditCard}
        />
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-brand-sand/50 text-ink border border-[#1C2D29]/15 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </Link>
      </div>

      {/* Main Billing Management Client */}
      <BillingDashboardClient
        initialData={initialData}
        initialTransactions={transactions}
      />
    </div>
  );
}

