'use client';

import {
  CheckCircle2,
  Users,
  Clock,
  Calendar,
  Sparkles,
  Wrench,
  BedDouble,
  Home,
} from 'lucide-react';
import { RoomWithCategory } from '../../lib/rooms/types';
import { RoomStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';

interface RoomCardProps {
  room: RoomWithCategory;
  onClick: (room: RoomWithCategory) => void;
  isSelected?: boolean;
}

// Human-readable floor names
const FLOOR_NAMES: Record<number, string> = {
  0: 'Basement',
  1: 'Ground Floor',
  2: 'First Floor',
  3: 'Second Floor',
  4: 'Upper Floor',
};

function getFloorLabel(floor: number, roomNumber: string): string {
  if (roomNumber === 'FAMILY-APT' || floor === 0) return 'Basement Suite';
  return FLOOR_NAMES[floor] ?? `Floor ${floor}`;
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
  const isFamilyApartment = room.room_number === 'FAMILY-APT' || room.category?.name === 'Family Apartment';

  return (
    <button
      type="button"
      onClick={() => onClick(room)}
      className={`relative w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[120px] shadow-2xs hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand-forest ${
        config.bgClass
      } ${config.borderClass} ${
        isSelected ? 'ring-2 ring-brand-forest ring-offset-2 scale-[1.01]' : ''
      }`}
      aria-label={`Room ${room.room_number}, ${room.category.name}, status is ${config.label}`}
    >
      {/* Top row: Room Number & Status Icon */}
      <div className="flex items-start justify-between w-full">
        <div>
          {isFamilyApartment ? (
            <div>
              <span className="text-base sm:text-lg font-bold font-serif text-ink tracking-tight block">
                Family Apartment
              </span>
              <span className="text-[10px] font-mono text-ink-muted bg-white/60 px-1.5 py-0.5 rounded border border-border-subtle inline-block mt-0.5">
                Basement Suite
              </span>
            </div>
          ) : (
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight">
                {room.room_number}
              </span>
              <span className="block text-[11px] text-ink-muted font-medium">
                {getFloorLabel(room.floor, room.room_number)}
              </span>
            </div>
          )}
        </div>

        {/* Status Icon */}
        <div className={`p-1.5 rounded-lg border ${config.badgeBg}`}>
          <StatusIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom row: Category & Rate + Status label */}
      <div className="mt-3 pt-2 border-t border-black/5 w-full flex items-end justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-ink truncate">
            {room.category.name}
          </p>
          <p className="text-[11px] text-ink-muted tabular-nums truncate font-semibold">
            {formatCurrency(room.base_rate_override || room.category.base_rate)}/night
          </p>
        </div>

        {/* Text Label */}
        <span
          className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${config.badgeBg}`}
        >
          {config.label}
        </span>
      </div>
    </button>
  );
}
