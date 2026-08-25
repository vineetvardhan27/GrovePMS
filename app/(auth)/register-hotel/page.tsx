'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import {
  Hotel,
  Building2,
  Mail,
  KeyRound,
  User,
  Phone,
  MapPin,
  Percent,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { registerHotelAndOwner } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 text-sm sm:text-base"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Setting up your property &amp; owner profile...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span>Create Hotel &amp; Owner Account</span>
          <ArrowRight className="w-4 h-4" />
        </span>
      )}
    </button>
  );
}

export default function RegisterHotelPage() {
  const [state, action] = useFormState(registerHotelAndOwner, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Success view
  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 bg-brand-sand">
        <div className="w-full max-w-xl bg-white border border-border-subtle rounded-3xl shadow-sm p-6 sm:p-10 space-y-6 text-center">
          <div className="w-16 h-16 bg-status-green/15 text-status-green rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
              Hotel Created Successfully
            </h1>
            <p className="text-sm text-ink-muted">
              Your dedicated multi-tenant property workspace and primary owner account are ready.
            </p>
          </div>

          <div className="bg-brand-sand/50 p-5 rounded-2xl border border-border-subtle text-left space-y-3 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60">
              <span className="text-ink-muted">Hotel Property:</span>
              <span className="font-semibold text-ink">{state.hotelName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60">
              <span className="text-ink-muted">Owner Account:</span>
              <span className="font-semibold text-ink font-mono text-xs">{state.ownerEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Access Level:</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-forest/15 text-brand-forest">
                <Crown className="w-3 h-3" />
                <span>Primary Owner</span>
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
            >
              <span>Continue to PMS Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 bg-brand-sand">
      <div className="w-full max-w-2xl bg-white border border-border-subtle rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 md:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-xs border border-border-subtle bg-white flex items-center justify-center p-1 shrink-0">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest">
                Register Your Hotel
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                Set up your hotel workspace and owner account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs shrink-0">
            <span className="text-ink-muted">Already registered?</span>
            <Link
              href="/login"
              className="text-brand-forest font-semibold hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-brand-forest/10 border border-brand-forest/20 text-brand-forest font-semibold">
            <span className="block text-[10px] uppercase tracking-wider text-brand-forest/70">Step 01</span>
            <span>Property Details</span>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-forest/10 border border-brand-forest/20 text-brand-forest font-semibold">
            <span className="block text-[10px] uppercase tracking-wider text-brand-forest/70">Step 02</span>
            <span>Owner Account</span>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-sand border border-border-subtle text-ink-muted">
            <span className="block text-[10px] uppercase tracking-wider">Step 03</span>
            <span>Live Workspace</span>
          </div>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div className="p-4 bg-action-danger/10 border border-action-danger/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-action-danger">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
            {state?.code === 'EMAIL_EXISTS' && (
              <Link
                href="/login"
                className="bg-white hover:bg-brand-sand text-brand-forest font-semibold px-3 py-1.5 rounded-lg border border-border-subtle text-xs shrink-0 text-center"
              >
                Sign In Instead →
              </Link>
            )}
          </div>
        )}

        <form action={action} className="space-y-8">
          {/* Section 1: Property Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-xs font-bold uppercase tracking-wider text-brand-forest">
              <Building2 className="w-4 h-4" />
              <span>01 Property Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="hotel_name">
                  Hotel / Property Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="hotel_name"
                    name="hotel_name"
                    type="text"
                    required
                    placeholder="e.g. Grand Horizon Resort & Spa"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="phone">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="gst_number">
                  GSTIN / Tax Number (Optional)
                </label>
                <div className="relative">
                  <Percent className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="gst_number"
                    name="gst_number"
                    type="text"
                    placeholder="e.g. 07AAACH7409R1ZZ"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="address">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="e.g. 12 Mall Road, High Ridge"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue="Kolkata"
                  className="w-full px-3.5 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  defaultValue="West Bengal"
                  className="w-full px-3.5 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Owner Account Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-xs font-bold uppercase tracking-wider text-brand-forest">
              <User className="w-4 h-4" />
              <span>02 Owner Account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="owner_full_name">
                  Owner Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="owner_full_name"
                    name="owner_full_name"
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rao"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="email">
                  Owner Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="owner@yourhotel.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="password">
                  Password * (min 6 characters)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="confirm_password">
                  Confirm Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Owner Notice */}
          <div className="p-4 bg-brand-forest/5 rounded-2xl border border-brand-forest/20 text-xs text-ink-muted space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-brand-forest">
              <Crown className="w-4 h-4" />
              <span>Primary Owner Governance</span>
            </div>
            <p>
              This account will have full access to your hotel's PMS, including staff management, billing, reports, and hotel settings. <strong>Only one Owner account is allowed per hotel.</strong>
            </p>
          </div>

          <SubmitButton />
        </form>

        <div className="text-center pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted">
          <Link href="/login" className="hover:text-brand-forest underline">
            ← Return to Sign In
          </Link>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-forest" />
            <span>Multi-Tenant Isolated</span>
          </span>
        </div>
      </div>
    </div>
  );
}
