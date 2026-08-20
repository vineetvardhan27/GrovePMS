'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Hotel, KeyRound, Mail, AlertCircle, Shield, UserCheck, Sparkles, Building2, UserPlus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { signIn, signUp } from './actions';
import { StaffRole } from '../../../lib/types/database.types';

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-medium py-3 rounded-lg min-h-touch transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 cursor-pointer"
    >
      {pending ? (
        <span>{pendingLabel}</span>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

const DEMO_PASSWORD = 'HotelDemo@2026!';

const TEST_ROLES: Array<{
  role: StaffRole;
  title: string;
  name: string;
  email: string;
  password: string;
  icon: any;
  color: string;
  badge: string;
  description: string;
}> = [
  {
    role: 'owner',
    title: 'Owner',
    name: 'Ohm Adhikari',
    email: 'owner@hotelgreeneryview.com',
    password: DEMO_PASSWORD,
    icon: Building2,
    color: 'border-l-4 border-l-brand-forest hover:bg-brand-sand',
    badge: 'Full Access (All Modules + Settings)',
    description: 'Overview, reports, occupancy, billing & hotel settings',
  },
  {
    role: 'manager',
    title: 'Manager',
    name: 'Priya Sharma',
    email: 'manager@hotelgreeneryview.com',
    password: DEMO_PASSWORD,
    icon: Shield,
    color: 'border-l-4 border-l-status-blue hover:bg-brand-sand',
    badge: 'Operations & Reports',
    description: 'Bookings, rooms, billing, and daily cash reports',
  },
  {
    role: 'reception',
    title: 'Reception',
    name: 'Rahul Verma',
    email: 'reception@hotelgreeneryview.com',
    password: DEMO_PASSWORD,
    icon: UserCheck,
    color: 'border-l-4 border-l-status-amber hover:bg-brand-sand',
    badge: 'Front Desk Access',
    description: 'Check-in, check-out, bookings, and payments',
  },
  {
    role: 'housekeeping',
    title: 'Housekeeping',
    name: 'Sunita Devi',
    email: 'housekeeping@hotelgreeneryview.com',
    password: DEMO_PASSWORD,
    icon: Sparkles,
    color: 'border-l-4 border-l-status-orange hover:bg-brand-sand',
    badge: 'Room Status Only',
    description: 'Room chart view & cleaning status updates',
  },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signInState, signInAction] = useFormState(signIn, null);
  const [signUpState, signUpAction] = useFormState(signUp, null);

  // Quick-fill helper state
  const [emailInput, setEmailInput] = useState<string>('owner@hotelgreeneryview.com');
  const [passwordInput, setPasswordInput] = useState<string>(DEMO_PASSWORD);

  const handleQuickFill = (account: typeof TEST_ROLES[0]) => {
    setEmailInput(account.email);
    setPasswordInput(account.password);
    setActiveTab('signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 md:p-8 bg-brand-sand">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
        {/* Left column: Login / Register Form */}
        <div className="md:col-span-6 p-5 sm:p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-brand-forest text-white rounded-xl">
                <Hotel className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-h1 text-brand-forest">PMS Portal</h1>
                <p className="text-caption text-ink-muted">Hotel Greenery View Control Centre</p>
              </div>
            </div>

            {/* Tab switchers */}
            <div className="flex rounded-lg bg-brand-sand p-1 mb-5 border border-border-subtle">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white text-brand-forest shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-brand-forest shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Register Staff
              </button>
            </div>

            {/* Error & Success Alerts */}
            {activeTab === 'signin' && signInState?.error && (
              <div className="mb-5 p-3.5 bg-action-danger/10 border border-action-danger/20 rounded-lg flex items-start gap-2.5 text-sm text-action-danger">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{signInState.error}</span>
              </div>
            )}

            {activeTab === 'signup' && signUpState?.error && (
              <div className="mb-5 p-3.5 bg-action-danger/10 border border-action-danger/20 rounded-lg flex items-start gap-2.5 text-sm text-action-danger">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{signUpState.error}</span>
              </div>
            )}

            {activeTab === 'signup' && signUpState?.message && (
              <div className="mb-5 p-3.5 bg-status-green/10 border border-status-green/20 rounded-lg flex items-start gap-2.5 text-sm text-status-green">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{signUpState.message}</span>
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form action={signInAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
                    Staff Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="staff@hotelgreeneryview.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch text-base md:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch text-base md:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <SubmitButton label="Sign In to Control Centre" pendingLabel="Authenticating..." />
                </div>
              </form>
            )}

            {/* Sign Up / Register Form */}
            {activeTab === 'signup' && (
              <form action={signUpAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="reg_full_name">
                    Full Name *
                  </label>
                  <input
                    id="reg_full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch text-base md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="reg_email">
                    Work Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="reg_email"
                      name="email"
                      type="email"
                      required
                      placeholder="staff@hotelgreeneryview.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch text-base md:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="reg_password">
                    Password * (minimum 6 characters)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="reg_password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch text-base md:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="reg_role">
                    Role Assignment *
                  </label>
                  <select
                    id="reg_role"
                    name="role"
                    className="w-full px-3.5 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch text-base md:text-sm"
                  >
                    <option value="owner">Owner (Full PMS & Settings Access)</option>
                    <option value="manager">Manager (Operations, Bookings & Reports)</option>
                    <option value="reception">Reception (Front Desk, Bookings & Billing)</option>
                    <option value="housekeeping">Housekeeping (Room Chart & Status Only)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <SubmitButton label="Create Staff Account" pendingLabel="Creating Account..." />
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand-forest underline p-1 min-h-touch inline-flex items-center">
              ← Return to Home
            </Link>
            <span>Supabase Auth & RLS Gated</span>
          </div>
        </div>

        {/* Right column: Demo Accounts / Quick fill */}
        <div className="md:col-span-6 bg-brand-sand-dark/60 p-5 sm:p-6 md:p-8 border-t md:border-t-0 md:border-l border-border-subtle flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-h2 text-brand-forest">Test Accounts</h2>
                <span className="text-xs font-mono font-medium px-2 py-0.5 bg-brand-forest/10 text-brand-forest rounded-md">
                  Password: HotelDemo@2026!
                </span>
              </div>
              <p className="text-caption text-ink-muted mt-1">
                Click any role below to prefill credentials into the sign-in form:
              </p>
            </div>

            <div className="space-y-3">
              {TEST_ROLES.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickFill(account)}
                    className={`w-full text-left bg-white p-3.5 rounded-xl border border-border-subtle shadow-2xs transition-all cursor-pointer min-h-touch ${account.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-brand-forest" />
                        <span className="font-semibold text-sm text-ink">{account.name}</span>
                      </div>
                      <span className="text-tiny font-medium px-2 py-0.5 rounded-full bg-brand-sand text-ink-muted">
                        {account.title}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1">{account.description}</p>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-ink-muted/80">
                      <span>{account.email}</span>
                      <span className="text-brand-forest font-sans text-tiny">Click to prefill →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-white/80 rounded-xl border border-border-subtle text-xs text-ink-muted space-y-1">
            <p>🔒 <strong>Authentication Flow:</strong> Real Supabase Auth sessions & Postgres Row Level Security (RLS).</p>
            <p>Housekeeping is strictly restricted from billing, payments, guests, and reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
