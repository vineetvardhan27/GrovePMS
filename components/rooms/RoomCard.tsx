'use client';

import {
  CheckCircle2,
  Users,
  Clock,
  Calendar,
  Sparkles,
  Wrench,
  BedDouble,
} from 'lucide-react';
import { RoomWithCategory } from '../../lib/rooms/queries';
import { RoomStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';

interface RoomCardProps {
  room: RoomWithCategory;
  onClick: (room: RoomWithCategory) => void;
  isSelected?: boolean;
}

export const STATUS_CONFIG: Record<
  RoomStatus,
  {
    label: string;
    icon: any;
    bgClass: string;
    borderClass: string;
    textClass: string;
    badgeBg: string;
  }
> = {
  available: {
    label: 'Available',
    icon: CheckCircle2,
    bgClass: 'bg-status-green/10 hover:bg-status-green/15',
    borderClass: 'border-status-green/30 hover:border-status-green',
    textClass: 'text-status-green',
    badgeBg: 'bg-status-green/15 text-status-green border-status-green/25',
  },
  occupied: {
    label: 'Occupied',
    icon: Users,
    bgClass: 'bg-status-red/10 hover:bg-status-red/15',
    borderClass: 'border-status-red/30 hover:border-status-red',
    textClass: 'text-status-red',
    badgeBg: 'bg-status-red/15 text-status-red border-status-red/25',
  },
  arriving_today: {
    label: 'Arriving Today',
    icon: Clock,
    bgClass: 'bg-status-amber/10 hover:bg-status-amber/15',
    borderClass: 'border-status-amber/30 hover:border-status-amber',
    textClass: 'text-status-amber',
    badgeBg: 'bg-status-amber/15 text-status-amber border-status-amber/25',
  },
  reserved: {
    label: 'Reserved',
    icon: Calendar,
    bgClass: 'bg-status-blue/10 hover:bg-status-blue/15',
    borderClass: 'border-status-blue/30 hover:border-status-blue',
    textClass: 'text-status-blue',
    badgeBg: 'bg-status-blue/15 text-status-blue border-status-blue/25',
  },
  cleaning: {
    label: 'Cleaning',
    icon: Sparkles,
    bgClass: 'bg-status-orange/10 hover:bg-status-orange/15',
    borderClass: 'border-status-orange/30 hover:border-status-orange',
    textClass: 'text-status-orange',
    badgeBg: 'bg-status-orange/15 text-status-orange border-status-orange/25',
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    bgClass: 'bg-status-slate/10 hover:bg-status-slate/15',
    borderClass: 'border-status-slate/30 hover:border-status-slate',
    textClass: 'text-status-slate',
    badgeBg: 'bg-status-slate/15 text-status-slate border-status-slate/25',
  },
};

export default function RoomCard({ room, onClick, isSelected }: RoomCardProps) {
  const config = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  const StatusIcon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(room)}
      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] md:min-h-[120px] shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-forest ${
        config.bgClass
      } ${config.borderClass} ${
        isSelected ? 'ring-2 ring-brand-forest ring-offset-2 scale-[1.02]' : ''
      }`}
      aria-label={`Room ${room.room_number}, ${room.category.name}, status is ${config.label}`}
    >
      {/* Top row: Room Number & Status Icon */}
      <div className="flex items-start justify-between w-full">
        <div>
          <span className="text-2xl md:text-3xl font-bold font-serif text-ink tracking-tight">
            {room.room_number}
          </span>
          <span className="block text-[11px] text-ink-muted font-medium">
            Floor {room.floor}
          </span>
        </div>

        {/* Distinct Accessible Icon paired with color per Design.md §1.2 */}
        <div className={`p-1.5 rounded-lg border ${config.badgeBg}`}>
          <StatusIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom row: Category & Rate + Status label */}
      <div className="mt-3 pt-2 border-t border-black/5 w-full flex items-end justify-between gap-1">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink truncate">
            {room.category.name}
          </p>
          <p className="text-[11px] text-ink-muted tabular-nums">
            {formatCurrency(room.category.base_rate)}/night
          </p>
        </div>

        {/* Text Label always visible */}
        <span
          className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${config.badgeBg}`}
        >
          {config.label}
        </span>
      </div>
    </button>
  );
}
