'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import AnimatedKpiValue from './AnimatedKpiValue';

type AccentColor = 'default' | 'green' | 'red' | 'amber' | 'blue';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: AccentColor;
  dotColor?: string;
  index?: number;
  type?: 'currency' | 'number' | 'percent' | 'raw';
  decimals?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const ACCENT_STYLES: Record<AccentColor, { value: string; icon: string; iconBg: string }> = {
  default: { value: 'text-brand-forest', icon: 'text-brand-forest', iconBg: 'bg-brand-forest/10 text-brand-forest' },
  green:   { value: 'text-status-green',  icon: 'text-status-green',  iconBg: 'bg-status-green/10 text-status-green' },
  red:     { value: 'text-status-red',    icon: 'text-status-red',    iconBg: 'bg-status-red/10 text-status-red' },
  amber:   { value: 'text-status-amber',  icon: 'text-status-amber',  iconBg: 'bg-status-amber/15 text-status-amber' },
  blue:    { value: 'text-status-blue',   icon: 'text-status-blue',   iconBg: 'bg-status-blue/15 text-status-blue' },
};

export default function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent = 'default',
  dotColor,
  index = 0,
  type,
  decimals = 0,
  href,
  onClick,
  className = '',
}: KpiCardProps) {
  const styles = ACCENT_STYLES[accent];

  // If type wasn't explicitly provided, infer it if possible
  const inferredType = type || (typeof value === 'number' ? 'number' : 'raw');

  const cardContent = (
    <div
      className={`pms-card p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-xs group ${
        href || onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        animationDelay: `${Math.min(index * 60, 400)}ms`,
      }}
      onClick={onClick}
    >
      {/* Top Row: Label & Status Icon */}
      <div className="flex items-center justify-between text-ink-muted text-xs font-medium gap-2">
        <span className="truncate">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105 ${styles.iconBg}`}>
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Middle Row: Value with smooth counter animation */}
      <div className="mt-2.5">
        <div className={`text-xl sm:text-2xl font-bold font-serif tabular-nums leading-tight ${styles.value}`}>
          {typeof value === 'number' && inferredType !== 'raw' ? (
            <AnimatedKpiValue
              value={value}
              type={inferredType}
              decimals={decimals}
            />
          ) : (
            value
          )}
        </div>

        {/* Bottom Row: Supporting metadata / trend */}
        {subtitle && (
          <div className="text-[11px] text-ink-muted font-medium mt-1 flex items-center gap-1.5 leading-normal truncate">
            {dotColor && (
              <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            )}
            <span className="truncate">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 rounded-xl">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
