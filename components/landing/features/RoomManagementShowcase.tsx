'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  BedDouble,
  Sparkles,
  CheckCircle2,
  Clock,
  Wrench,
  Users,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
} from 'lucide-react';

interface RoomItem {
  num: string;
  floor: number;
  type: string;
  status: 'AVL' | 'OCC' | 'CLN' | 'OOO';
  guest?: string;
  tariff: string;
  nights?: string;
  housekeeper?: string;
}

export default function RoomManagementShowcase() {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<string>('102');

  const allRooms: RoomItem[] = [
    // Floor 1
    { num: '101', floor: 1, type: 'Deluxe King', status: 'OCC', guest: 'Ananya Sharma', tariff: '₹4,500', nights: '2 Nights (Dep Today)', housekeeper: 'Ramesh K.' },
    { num: '102', floor: 1, type: 'Superior Twin', status: 'AVL', tariff: '₹3,800', housekeeper: 'Deepa M. (Inspected 12m ago)' },
    { num: '103', floor: 1, type: 'Deluxe King', status: 'CLN', tariff: '₹4,500', housekeeper: 'Sunita P. (Turnaround in progress)' },
    { num: '104', floor: 1, type: 'Garden Villa', status: 'OCC', guest: 'Capt. R. Deshmukh', tariff: '₹6,200', nights: '3 Nights', housekeeper: 'Ramesh K.' },
    // Floor 2
    { num: '201', floor: 2, type: 'Deluxe King', status: 'OCC', guest: 'Vikram Malhotra', tariff: '₹4,500', nights: '1 Night', housekeeper: 'Sunita P.' },
    { num: '202', floor: 2, type: 'Executive Suite', status: 'AVL', tariff: '₹7,500', housekeeper: 'Deepa M. (Ready for arrival)' },
    { num: '203', floor: 2, type: 'Superior Twin', status: 'OCC', guest: 'Dr. S. Kulkarni', tariff: '₹3,800', nights: '4 Nights', housekeeper: 'Ramesh K.' },
    { num: '204', floor: 2, type: 'Executive Suite', status: 'OOO', tariff: '₹7,500', housekeeper: 'Engineering (AC Filter Servicing)' },
    // Floor 3
    { num: '301', floor: 3, type: 'Heritage Penthouse', status: 'AVL', tariff: '₹9,500', housekeeper: 'Deepa M. (Inspected)' },
    { num: '302', floor: 3, type: 'Deluxe King', status: 'OCC', guest: 'Kabir & Nina Mehta', tariff: '₹4,500', nights: '2 Nights', housekeeper: 'Sunita P.' },
    { num: '303', floor: 3, type: 'Deluxe King', status: 'CLN', tariff: '₹4,500', housekeeper: 'Sunita P. (Linen Change)' },
    { num: '304', floor: 3, type: 'Heritage Penthouse', status: 'OCC', guest: 'Sameer Singhania', tariff: '₹9,500', nights: '5 Nights (VIP)', housekeeper: 'Ramesh K.' },
  ];

  const currentRooms = allRooms.filter((r) => r.floor === selectedFloor);
  const activeRoomData = allRooms.find((r) => r.num === selectedRoom) || currentRooms[0];

  const statusConfig = {
    AVL: { label: 'Available', badgeBg: 'bg-status-green/10 text-status-green border-status-green/25', tileClass: 'bg-status-green/[0.06] border-status-green/25 text-status-green hover:bg-status-green/[0.12]' },
    OCC: { label: 'Occupied', badgeBg: 'bg-status-red/10 text-status-red border-status-red/25', tileClass: 'bg-status-red/[0.06] border-status-red/25 text-status-red hover:bg-status-red/[0.12]' },
    CLN: { label: 'Cleaning', badgeBg: 'bg-status-amber/10 text-status-amber border-status-amber/25', tileClass: 'bg-status-amber/[0.06] border-status-amber/25 text-status-amber hover:bg-status-amber/[0.12]' },
    OOO: { label: 'Out of Order', badgeBg: 'bg-gray-500/10 text-gray-600 border-gray-400/25', tileClass: 'bg-gray-500/[0.06] border-gray-400/25 text-gray-700 hover:bg-gray-500/[0.12]' },
  };

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
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-60"
          aria-hidden="true"
        />

        {/* Specular highlight lines */}
        <div
          className="pointer-events-none absolute inset-x-8 sm:inset-x-16 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent z-20"
          aria-hidden="true"
        />

        {/* Top Control Chrome */}
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
                  Visual Room Matrix
                </span>
                <span className="text-xs text-ink-muted hidden sm:inline">—</span>
                <span className="text-xs text-ink-muted font-medium hidden sm:inline">
                  Floor-by-Floor Operations
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">12 Rooms Configured • 3 Active Floors</p>
            </div>
          </div>

          {/* Floor Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/70 border border-white/90 shadow-2xs">
            {[1, 2, 3].map((floor) => (
              <button
                key={floor}
                type="button"
                onClick={() => {
                  setSelectedFloor(floor);
                  const firstRoom = allRooms.find((r) => r.floor === floor);
                  if (firstRoom) setSelectedRoom(firstRoom.num);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFloor === floor
                    ? 'bg-brand-forest text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid & Inspection Drawer (Split 7 / 5 on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 relative z-10">
          {/* Room Tiles Matrix (7 Cols) */}
          <div className="lg:col-span-7 bg-white/65 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
              <span className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                Rooms on Floor {selectedFloor}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-semibold">
                <span className="inline-flex items-center gap-1 text-status-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-green" /> AVL
                </span>
                <span className="inline-flex items-center gap-1 text-status-red">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-red" /> OCC
                </span>
                <span className="inline-flex items-center gap-1 text-status-amber">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-amber" /> CLN
                </span>
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> OOO
                </span>
              </div>
            </div>

            {/* Room Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {currentRooms.map((room) => {
                const isSelected = selectedRoom === room.num;
                const cfg = statusConfig[room.status];

                return (
                  <button
                    key={room.num}
                    type="button"
                    onClick={() => setSelectedRoom(room.num)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${cfg.tileClass} ${
                      isSelected
                        ? 'ring-2 ring-brand-forest ring-offset-1 bg-white shadow-sm'
                        : 'shadow-2xs'
                    }`}
                  >
                    <span className="text-sm sm:text-base font-bold text-ink block leading-tight">
                      {room.num}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider mt-0.5">
                      {room.status}
                    </span>
                    <span className="block text-[9.5px] text-ink-muted/80 truncate mt-1">
                      {room.type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-ink-muted gap-2 border-t border-[#1C2D29]/8">
              <span>Click any room tile to inspect stay &amp; housekeeping data</span>
              <span className="font-semibold text-brand-forest">Floor {selectedFloor} Occupancy: 50%</span>
            </div>
          </div>

          {/* Active Room Detail Drawer (5 Cols) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
                <div>
                  <span className="font-serif font-bold text-base text-brand-forest block">
                    Room {activeRoomData.num} — Details
                  </span>
                  <span className="text-[11px] text-ink-muted">{activeRoomData.type}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    statusConfig[activeRoomData.status].badgeBg
                  }`}
                >
                  {statusConfig[activeRoomData.status].label}
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-center text-ink-muted">
                  <span>Standard Tariff:</span>
                  <span className="font-mono font-bold text-brand-forest">{activeRoomData.tariff} / night</span>
                </div>

                {activeRoomData.guest && (
                  <div className="flex justify-between items-center text-ink-muted">
                    <span>Occupying Guest:</span>
                    <span className="font-semibold text-ink">{activeRoomData.guest}</span>
                  </div>
                )}

                {activeRoomData.nights && (
                  <div className="flex justify-between items-center text-ink-muted">
                    <span>Stay Duration:</span>
                    <span className="text-ink">{activeRoomData.nights}</span>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/8 space-y-1">
                  <div className="flex items-center gap-1.5 text-brand-forest font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-status-green" />
                    <span>Housekeeping &amp; Inspection</span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    {activeRoomData.housekeeper}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions for Room */}
            <div className="pt-2 border-t border-[#1C2D29]/8 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors text-center"
              >
                {activeRoomData.status === 'AVL'
                  ? 'Assign Guest'
                  : activeRoomData.status === 'CLN'
                  ? 'Mark Clean & Inspected'
                  : 'View Live Folio'}
              </button>
              <button
                type="button"
                className="py-2 px-3 rounded-xl bg-white border border-[#1C2D29]/15 text-xs font-semibold text-ink hover:bg-brand-sand/50 transition-colors"
              >
                Room Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

