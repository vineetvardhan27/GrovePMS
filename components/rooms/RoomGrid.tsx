'use client';

import { useState, useMemo } from 'react';
import {
  BedDouble,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  Users,
  Clock,
  Calendar,
  Wrench,
} from 'lucide-react';
import { RoomWithCategory, RoomCategory, PropertyResource } from '../../lib/rooms/types';
import { updateRoomStatusAction } from '../../lib/rooms/actions';
import { RoomStatus, HousekeepingStatus } from '../../lib/types/database.types';
import RoomCard, { STATUS_CONFIG } from './RoomCard';
import RoomDetailDrawer from './RoomDetailDrawer';
import RealtimeRoomSubscriber, { broadcastRoomChange } from './RealtimeRoomSubscriber';

interface RoomGridProps {
  initialRooms: RoomWithCategory[];
  categories: RoomCategory[];
  propertyResources?: PropertyResource[];
}

function getFloorLabel(floorNum: number): string {
  if (floorNum === 0) return 'Basement (Family Accommodation)';
  if (floorNum === 1) return 'Ground Floor — Road Level';
  if (floorNum === 2) return 'First Floor';
  if (floorNum === 3) return 'Second Floor';
  if (floorNum === 4) return 'Upper Floor';
  return `Floor ${floorNum}`;
}

export default function RoomGrid({
  initialRooms,
  categories,
  propertyResources = [],
}: RoomGridProps) {
  const [rooms, setRooms] = useState<RoomWithCategory[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupByFloor, setGroupByFloor] = useState<boolean>(true);

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

    // If currently open in drawer, update selected room too
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
    handleRoomUpdated(roomId, newStatus, newHousekeepingStatus);
    broadcastRoomChange(roomId, newStatus, newHousekeepingStatus);
    await updateRoomStatusAction(roomId, newStatus, newHousekeepingStatus);
  };

  // Status counts for filter chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: rooms.length,
      available: 0,
      occupied: 0,
      arriving_today: 0,
      reserved: 0,
      cleaning: 0,
      maintenance: 0,
    };
    rooms.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });
    return counts;
  }, [rooms]);

  // Filtered accommodation rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && r.category_id !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const floorName = getFloorLabel(r.floor).toLowerCase();
        const matchesRoom = r.room_number.toLowerCase().includes(q);
        const matchesCategory = r.category.name.toLowerCase().includes(q);
        const matchesFloor = floorName.includes(q);
        if (!matchesRoom && !matchesCategory && !matchesFloor) return false;
      }
      return true;
    });
  }, [rooms, statusFilter, categoryFilter, searchQuery]);

  // Group rooms by floor (0=Basement, 1=Ground, 2=First, 3=Second, 4=Upper)
  const floors = useMemo(() => {
    const floorMap: Record<number, RoomWithCategory[]> = {};
    filteredRooms.forEach((room) => {
      const f = room.floor !== undefined && room.floor !== null ? room.floor : 1;
      if (!floorMap[f]) floorMap[f] = [];
      floorMap[f].push(room);
    });
    return Object.entries(floorMap).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredRooms]);

  return (
    <div className="space-y-6">
      {/* Top action bar with Realtime indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest">
                Accommodation Inventory
              </h2>
              <span className="bg-brand-forest/10 text-brand-forest px-2.5 py-0.5 rounded-full text-xs font-semibold">
                19 Units
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              18 Rooms (801–818) + 1 Basement Family Apartment
            </p>
          </div>
          <RealtimeRoomSubscriber onRoomUpdated={handleRoomUpdated} />
        </div>

        {/* Group by toggle & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 801-818, Family Apt..."
              className="w-full sm:w-52 pl-9 pr-3 py-2 bg-white border border-border-subtle rounded-lg text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <button
            type="button"
            onClick={() => setGroupByFloor(!groupByFloor)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer min-h-touch ${
              groupByFloor
                ? 'bg-brand-forest text-white border-brand-forest'
                : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{groupByFloor ? 'Floor Grouping' : 'Flat Grid'}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer min-h-touch flex items-center ${
            statusFilter === 'all'
              ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
              : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
          }`}
        >
          All Accommodation Units ({statusCounts.all})
        </button>

        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isSelected = statusFilter === key;
          const count = statusCounts[key] || 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer min-h-touch ${
                isSelected
                  ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                  : `bg-white ${cfg.textClass} border-border-subtle hover:bg-brand-sand`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cfg.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-ink-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rooms Display */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-subtle p-10 text-center">
          <BedDouble className="w-8 h-8 text-ink-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-ink">No accommodation units match your filter criteria.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
              setCategoryFilter('all');
            }}
            className="mt-3 text-xs text-brand-forest font-semibold underline p-2 min-h-touch inline-flex items-center"
          >
            Clear filters
          </button>
        </div>
      ) : groupByFloor ? (
        /* Grouped by Floor View */
        <div className="space-y-8">
          {floors.map(([floorNum, floorRooms]) => {
            const availableCount = floorRooms.filter((r) => r.status === 'available').length;
            const occupiedCount = floorRooms.filter((r) => r.status === 'occupied').length;
            const isBasement = Number(floorNum) === 0;

            return (
              <div key={floorNum} className="space-y-3.5">
                {/* Floor Header Bar */}
                <div className="flex items-center justify-between bg-brand-sand-dark/60 px-4 py-2.5 rounded-xl border border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-brand-forest">
                      {getFloorLabel(Number(floorNum))}
                    </span>
                    <span className="text-xs text-ink-muted">
                      ({floorRooms.length} {isBasement ? 'Apartment Unit' : 'Rooms'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-status-green font-medium">
                      {availableCount} Available
                    </span>
                    <span className="text-status-red font-medium">
                      {occupiedCount} Occupied
                    </span>
                  </div>
                </div>

                {/* Grid for this floor */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
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
            );
          })}
        </div>
      ) : (
        /* Flat Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onClick={setSelectedRoom}
              isSelected={selectedRoom?.id === room.id}
            />
          ))}
        </div>
      )}

      {/* Room Detail Drawer on Click */}
      <RoomDetailDrawer
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
