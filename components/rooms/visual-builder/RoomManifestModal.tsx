'use client';

import React, { useState } from 'react';
import { X, Search, Check, Edit2, ShieldCheck, BedDouble, Filter } from 'lucide-react';
import { GeneratedRoom } from './types';

interface RoomManifestModalProps {
  isOpen: boolean;
  rooms: GeneratedRoom[];
  onUpdateRoomNumber: (roomId: string, newNumber: string) => void;
  onClose: () => void;
}

export default function RoomManifestModal({
  isOpen,
  rooms,
  onUpdateRoomNumber,
  onClose,
}: RoomManifestModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomNumberVal, setEditRoomNumberVal] = useState('');

  if (!isOpen) return null;

  const floorsList = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.floorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = floorFilter === 'all' || room.floor === floorFilter;
    return matchesSearch && matchesFloor;
  });

  const handleStartEdit = (room: GeneratedRoom) => {
    setEditingRoomId(room.id);
    setEditRoomNumberVal(room.roomNumber);
  };

  const handleSaveEdit = (roomId: string) => {
    const trimmed = editRoomNumberVal.trim();
    if (trimmed) {
      onUpdateRoomNumber(roomId, trimmed);
    }
    setEditingRoomId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-[28px] shadow-2xl border border-border-subtle overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-forest text-white flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-black">
                Generated Room Inventory Manifest
              </h3>
              <p className="text-xs text-ink-muted">
                Review all {rooms.length} generated rooms across your property layout
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-ink-muted hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room number or category..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-border-subtle rounded-xl text-xs text-black placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-forest/20"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <select
              value={floorFilter}
              onChange={(e) =>
                setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-3 py-1.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="all">All Floors ({rooms.length} rooms)</option>
              {floorsList.map((f) => (
                <option key={f} value={f}>
                  Floor {f} ({rooms.filter((r) => r.floor === f).length} rooms)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border-subtle/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-ink-muted sticky top-0 uppercase font-bold text-[10px] tracking-wider z-10 border-b border-border-subtle/80">
              <tr>
                <th className="px-5 py-3">Room #</th>
                <th className="px-4 py-3">Floor Level</th>
                <th className="px-4 py-3">Room Category</th>
                <th className="px-4 py-3 text-right">Base Tariff</th>
                <th className="px-4 py-3 text-right">Weekend Tariff</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40 bg-white">
              {filteredRooms.map((room) => {
                const isEditing = editingRoomId === room.id;
                return (
                  <tr key={room.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-black">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editRoomNumberVal}
                            onChange={(e) => setEditRoomNumberVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(room.id);
                              if (e.key === 'Escape') setEditingRoomId(null);
                            }}
                            autoFocus
                            className="w-20 px-2 py-0.5 bg-white border border-brand-forest rounded text-xs font-mono font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(room.id)}
                            className="p-1 rounded bg-brand-forest text-white hover:bg-brand-forest-light"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{room.roomNumber}</span>
                          {room.isCustomOverride && (
                            <span className="text-[9px] bg-amber-500/15 text-amber-900 px-1.5 py-0.2 rounded font-sans uppercase">
                              Custom
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted font-medium">
                      {room.floorName} (Lvl 0{room.floor})
                    </td>
                    <td className="px-4 py-3 font-semibold text-black">
                      {room.categoryName}
                    </td>
                    <td className="px-4 py-3 text-right font-serif font-bold text-black">
                      ₹{room.baseRate.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-serif text-ink-muted">
                      {room.weekendRate ? `₹${room.weekendRate.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(room)}
                          className="px-2 py-1 rounded-lg border border-border-subtle bg-white hover:bg-brand-sand/60 text-[11px] text-brand-forest font-medium inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Rename</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRooms.length === 0 && (
            <div className="py-12 text-center text-ink-muted text-xs">
              No rooms match your filter criteria.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-[#FAF8F5] flex items-center justify-between text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All rooms initialized with clean status &amp; available occupancy</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
}

