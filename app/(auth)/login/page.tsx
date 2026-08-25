'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { KeyRound, Mail, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { signIn } from './actions';

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

export default function LoginPage() {
  const [signInState, signInAction] = useFormState(signIn, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-brand-sand">
      <div className="w-full max-w-md bg-white border border-border-subtle rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xs border border-border-subtle bg-white flex items-center justify-center mx-auto p-1">
            <Image
              src="/Grove.png"
              alt="Grove Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-h1 text-brand-forest">PMS Portal</h1>
            <p className="text-caption text-ink-muted mt-0.5">Grove Hospitality OS — Control Centre</p>
          </div>
        </div>

        {/* Error Alert */}
        {signInState?.error && (
          <div className="p-3.5 bg-action-danger/10 border border-action-danger/20 rounded-lg flex items-start gap-2.5 text-sm text-action-danger">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{signInState.error}</span>
          </div>
        )}

        {/* Sign In Form */}
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
                autoComplete="email"
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
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-sand/40 border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch text-base md:text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <SubmitButton label="Sign In to Control Centre" pendingLabel="Authenticating..." />
          </div>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted">
          <Link href="/" className="hover:text-brand-forest underline p-1 min-h-touch inline-flex items-center">
            ← Return to Home
          </Link>
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3 h-3 text-ink-muted" />
            <span>Multi-Tenant RLS Gated</span>
          </span>
        </div>
      </div>
    </div>
  );
}

