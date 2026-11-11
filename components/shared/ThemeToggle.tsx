'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, type Theme } from '../providers/ThemeProvider';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented' | 'dropdown' | 'pill';
  className?: string;
  showLabels?: boolean;
}

export default function ThemeToggle({
  variant = 'icon',
  className = '',
  showLabels = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!mounted) {
    // Avoid layout shift during hydration
    return (
      <div
        className={`w-8 h-8 rounded-full bg-transparent opacity-0 shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  // 1. SIMPLE QUICK TOGGLE (Icon button for headers)
  if (variant === 'icon') {
    const isDark = resolvedTheme === 'dark';
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`
          relative flex items-center justify-center w-8 h-8 rounded-full shrink-0
          text-ink-muted hover:text-ink hover:bg-brand-sand/70 dark:hover:bg-brand-sand-dark/80
          border border-border-subtle/60 dark:border-white/[0.08]
          transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-brand/40
          ${className}
        `}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Current: ${theme} (${resolvedTheme}) — Click to toggle`}
      >
        <span className="sr-only">Toggle theme</span>
        <Sun
          className={`w-4 h-4 transition-transform duration-300 ${
            isDark ? 'rotate-90 scale-0 absolute' : 'rotate-0 scale-100 text-amber-600'
          }`}
        />
        <Moon
          className={`w-4 h-4 transition-transform duration-300 ${
            isDark ? 'rotate-0 scale-100 text-emerald-highlight' : '-rotate-90 scale-0 absolute'
          }`}
        />
      </button>
    );
  }

  // 2. SEGMENTED SELECTOR (For Settings page or User Profile)
  if (variant === 'segmented') {
    const options: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Laptop },
    ];

    return (
      <div
        className={`
          inline-flex items-center p-1 rounded-xl bg-brand-sand-dark/60 dark:bg-card border border-border-subtle dark:border-white/[0.09]
          ${className}
        `}
        role="radiogroup"
        aria-label="Theme selector"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                ${
                  isSelected
                    ? 'bg-white dark:bg-card-elevated text-ink shadow-xs border border-border-subtle/80 dark:border-white/[0.12] font-semibold text-emerald-brand dark:text-emerald-highlight'
                    : 'text-ink-muted hover:text-ink hover:bg-white/40 dark:hover:bg-white/[0.04]'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. DROPDOWN MENU (For User menu / Account switcher)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-muted hover:text-ink hover:bg-brand-sand dark:hover:bg-card-elevated transition-colors border border-border-subtle dark:border-white/[0.08]"
        aria-expanded={isOpen}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-emerald-highlight" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-600" />
        )}
        <span className="capitalize">{theme}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-card-elevated border border-border-subtle dark:border-white/[0.12] shadow-modal py-1 z-50 animate-in fade-in-50 zoom-in-95">
          {(['light', 'dark', 'system'] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTheme(t);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer
                ${
                  theme === t
                    ? 'text-emerald-brand dark:text-emerald-highlight bg-brand-sand/50 dark:bg-card font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-brand-sand/30 dark:hover:bg-card/60'
                }
              `}
            >
              <span className="capitalize">{t}</span>
              {theme === t && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

