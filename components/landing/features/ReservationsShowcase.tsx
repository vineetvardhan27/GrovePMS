'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Users,
  CreditCard,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BookingBar {
  id: string;
  guest: string;
  roomNum: string;
  roomType: string;
  startDay: number; // 0 to 4
  spanDays: number;
  status: 'confirmed' | 'checked-in' | 'pending';
  advancePaid: string;
  totalTariff: string;
  mealPlan: string;
  source: string;
}

export default function ReservationsShowcase() {
  const [selectedBookingId, setSelectedBookingId] = useState<string>('B-1042');

  const days = ['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18'];

  const bookings: BookingBar[] = [
    {
      id: 'B-1042',
      guest: 'Rohit & Neha Singhania',
      roomNum: '101',
      roomType: 'Deluxe King',
      startDay: 0,
      spanDays: 3,
      status: 'checked-in',
      advancePaid: '₹5,000 (UPI)',
      totalTariff: '₹13,500',
      mealPlan: 'CP (Breakfast Inc.)',
      source: 'Direct Website',
    },
    {
      id: 'B-1045',
      guest: 'Dr. S. Kulkarni',
      roomNum: '102',
      roomType: 'Superior Twin',
      startDay: 1,
      spanDays: 4,
      status: 'checked-in',
      advancePaid: '₹10,000 (Card)',
      totalTariff: '₹15,200',
      mealPlan: 'EP (Room Only)',
      source: 'Direct Phone Booking',
    },
    {
      id: 'B-1048',
      guest: 'Arjun Verma',
      roomNum: '201',
      roomType: 'Executive Suite',
      startDay: 2,
      spanDays: 2,
      status: 'confirmed',
      advancePaid: '₹6,000 (UPI)',
      totalTariff: '₹15,000',
      mealPlan: 'MAP (Breakfast + Dinner)',
      source: 'Repeat Corporate Guest',
    },
    {
      id: 'B-1050',
      guest: 'Priya & Siddharth Nair',
      roomNum: '202',
      roomType: 'Garden Villa',
      startDay: 3,
      spanDays: 2,
      status: 'pending',
      advancePaid: '₹2,500 (Deposit)',
      totalTariff: '₹12,400',
      mealPlan: 'CP (Breakfast Inc.)',
      source: 'Walk-in Inquiry',
    },
  ];

  const activeBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14">
      {/* ── Main Glassmorphic Container ── */}
      <div
        className="rounded-[28px] sm:rounded-[34px] overflow-hidden text-left relative p-5 sm:p-7 lg:p-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(255, 253, 249, 0.54) 50%, rgba(255, 255, 255, 0.68) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.90)',
          boxShadow:
            '0 28px 70px -16px rgba(15, 36, 33, 0.12), 0 8px 24px -6px rgba(15, 36, 33, 0.04), 0 0 0 1px rgba(31, 61, 58, 0.06), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px 0 rgba(15, 36, 33, 0.04)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-60"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-x-8 sm:inset-x-16 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent z-20"
          aria-hidden="true"
        />

        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(31,61,58,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-white/90 flex items-center justify-center shrink-0">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-brand-forest text-base sm:text-lg">
                  Visual Tape Chart &amp; Calendar
                </span>
                <span className="text-xs text-ink-muted hidden sm:inline">—</span>
                <span className="text-xs text-ink-muted font-medium hidden sm:inline">
                  Real-time Booking Availability
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">October 2026 • Live Reservation Stream</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-forest text-white text-xs font-semibold shadow-xs hover:bg-brand-forest-light transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Booking</span>
            </button>
          </div>
        </div>

        {/* Grid and Inspector Panel (Split 7 / 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 relative z-10">
          {/* Tape Chart Timeline (7 Cols) */}
          <div className="lg:col-span-7 bg-white/65 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
              <span className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                Multi-Day Stay Matrix
              </span>
              <span className="text-[10px] font-medium text-ink-muted">
                Click a stay block to inspect folio
              </span>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-6 gap-1 text-[11px] font-semibold text-center text-ink-muted pb-1">
              <span className="text-left font-bold text-ink">Room</span>
              {days.map((d) => (
                <span key={d} className="truncate">
                  {d}
                </span>
              ))}
            </div>

            {/* Rooms Rows */}
            {['101', '102', '201', '202'].map((rm) => {
              const matchedBookings = bookings.filter((b) => b.roomNum === rm);

              return (
                <div
                  key={rm}
                  className="grid grid-cols-6 gap-1 items-center p-1.5 rounded-xl bg-white/50 border border-[#1C2D29]/6 text-xs min-h-[46px]"
                >
                  <div className="font-mono font-bold text-brand-forest px-1">
                    Rm {rm}
                  </div>

                  {/* 5 Day Slot Grid */}
                  <div className="col-span-5 grid grid-cols-5 gap-1 relative h-8">
                    {/* Background Day Cells */}
                    {[0, 1, 2, 3, 4].map((slot) => (
                      <div
                        key={slot}
                        className="border-r border-[#1C2D29]/5 h-full rounded-sm bg-white/20"
                      />
                    ))}

                    {/* Overlay Booking Blocks */}
                    {matchedBookings.map((b) => {
                      const isSelected = selectedBookingId === b.id;
                      const statusColor =
                        b.status === 'checked-in'
                          ? 'bg-brand-forest text-white'
                          : b.status === 'confirmed'
                          ? 'bg-[#1D403A]/85 text-brand-sand'
                          : 'bg-amber-600 text-white';

                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBookingId(b.id)}
                          style={{
                            gridColumnStart: b.startDay + 1,
                            gridColumnEnd: b.startDay + 1 + b.spanDays,
                          }}
                          className={`absolute inset-y-0.5 rounded-lg px-2 text-[10px] font-semibold flex items-center justify-between shadow-xs truncate cursor-pointer transition-all ${statusColor} ${
                            isSelected ? 'ring-2 ring-brand-forest ring-offset-1 scale-[1.02]' : 'hover:opacity-90'
                          }`}
                        >
                          <span className="truncate">{b.guest}</span>
                          <span className="text-[9px] opacity-80 ml-1 shrink-0">{b.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex items-center justify-between text-[11px] text-ink-muted border-t border-[#1C2D29]/8">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-forest" /> Checked-in
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1D403A]/85" /> Confirmed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" /> Deposit Pending
              </span>
            </div>
          </div>

          {/* Booking Inspector Dossier (5 Cols) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
                <div>
                  <span className="font-serif font-bold text-base text-brand-forest block">
                    {activeBooking.id}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    Room {activeBooking.roomNum} • {activeBooking.roomType}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-green/10 text-status-green border border-status-green/20 uppercase">
                  {activeBooking.status}
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-center text-ink-muted">
                  <span>Guest:</span>
                  <span className="font-semibold text-ink">{activeBooking.guest}</span>
                </div>

                <div className="flex justify-between items-center text-ink-muted">
                  <span>Booking Source:</span>
                  <span className="text-ink">{activeBooking.source}</span>
                </div>

                <div className="flex justify-between items-center text-ink-muted">
                  <span>Meal Plan:</span>
                  <span className="text-brand-forest font-medium">{activeBooking.mealPlan}</span>
                </div>

                <div className="p-3 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/8 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Total Tariff:</span>
                    <span className="font-mono font-bold text-brand-forest">{activeBooking.totalTariff}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Advance Deposit:</span>
                    <span className="font-mono text-status-green font-semibold">
                      {activeBooking.advancePaid}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C2D29]/8 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors text-center"
              >
                Manage Folio &amp; Stay
              </button>
              <button
                type="button"
                className="py-2 px-3 rounded-xl bg-white border border-[#1C2D29]/15 text-xs font-semibold text-ink hover:bg-brand-sand/50 transition-colors"
              >
                Send SMS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

