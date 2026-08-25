import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-sand flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border-subtle p-8 text-center shadow-card space-y-6">
        <div className="w-16 h-16 bg-brand-forest/10 rounded-2xl flex items-center justify-center mx-auto text-brand-forest">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Page Not Found</h1>
          <p className="text-ink-muted text-sm mt-2">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-forest text-white text-sm font-semibold rounded-xl hover:bg-brand-forest-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
