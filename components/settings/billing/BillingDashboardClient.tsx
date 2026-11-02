'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Building2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowLeft,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import CurrentPlanCard from './CurrentPlanCard';
import PaymentHistoryTable from './PaymentHistoryTable';
import CancelConfirmModal from './CancelConfirmModal';
import BillingDetailsModal from './BillingDetailsModal';
import InvoiceReceiptModal from './InvoiceReceiptModal';
import {
  BillingDashboardData,
  PaymentTransactionRecord,
  BillingCustomerRecord,
} from './types';

interface BillingDashboardClientProps {
  initialData: BillingDashboardData;
  initialTransactions: PaymentTransactionRecord[];
}

type SimulationState =
  | 'real'
  | 'active'
  | 'pending'
  | 'halted'
  | 'cancelled'
  | 'expired'
  | 'no_subscription';

export default function BillingDashboardClient({
  initialData,
  initialTransactions,
}: BillingDashboardClientProps) {
  const [data, setData] = useState<BillingDashboardData>(initialData);
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>(initialTransactions);
  const [simulationState, setSimulationState] = useState<SimulationState>('real');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<PaymentTransactionRecord | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Automatically dismiss toast after 5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Simulation switch for interactive QA & testing all 6 lifecycle states
  const applySimulation = (state: SimulationState) => {
    setSimulationState(state);
    if (state === 'real') {
      setData(initialData);
      setTransactions(initialTransactions);
      return;
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000);
    const pastPeriodEnd = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const gracePeriodEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const baseHotel = initialData.hotel;
    const baseCustomer = initialData.customer;

    switch (state) {
      case 'active':
        setData({
          hotel: baseHotel,
          user: initialData.user,
          customer: baseCustomer,
          subscription: {
            id: 'sub-sim-active',
            hotel_id: baseHotel.id,
            plan_name: 'Grove Operating System',
            razorpay_plan_id: 'plan_grove_monthly',
            razorpay_subscription_id: 'sub_sim_active_123',
            status: 'active',
            amount: 99900,
            currency: 'INR',
            billing_interval: 'monthly',
            current_period_start: new Date(now.getTime() - 12 * 86400000).toISOString(),
            current_period_end: periodEnd.toISOString(),
            next_billing_at: periodEnd.toISOString(),
            cancelled_at: null,
            created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
            updated_at: now.toISOString(),
          },
          access: {
            accessState: 'active',
            isAccessAllowed: true,
            reason: 'Subscription is active with valid recurring mandate.',
            paidThroughDate: periodEnd,
            isInGracePeriod: false,
            gracePeriodEndsAt: null,
            cancellationPending: false,
            gatewayStatus: 'active',
          },
        });
        break;

      case 'pending':
        setData({
          hotel: baseHotel,
          user: initialData.user,
          customer: baseCustomer,
          subscription: {
            id: 'sub-sim-pending',
            hotel_id: baseHotel.id,
            plan_name: 'Grove Operating System',
            razorpay_plan_id: 'plan_grove_monthly',
            razorpay_subscription_id: 'sub_sim_pnd_456',
            status: 'pending',
            amount: 99900,
            currency: 'INR',
            billing_interval: 'monthly',
            current_period_start: new Date(now.getTime() - 30 * 86400000).toISOString(),
            current_period_end: new Date(now.getTime() - 2 * 86400000).toISOString(),
            next_billing_at: now.toISOString(),
            cancelled_at: null,
            created_at: new Date(now.getTime() - 60 * 86400000).toISOString(),
            updated_at: now.toISOString(),
          },
          access: {
            accessState: 'grace_period',
            isAccessAllowed: true,
            reason: 'Recurring charge failed; Razorpay retrying. Operations remain enabled during grace period.',
            paidThroughDate: new Date(now.getTime() - 2 * 86400000),
            isInGracePeriod: true,
            gracePeriodEndsAt: gracePeriodEnd,
            cancellationPending: false,
            gatewayStatus: 'pending',
          },
        });
        break;

      case 'halted':
        setData({
          hotel: baseHotel,
          user: initialData.user,
          customer: baseCustomer,
          subscription: {
            id: 'sub-sim-halted',
            hotel_id: baseHotel.id,
            plan_name: 'Grove Operating System',
            razorpay_plan_id: 'plan_grove_monthly',
            razorpay_subscription_id: 'sub_sim_hlt_789',
            status: 'halted',
            amount: 99900,
            currency: 'INR',
            billing_interval: 'monthly',
            current_period_start: new Date(now.getTime() - 40 * 86400000).toISOString(),
            current_period_end: pastPeriodEnd.toISOString(),
            next_billing_at: null,
            cancelled_at: null,
            created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
            updated_at: now.toISOString(),
          },
          access: {
            accessState: 'suspended',
            isAccessAllowed: false,
            reason: 'Subscription halted due to multiple payment authorization failures.',
            paidThroughDate: pastPeriodEnd,
            isInGracePeriod: false,
            gracePeriodEndsAt: null,
            cancellationPending: false,
            gatewayStatus: 'halted',
          },
        });
        break;

      case 'cancelled':
        setData({
          hotel: baseHotel,
          user: initialData.user,
          customer: baseCustomer,
          subscription: {
            id: 'sub-sim-cancelled',
            hotel_id: baseHotel.id,
            plan_name: 'Grove Operating System',
            razorpay_plan_id: 'plan_grove_monthly',
            razorpay_subscription_id: 'sub_sim_cnc_999',
            status: 'cancelled',
            amount: 99900,
            currency: 'INR',
            billing_interval: 'monthly',
            current_period_start: new Date(now.getTime() - 10 * 86400000).toISOString(),
            current_period_end: periodEnd.toISOString(),
            next_billing_at: null,
            cancelled_at: now.toISOString(),
            created_at: new Date(now.getTime() - 60 * 86400000).toISOString(),
            updated_at: now.toISOString(),
          },
          access: {
            accessState: 'active',
            isAccessAllowed: true,
            reason: `Subscription cancelled, but access is retained through prepaid period ending ${periodEnd.toLocaleDateString('en-IN')}.`,
            paidThroughDate: periodEnd,
            isInGracePeriod: false,
            gracePeriodEndsAt: null,
            cancellationPending: true,
            gatewayStatus: 'cancelled',
          },
        });
        break;

      case 'expired':
        setData({
          hotel: baseHotel,
          user: initialData.user,
          customer: baseCustomer,
          subscription: {
            id: 'sub-sim-expired',
            hotel_id: baseHotel.id,
            plan_name: 'Grove Operating System',
            razorpay_plan_id: 'plan_grove_monthly',
            razorpay_subscription_id: 'sub_sim_exp_000',
            status: 'expired',
            amount: 99900,
            currency: 'INR',
            billing_interval: 'monthly',
            current_period_start: new Date(now.getTime() - 60 * 86400000).toISOString(),
            current_period_end: pastPeriodEnd.toISOString(),
            next_billing_at: null,
            cancelled_at: pastPeriodEnd.toISOString(),
            created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
            updated_at: now.toISOString(),
          },
          access: {
            accessState: 'expired',
            isAccessAllowed: false,
            reason: 'Subscription agreement expired.',
            paidThroughDate: pastPeriodEnd,
            isInGracePeriod: false,
            gracePeriodEndsAt: null,
            cancellationPending: false,
            gatewayStatus: 'expired',
          },
        });
        break;

      case 'no_subscription':
        setData({
          hotel: baseHotel,
          user: initialData.user,
          customer: null,
          subscription: null,
          access: {
            accessState: 'trial',
            isAccessAllowed: true,
            reason: 'Free onboarding trial active for new property.',
            paidThroughDate: new Date(now.getTime() + 10 * 86400000),
            isInGracePeriod: false,
            gracePeriodEndsAt: null,
            cancellationPending: false,
            gatewayStatus: 'none',
          },
        });
        break;
    }
  };

  // Real API Actions
  const handleCancelConfirm = async () => {
    const res = await fetch('/api/billing/subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelImmediately: false }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to cancel subscription.');
    }

    setData((prev) => ({
      ...prev,
      subscription: result.subscription,
      access: result.access,
    }));

    setToast({
      type: 'success',
      message: 'Subscription cancelled. Your paid-through period will be respected.',
    });
  };

  const handleResume = async () => {
    setIsResuming(true);
    try {
      const res = await fetch('/api/billing/subscription/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to resume subscription.');
      }

      setData((prev) => ({
        ...prev,
        subscription: result.subscription,
        access: result.access,
      }));

      setToast({
        type: 'success',
        message: 'Subscription successfully resumed and reactivated.',
      });
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Failed to resume subscription.' });
    } finally {
      setIsResuming(false);
    }
  };

  const handleSaveBillingCustomer = async (formData: Partial<BillingCustomerRecord>) => {
    const res = await fetch('/api/billing/subscription/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to update billing details.');
    }

    setData((prev) => ({
      ...prev,
      customer: result.customer,
    }));

    setToast({
      type: 'success',
      message: 'Official billing and tax details updated successfully.',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 shadow-md animate-fadeIn transition-all ${
            toast.type === 'success'
              ? 'bg-status-green/10 border-status-green/25 text-status-green'
              : 'bg-status-red/10 border-status-red/25 text-status-red'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
       * INTERACTIVE STATE TESTING TOOLBAR (Phase 5 Requirement)
       * Allows instant inspection across all 6 requested states:
       * 1. Active subscription
       * 2. Pending subscription
       * 3. Halted subscription
       * 4. Cancelled subscription
       * 5. Expired subscription
       * 6. Hotel without a subscription
       * ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-3 sm:p-4 bg-white/70 backdrop-blur-md border border-[#1C2D29]/12 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
            <span className="text-xs font-semibold text-[#142320]">
              Lifecycle Testing Inspector:
            </span>
            <span className="text-[11px] text-ink-muted hidden md:inline">
              (Test All 6 Required States)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => applySimulation('real')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                simulationState === 'real'
                  ? 'bg-brand-forest text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              Live DB
            </button>

            <button
              type="button"
              onClick={() => applySimulation('active')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                simulationState === 'active'
                  ? 'bg-status-green text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              1. Active
            </button>

            <button
              type="button"
              onClick={() => applySimulation('pending')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                simulationState === 'pending'
                  ? 'bg-status-amber text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              2. Pending
            </button>

            <button
              type="button"
              onClick={() => applySimulation('halted')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                simulationState === 'halted'
                  ? 'bg-status-red text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              3. Halted
            </button>

            <button
              type="button"
              onClick={() => applySimulation('cancelled')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                simulationState === 'cancelled'
                  ? 'bg-status-amber text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              4. Cancelled (Prepaid)
            </button>

            <button
              type="button"
              onClick={() => applySimulation('expired')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                simulationState === 'expired'
                  ? 'bg-status-red text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              5. Expired
            </button>

            <button
              type="button"
              onClick={() => applySimulation('no_subscription')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                simulationState === 'no_subscription'
                  ? 'bg-brand-forest text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              6. No Subscription
            </button>
          </div>
        </div>
      </div>

      {/* ── 1. CURRENT PLAN CARD ── */}
      <CurrentPlanCard
        data={data}
        onOpenCancelModal={() => setIsCancelModalOpen(true)}
        onOpenResumeModal={handleResume}
        onOpenBillingModal={() => setIsBillingModalOpen(true)}
        isResuming={isResuming}
      />

      {/* ── 2. PAYMENT & INVOICING HISTORY TABLE ── */}
      <PaymentHistoryTable
        transactions={transactions}
        onSelectReceipt={(tx) => setSelectedReceiptTx(tx)}
      />

      {/* ── MODALS ── */}
      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        periodEndDate={data.subscription?.current_period_end}
        hotelName={data.hotel.name}
      />

      <BillingDetailsModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        currentCustomer={data.customer}
        onSave={handleSaveBillingCustomer}
      />

      <InvoiceReceiptModal
        isOpen={Boolean(selectedReceiptTx)}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
        customer={data.customer}
        hotelName={data.hotel.name}
      />
    </div>
  );
}

