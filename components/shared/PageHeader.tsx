import { LucideIcon } from 'lucide-react';

interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger-outline';
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
}

export default function PageHeader({
  title,
  description,
  primaryAction,
  secondaryActions = [],
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      {/* Title block */}
      <div className="min-w-0 flex-1">
        <h1 className="text-[1.375rem] leading-tight font-serif font-bold text-brand-forest tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-ink-muted leading-snug">
            {description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Secondary actions first (quieter) */}
          {secondaryActions.map((action, i) => {
            const Icon = action.icon;
            const cls =
              action.variant === 'danger-outline'
                ? 'pms-btn-danger-outline'
                : 'pms-btn-secondary';
            return (
              <button
                key={i}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cls}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{action.label}</span>
              </button>
            );
          })}

          {/* Primary action (dominant) */}
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="pms-btn-primary"
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
