'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Hotel, KeyRound, Mail, AlertCircle, Shield, UserCheck, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';
import { signIn, switchDemoRole } from './actions';
import { StaffRole } from '../../../lib/types/database.types';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-medium py-3 rounded-lg min-h-touch transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 cursor-pointer"
    >
      {pending ? (
        <span>Authenticating...</span>
      ) : (
        <span>Sign In to Control Centre</span>
      )}
    </button>
  );
}

const TEST_ROLES: Array<{
  role: StaffRole;
  title: string;
  name: string;
  email: string;
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
    icon: Sparkles,
    color: 'border-l-4 border-l-status-orange hover:bg-brand-sand',
    badge: 'Room Status Only',
    description: 'Room chart view & cleaning status updates',
  },
];

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-brand-sand">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
        {/* Left column: Login Form */}
        <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-brand-forest text-white rounded-xl">
                <Hotel className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-h1 text-brand-forest">Staff Login</h1>
                <p className="text-caption text-ink-muted">Hotel Greenery View Control Centre</p>
              </div>
            </div>

            {state?.error && (
              <div className="mb-5 p-3.5 bg-action-danger/10 border border-action-danger/20 rounded-lg flex items-start gap-2.5 text-sm text-action-danger">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
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
                    defaultValue="owner@hotelgreeneryview.com"
                    placeholder="staff@hotelgreeneryview.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
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
                    defaultValue="password123"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand-forest underline">
              ← Return to Home
            </Link>
            <span>Phase 1 — Auth & Roles</span>
          </div>
        </div>

        {/* Right column: Test Role Switcher */}
        <div className="md:col-span-6 bg-brand-sand-dark/60 p-6 md:p-8 border-t md:border-t-0 md:border-l border-border-subtle flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-h2 text-brand-forest">Instant Test Accounts</h2>
              <p className="text-caption text-ink-muted">
                Click any role to test role-gated navigation and permissions:
              </p>
            </div>

            <div className="space-y-3">
              {TEST_ROLES.map((account) => {
                const Icon = account.icon;
                return (
                  <form key={account.role} action={() => switchDemoRole(account.role)}>
                    <button
                      type="submit"
                      className={`w-full text-left bg-white p-3.5 rounded-xl border border-border-subtle shadow-2xs transition-all cursor-pointer ${account.color}`}
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
                    </button>
                  </form>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/70 rounded-lg border border-border-subtle text-xs text-ink-muted">
            🔒 <strong>Role enforcement:</strong> Housekeeping is restricted from billing, payments, guests, and reports.
          </div>
        </div>
      </div>
    </div>
  );
}
