import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  /** Compact version for table bodies */
  compact?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div className="py-12 text-center">
        {Icon && (
          <Icon className="w-8 h-8 text-border-subtle mx-auto mb-3" aria-hidden="true" />
        )}
        <p className="text-sm font-medium text-ink-muted">{title}</p>
        {description && (
          <p className="text-xs text-ink-muted/70 mt-1 max-w-xs mx-auto">{description}</p>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="pms-btn-primary mt-4 mx-auto"
          >
            {action.icon && <action.icon className="w-4 h-4" />}
            <span>{action.label}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-sand border border-border-subtle flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-ink-muted/50" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-muted max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="pms-btn-primary mt-5"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
}
