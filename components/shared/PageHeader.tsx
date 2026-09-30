import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger-outline';
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Standardized PageHeader component matching the Food & Beverage Overview visual language.
 * Provides unified serif heading typography, muted subtitle, icon container, and action buttons.
 */
export default function PageHeader({
  title,
  description,
  icon: Icon,
  primaryAction,
  secondaryActions = [],
  badge,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle mb-6">
      {/* Title block */}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
          {Icon && <Icon className="w-6 h-6 text-brand-forest shrink-0" aria-hidden="true" />}
          <span>{title}</span>
          {badge}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action buttons & custom right-side slots */}
      {(primaryAction || secondaryActions.length > 0 || children) && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {children}

          {/* Secondary actions */}
          {secondaryActions.map((action, i) => {
            const ActionIcon = action.icon;
            const cls =
              action.variant === 'danger-outline'
                ? 'pms-btn-danger-outline text-xs'
                : 'pms-btn-secondary text-xs';

            if (action.href) {
              return (
                <Link key={i} href={action.href} className={cls}>
                  {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                  <span>{action.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cls}
              >
                {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                <span>{action.label}</span>
              </button>
            );
          })}

          {/* Primary action */}
          {primaryAction &&
            (primaryAction.href ? (
              <Link href={primaryAction.href} className="pms-btn-primary text-xs shadow-xs">
                {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                <span>{primaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="pms-btn-primary text-xs shadow-xs"
              >
                {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                <span>{primaryAction.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
