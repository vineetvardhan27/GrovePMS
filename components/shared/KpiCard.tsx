import { LucideIcon } from 'lucide-react';

type AccentColor = 'default' | 'green' | 'red' | 'amber' | 'blue';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: AccentColor;
  /** Optional dot indicator color (Tailwind bg-* class) */
  dotColor?: string;
}

const ACCENT_STYLES: Record<AccentColor, { value: string; icon: string }> = {
  default:  { value: 'text-brand-forest', icon: 'text-brand-forest/25' },
  green:    { value: 'text-status-green',  icon: 'text-status-green/25'  },
  red:      { value: 'text-status-red',    icon: 'text-status-red/25'    },
  amber:    { value: 'text-status-amber',  icon: 'text-status-amber/25'  },
  blue:     { value: 'text-status-blue',   icon: 'text-status-blue/25'   },
};

export default function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent = 'default',
  dotColor,
}: KpiCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className="pms-card relative overflow-hidden p-5">
      {/* Label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-3">
        {label}
      </p>

      {/* Value */}
      <p className={`text-[2rem] leading-none font-serif font-bold ${styles.value}`}>
        {value}
      </p>

      {/* Subtitle with optional dot */}
      {subtitle && (
        <p className="mt-2 text-xs text-ink-muted flex items-center gap-1.5 leading-snug">
          {dotColor && (
            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          )}
          {subtitle}
        </p>
      )}

      {/* Background icon decoration */}
      {Icon && (
        <div className="absolute bottom-3 right-3 pointer-events-none select-none">
          <Icon className={`w-10 h-10 ${styles.icon}`} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
