'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import { useTheme } from '../providers/ThemeProvider';

export default function ThemeSettingsCard() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="pms-card p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-brand-sand/70 dark:bg-card-elevated border border-border-subtle text-emerald-brand dark:text-emerald-highlight flex items-center justify-center shrink-0 shadow-2xs">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-ink text-base">Appearance & Interface Theme</h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Choose how Grove PMS looks to you. Select Light, Dark, or System theme.
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <ThemeToggle variant="segmented" />
      </div>
    </div>
  );
}

