'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  X,
  BedDouble,
  Users,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { RoomWithCategory } from '../../lib/rooms/queries';
import { RoomStatus, HousekeepingStatus } from '../../lib/types/database.types';
import { STATUS_CONFIG } from './RoomCard';
import { formatCurrency } from '../../lib/utils/currency';

interface RoomDetailDrawerProps {
  room: RoomWithCategory | null;
  onClose: () => void;
  onUpdateStatus: (
    roomId: string,
    newStatus: RoomStatus,
    newHousekeepingStatus?: HousekeepingStatus
  ) => Promise<void>;
}

export default function RoomDetailDrawer({
  room,
  onClose,
  onUpdateStatus,
}: RoomDetailDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!room) return null;

  const currentConfig = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  const CurrentIcon = currentConfig.icon;

  const handleStatusChange = async (newStatus: RoomStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(room.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleHkChange = async (newHk: HousekeepingStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(room.id, room.status, newHk);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between border-l border-border-subtle">
          {/* Header */}
          <div className="p-6 bg-brand-sand border-b border-border-subtle flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-serif text-brand-forest">
                  Room {room.room_number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-border-subtle text-ink-muted">
                  Floor {room.floor}
                </span>
              </div>
              <p className="text-sm text-ink-muted mt-0.5">{room.category.name}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Current Status Pill */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${currentConfig.bgClass} ${currentConfig.borderClass}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentConfig.badgeBg}`}>
                  <CurrentIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">Current Status</p>
                  <p className={`text-base font-bold ${currentConfig.textClass}`}>{currentConfig.label}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${
                room.housekeeping_status === 'clean'
                  ? 'bg-status-green/15 text-status-green border-status-green/30'
                  : 'bg-status-orange/15 text-status-orange border-status-orange/30'
              }`}>
                Housekeeping: {room.housekeeping_status}
              </span>
            </div>

            {/* Room Specifications */}
            <div className="bg-brand-sand/50 rounded-xl p-4 border border-border-subtle space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Room Details & Rates</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-ink-muted block">Base Rate (Weekdays)</span>
                  <span className="font-semibold text-ink tabular-nums">{formatCurrency(room.category.base_rate)} / night</span>
                </div>
                <div>
                  <span className="text-xs text-ink-muted block">Weekend Rate</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {room.category.weekend_rate ? `${formatCurrency(room.category.weekend_rate)} / night` : 'Same as base'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-muted block">Max Occupancy</span>
                  <span className="font-semibold text-ink">{room.category.max_occupancy} Adults</span>
                </div>
                <div>
                  <span className="text-xs text-ink-muted block">Extra Bed Rate</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {room.category.extra_bed_rate ? formatCurrency(room.category.extra_bed_rate) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Status Quick Actions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2.5">
                Quick Status Change (Live Realtime Sync)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isUpdating || room.status === 'available'}
                  onClick={() => handleStatusChange('available')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-status-green/30 bg-status-green/10 hover:bg-status-green/20 text-status-green font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[40px]"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Mark Available</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating || room.status === 'occupied'}
                  onClick={() => handleStatusChange('occupied')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-status-red/30 bg-status-red/10 hover:bg-status-red/20 text-status-red font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[40px]"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Mark Occupied</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating || room.status === 'cleaning'}
                  onClick={() => handleStatusChange('cleaning')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-status-orange/30 bg-status-orange/10 hover:bg-status-orange/20 text-status-orange font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[40px]"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Needs Cleaning</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating || room.status === 'maintenance'}
                  onClick={() => handleStatusChange('maintenance')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-status-slate/30 bg-status-slate/10 hover:bg-status-slate/20 text-status-slate font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[40px]"
                >
                  <Wrench className="w-4 h-4 shrink-0" />
                  <span>Maintenance</span>
                </button>
              </div>
            </div>

            {/* Housekeeping Toggle */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">Housekeeping Inspection</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isUpdating || room.housekeeping_status === 'clean'}
                  onClick={() => handleHkChange('clean')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    room.housekeeping_status === 'clean'
                      ? 'bg-status-green text-white border-status-green'
                      : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
                  }`}
                >
                  Clean
                </button>
                <button
                  type="button"
                  disabled={isUpdating || room.housekeeping_status === 'dirty'}
                  onClick={() => handleHkChange('dirty')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    room.housekeeping_status === 'dirty'
                      ? 'bg-status-orange text-white border-status-orange'
                      : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
                  }`}
                >
                  Dirty
                </button>
                <button
                  type="button"
                  disabled={isUpdating || room.housekeeping_status === 'inspected'}
                  onClick={() => handleHkChange('inspected')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    room.housekeeping_status === 'inspected'
                      ? 'bg-status-blue text-white border-status-blue'
                      : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
                  }`}
                >
                  Inspected
                </button>
              </div>
            </div>

            {/* Action to Book Room */}
            <div className="p-4 bg-brand-sand rounded-xl border border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-ink">New Reservation</p>
                <p className="text-[11px] text-ink-muted">Book this room for a walk-in or advance guest</p>
              </div>
              <Link
                href={`/bookings/new?roomId=${room.id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Room</span>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-brand-sand border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer min-h-touch"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
