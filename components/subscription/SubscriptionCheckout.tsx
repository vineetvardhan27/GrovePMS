'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Lock,
  Layers,
  CheckCircle2,
  Clock,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import HotelDetailsForm from './HotelDetailsForm';
import BillingDetailsForm from './BillingDetailsForm';
import OrderSummary from './OrderSummary';
import SubscriptionStatus from './SubscriptionStatus';
import PaymentResult from './PaymentResult';
import {
  CheckoutFormData,
  CheckoutErrors,
  CheckoutUIState,
  PrepopulatedProfile,
} from './types';

interface SubscriptionCheckoutProps {
  prepopulatedProfile?: PrepopulatedProfile;
}

export default function SubscriptionCheckout({
  prepopulatedProfile,
}: SubscriptionCheckoutProps) {
  // Initialize form data with prepopulated profile information where available
  const [formData, setFormData] = useState<CheckoutFormData>({
    hotelName: prepopulatedProfile?.hotelName || '',
    ownerName: prepopulatedProfile?.ownerName || '',
    email: prepopulatedProfile?.email || '',
    phone: prepopulatedProfile?.phone || '',
    billingAddress: prepopulatedProfile?.billingAddress || '',
    city: prepopulatedProfile?.city || '',
    state: prepopulatedProfile?.state || '',
    pincode: prepopulatedProfile?.pincode || '',
    gstin: prepopulatedProfile?.gstin || '',
    agreeTerms: false,
    includeOnboarding: false,
  });

  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [uiState, setUiState] = useState<CheckoutUIState>('checkout');
  const [showStateToolbar, setShowStateToolbar] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverNotice, setServerNotice] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Dynamically load Razorpay checkout.js script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const existingScript = document.getElementById('razorpay-checkout-js');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Pre-load script in background on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Update formData when prepopulatedProfile changes
  useEffect(() => {
    if (prepopulatedProfile) {
      setFormData((prev) => ({
        ...prev,
        hotelName: prev.hotelName || prepopulatedProfile.hotelName || '',
        ownerName: prev.ownerName || prepopulatedProfile.ownerName || '',
        email: prev.email || prepopulatedProfile.email || '',
        phone: prev.phone || prepopulatedProfile.phone || '',
        billingAddress: prev.billingAddress || prepopulatedProfile.billingAddress || '',
        city: prev.city || prepopulatedProfile.city || '',
        state: prev.state || prepopulatedProfile.state || '',
        pincode: prev.pincode || prepopulatedProfile.pincode || '',
        gstin: prev.gstin || prepopulatedProfile.gstin || '',
      }));
    }
  }, [prepopulatedProfile]);

  // Handle single field update and clear corresponding error
  const handleFieldChange = (
    field: keyof CheckoutFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Client-side validation logic
  const validateForm = (): boolean => {
    const newErrors: CheckoutErrors = {};

    if (!formData.hotelName.trim()) {
      newErrors.hotelName = 'Property / Hotel name is required.';
    } else if (formData.hotelName.trim().length < 2) {
      newErrors.hotelName = 'Hotel name must be at least 2 characters.';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner / Contact person name is required.';
    } else if (formData.ownerName.trim().length < 2) {
      newErrors.ownerName = 'Contact name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required for invoicing.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. owner@hotel.com).';
    }

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (cleanedPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing street address is required.';
    } else if (formData.billingAddress.trim().length < 5) {
      newErrors.billingAddress = 'Please enter a complete street address.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Please select a state or union territory.';
    }

    const cleanedPin = formData.pincode.replace(/\D/g, '');
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required.';
    } else if (cleanedPin.length !== 6) {
      newErrors.pincode = 'Please enter a valid 6-digit Indian PIN code.';
    }

    if (formData.gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(formData.gstin.trim().toUpperCase())) {
        newErrors.gstin = 'Invalid GSTIN format (e.g. 07AAACH7409R1ZZ).';
      }
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must accept the terms of service and recurring subscription terms.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler: validates inputs, creates subscription, opens Razorpay, and verifies payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerNotice(null);

    const isValid = validateForm();
    if (!isValid) {
      // Scroll smoothly to first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setUiState('processing');

    try {
      // 1. Call server API to create Razorpay Subscription
      const createRes = await fetch('/api/billing/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelName: formData.hotelName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          billingAddress: formData.billingAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          gstin: formData.gstin,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        setUiState('checkout');
        setServerError(
          createData.error || 'Failed to initialize subscription checkout. Please try again.'
        );
        return;
      }

      // 2. Ensure Razorpay Checkout.js is available
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !(window as any).Razorpay) {
        setUiState('checkout');
        setServerError(
          'Unable to load Razorpay payment window. Please check your internet connection or ad blocker and try again.'
        );
        return;
      }

      // 3. Configure Razorpay modal options
      const rzpOptions = {
        key: createData.keyId,
        subscription_id: createData.subscriptionId,
        name: 'Grove Hospitality OS',
        description: 'Monthly Hotel Management Subscription (₹999/mo)',
        image: '/icon.png',
        prefill: {
          name: formData.ownerName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          hotel_name: formData.hotelName,
          billing_address: formData.billingAddress,
        },
        theme: {
          color: '#1D403A',
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) {
          setUiState('processing');
          try {
            const verifyRes = await fetch('/api/billing/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setPaymentReference(
                verifyData.invoiceReference || response.razorpay_payment_id
              );
              setUiState('success');
            } else {
              setServerError(
                verifyData.error || 'Payment signature verification failed on the server.'
              );
              setUiState('failed');
            }
          } catch (err: any) {
            setServerError(
              err?.message || 'Network error occurred while verifying your subscription.'
            );
            setUiState('failed');
          }
        },
        modal: {
          ondismiss: function () {
            setUiState('checkout');
            setServerNotice('Checkout was dismissed. Your account was not charged.');
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(rzpOptions);

      rzpInstance.on('payment.failed', function (failureResponse: any) {
        console.error('Razorpay authorization failed:', failureResponse);
        setServerError(
          failureResponse?.error?.description ||
            'Payment authorization declined by financial institution.'
        );
        setUiState('failed');
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error('Unexpected subscription checkout error:', err);
      setServerError(
        err?.message || 'An unexpected error occurred while initiating your subscription.'
      );
      setUiState('checkout');
    }
  };

  // Reset to checkout form
  const handleRetry = () => {
    setServerError(null);
    setServerNotice(null);
    setUiState('checkout');
  };

  // Quick State Switcher for testing/reviewing all requested UI states
  const triggerState = (targetState: CheckoutUIState | 'validation-error') => {
    if (targetState === 'validation-error') {
      setUiState('checkout');
      setErrors({
        hotelName: 'Property / Hotel name is required.',
        ownerName: 'Owner / Contact person name is required.',
        email: 'Please enter a valid email address.',
        phone: 'Phone number is required.',
        billingAddress: 'Billing street address is required.',
        city: 'City is required.',
        state: 'Please select a state or union territory.',
        pincode: 'Please enter a valid 6-digit Indian PIN code.',
        agreeTerms: 'You must accept the terms of service.',
      });
      return;
    }

    setErrors({});
    setUiState(targetState);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* ─────────────────────────────────────────────────────────────
       * PHASE 1 UI STATE INSPECTOR / DEMO TOOLBAR
       * Allows reviewers and users to inspect all 5 required UI states:
       * 1. Checkout ready
       * 2. Validation errors
       * 3. Processing payment
       * 4. Payment successful
       * 5. Payment failed
       * 6. Subscription pending activation
       * ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-3 sm:p-4 bg-white/70 backdrop-blur-md border border-[#1C2D29]/12 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
            <span className="text-xs font-semibold text-[#142320]">
              Phase 1 Subscription UI States:
            </span>
            <span className="text-[11px] text-ink-muted hidden md:inline">
              (Interactive Preview Tool)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => triggerState('checkout')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                uiState === 'checkout' && !hasErrors
                  ? 'bg-brand-forest text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              1. Ready
            </button>

            <button
              type="button"
              onClick={() => triggerState('validation-error')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                uiState === 'checkout' && hasErrors
                  ? 'bg-status-red text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              2. Validation Errors
            </button>

            <button
              type="button"
              onClick={() => triggerState('processing')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                uiState === 'processing'
                  ? 'bg-brand-forest text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              3. Processing
            </button>

            <button
              type="button"
              onClick={() => triggerState('success')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                uiState === 'success'
                  ? 'bg-status-green text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              4. Success
            </button>

            <button
              type="button"
              onClick={() => triggerState('failed')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                uiState === 'failed'
                  ? 'bg-status-red text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              5. Failed
            </button>

            <button
              type="button"
              onClick={() => triggerState('pending')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                uiState === 'pending'
                  ? 'bg-status-amber text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10'
              }`}
            >
              6. Pending
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * MAIN CONTENT: POST-PAYMENT RESULTS vs INTERACTIVE CHECKOUT
       * ───────────────────────────────────────────────────────────── */}
      {uiState === 'success' || uiState === 'failed' || uiState === 'pending' ? (
        <PaymentResult
          state={uiState}
          formData={formData}
          errorMessage={serverError || undefined}
          referenceId={paymentReference || undefined}
          onRetry={handleRetry}
          onSwitchState={(st) => setUiState(st)}
        />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Server Error Alert Banner */}
          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-status-red/10 border border-status-red/25 text-status-red flex items-start gap-3 text-xs sm:text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Checkout Error:</strong>
                <p className="mt-0.5 text-xs text-status-red/90">{serverError}</p>
              </div>
            </div>
          )}

          {/* Dismissed / Notice Banner */}
          {serverNotice && !serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-brand-forest/10 border border-brand-forest/20 text-[#142320] flex items-start gap-3 text-xs sm:text-sm animate-fadeIn">
              <Clock className="w-5 h-5 shrink-0 mt-0.5 text-brand-forest" />
              <div>
                <strong className="font-semibold block">Notice:</strong>
                <p className="mt-0.5 text-xs text-ink-muted">{serverNotice}</p>
              </div>
            </div>
          )}

          {/* Top Validation Alert Banner (Shown if errors exist) */}
          {hasErrors && (
            <div className="mb-6 p-4 rounded-2xl bg-status-red/10 border border-status-red/25 text-status-red flex items-start gap-3 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Please correct the highlighted fields:</strong>
                <p className="mt-0.5 text-xs text-status-red/90">
                  Some required contact or billing information is missing or formatted incorrectly.
                </p>
              </div>
            </div>
          )}

          {/* Processing Banner (Shown when processing payment) */}
          {uiState === 'processing' && (
            <div className="mb-6 p-4 rounded-2xl bg-brand-forest/10 border border-brand-forest/25 text-[#142320] flex items-center gap-3 text-xs sm:text-sm">
              <span className="w-5 h-5 border-2 border-brand-forest border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <strong className="font-semibold block">Authorizing Subscription Mandate...</strong>
                <p className="text-xs text-ink-muted">
                  Connecting to bank gateway for ₹999/month recurring mandate setup. Please do not refresh.
                </p>
              </div>
            </div>
          )}

          {/* TWO COLUMN DESKTOP GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ── LEFT COLUMN: Hotel Details & Billing Address ── */}
            <div className="lg:col-span-7 space-y-6">
              <HotelDetailsForm
                formData={formData}
                errors={errors}
                disabled={uiState === 'processing'}
                isPrepopulated={Boolean(prepopulatedProfile?.isAuthenticated)}
                onChange={handleFieldChange}
              />

              <BillingDetailsForm
                formData={formData}
                errors={errors}
                disabled={uiState === 'processing'}
                onChange={handleFieldChange}
              />
            </div>

            {/* ── RIGHT COLUMN: Order Summary & Subscription Summary ── */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              <OrderSummary
                formData={formData}
                errors={errors}
                isSubmitting={uiState === 'processing'}
                disabled={uiState === 'processing'}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
              />

              <SubscriptionStatus
                hotelName={formData.hotelName}
                status={uiState === 'processing' ? 'processing' : 'ready'}
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

