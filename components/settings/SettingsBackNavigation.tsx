'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface SettingsBackNavigationProps {
  currentPage?: string;
  hasUnsavedChanges?: boolean;
  className?: string;
}

export default function SettingsBackNavigation({
  currentPage,
  hasUnsavedChanges = false,
  className = '',
}: SettingsBackNavigationProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      const leave = window.confirm('You have unsaved changes. Leave without saving?');
      if (!leave) {
        e.preventDefault();
      }
    }
  };

  return (
    <nav
      aria-label="Settings breadcrumb"
      className={`flex items-center gap-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wider ${className}`}
    >
      <Link
        href="/settings"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-ink-muted hover:text-brand-forest transition-colors rounded py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/20 group cursor-pointer"
        aria-label="Back to Settings"
      >
        <ArrowLeft
          className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-forest group-hover:-translate-x-0.5 transition-all"
          aria-hidden="true"
        />
        <span>Settings</span>
      </Link>
      {currentPage && (
        <>
          <span className="text-border-subtle" aria-hidden="true">
            /
          </span>
          <span className="text-brand-forest font-bold">{currentPage}</span>
        </>
      )}
    </nav>
  );
}
