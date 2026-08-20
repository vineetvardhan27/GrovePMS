import { LucideIcon, CheckCircle2, AlertTriangle, XCircle, Info, CheckCircle, Play, Clock } from 'lucide-react';

type BadgeVariant =
  | 'healthy'
  | 'low'
  | 'critical'
  | 'neutral'
  | 'info'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'maintenance'
  | 'damaged';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  icon?: LucideIcon;
}

const BADGE_CONFIG: Record<BadgeVariant, { className: string; icon: LucideIcon; defaultLabel: string }> = {
  healthy:     { className: 'pms-badge-healthy',  icon: CheckCircle2, defaultLabel: 'Healthy' },
  low:         { className: 'pms-badge-low',      icon: AlertTriangle, defaultLabel: 'Low Stock' },
  critical:    { className: 'pms-badge-critical', icon: XCircle,      defaultLabel: 'Out of Stock' },
  neutral:     { className: 'pms-badge-neutral',  icon: Info,         defaultLabel: 'N/A' },
  info:        { className: 'pms-badge-info',     icon: Info,         defaultLabel: 'Info' },
  damaged:     { className: 'pms-badge-critical', icon: AlertTriangle, defaultLabel: 'Damaged' },
  confirmed:   { className: 'pms-badge-healthy',  icon: CheckCircle2, defaultLabel: 'Confirmed' },
  in_progress: { className: 'pms-badge-low',      icon: Play,         defaultLabel: 'In Progress' },
  completed:   { className: 'pms-badge-neutral',  icon: CheckCircle,  defaultLabel: 'Completed' },
  cancelled:   { className: 'pms-badge-critical', icon: XCircle,      defaultLabel: 'Cancelled' },
  available:   { className: 'pms-badge-healthy',  icon: CheckCircle2, defaultLabel: 'Available' },
  reserved:    { className: 'pms-badge-low',      icon: Clock,        defaultLabel: 'Reserved' },
  occupied:    { className: 'pms-badge-critical', icon: AlertTriangle, defaultLabel: 'In Event' },
  maintenance: { className: 'pms-badge-neutral',  icon: Info,         defaultLabel: 'Maintenance' },
};

export default function StatusBadge({ variant, label, icon: CustomIcon }: StatusBadgeProps) {
  const config = BADGE_CONFIG[variant] || BADGE_CONFIG.neutral;
  const Icon = CustomIcon || config.icon;
  const displayLabel = label ?? config.defaultLabel;

  return (
    <span className={config.className}>
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
