'use client';

import React from 'react';
import SettingsBackNavigation from './SettingsBackNavigation';

interface SettingsHeaderProps {
  title: string;
  description?: string;
  currentPage?: string;
  hasUnsavedChanges?: boolean;
  actions?: React.ReactNode;
}

export default function SettingsHeader({
  title,
  description,
  currentPage,
  hasUnsavedChanges = false,
  actions,
}: SettingsHeaderProps) {
  return (
    <div className="space-y-2.5 pb-2.5 border-b border-border-subtle">
      {/* Top compact back navigation / breadcrumb */}
      <SettingsBackNavigation
        currentPage={currentPage}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-display font-serif text-brand-forest leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-body text-ink-muted mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">{actions}</div>}
      </div>
    </div>
  );
}
