'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BedDouble,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Clock,
  Calendar,
  Wrench,
} from 'lucide-react';
import { RoomWithCategory, RoomCategory } from '../../lib/rooms/queries';
import { updateRoomStatusAction } from '../../lib/rooms/actions';
import { RoomStatus, HousekeepingStatus } from '../../lib/types/database.types';
import RoomCard, { STATUS_CONFIG } from '../rooms/RoomCard';
import RoomDetailDrawer from '../rooms/RoomDetailDrawer';
import RealtimeRoomSubscriber, { broadcastRoomChange } from '../rooms/RealtimeRoomSubscriber';

interface DashboardRoomGridProps {
  initialRooms: RoomWithCategory[];
  categories: RoomCategory[];
}

export default function DashboardRoomGrid({
  initialRooms,
  categories,
}: DashboardRoomGridProps) {
  const [rooms, setRooms] = useState<RoomWithCategory[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithCategory | null>(null);

  // Realtime update handler
  const handleRoomUpdated = (
    roomId: string,
    newStatus: RoomStatus,
    newHousekeepingStatus?: HousekeepingStatus
  ) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: newStatus,
              housekeeping_status:
                newHousekeepingStatus ||
                (newStatus === 'cleaning' ? 'dirty' : r.housekeeping_status),
            }
          : r
      )
    );

    setSelectedRoom((prev) =>
      prev && prev.id === roomId
        ? {
            ...prev,
            status: newStatus,
            housekeeping_status:
              newHousekeepingStatus ||
              (newStatus === 'cleaning' ? 'dirty' : prev.housekeeping_status),
          }
        : prev
    );
  };

  // Status changer from drawer
  const handleUpdateStatus = async (
    roomId: string,
    newStatus: RoomStatus,
    newHousekeepingStatus?: HousekeepingStatus
  ) => {
    // 1. Optimistic UI update
    handleRoomUpdated(roomId, newStatus, newHousekeepingStatus);

    // 2. Broadcast to other tabs
    broadcastRoomChange(roomId, newStatus, newHousekeepingStatus);

    // 3. Persist to server / Supabase
    await updateRoomStatusAction(roomId, newStatus, newHousekeepingStatus);
  };

  // Group rooms by floor
  const floors = [1, 2, 3].map((f) => ({
    floor: f,
    rooms: rooms.filter((r) => r.floor === f),
  }));

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-5 md:p-6 shadow-2xs space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <h2 className="text-h1 font-serif text-brand-forest">Live Room Chart</h2>
          <RealtimeRoomSubscriber onRoomUpdated={handleRoomUpdated} />
        </div>

        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light hover:underline transition-colors shrink-0"
        >
          <span>Full Room Management</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Floors grid */}
      <div className="space-y-4">
        {floors.map(({ floor, rooms: floorRooms }) => (
          <div key={floor} className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-medium text-ink-muted px-1">
              <span className="font-serif font-bold text-brand-forest">
                Floor {floor}
              </span>
              <span>{floorRooms.length} Rooms</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {floorRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onClick={setSelectedRoom}
                  isSelected={selectedRoom?.id === room.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      <RoomDetailDrawer
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
