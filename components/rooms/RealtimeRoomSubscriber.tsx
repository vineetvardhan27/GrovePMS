'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '../../lib/supabase/client';
import { RoomWithCategory } from '../../lib/rooms/types';
import { RoomStatus, HousekeepingStatus } from '../../lib/types/database.types';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeRoomSubscriberProps {
  onRoomUpdated: (
    roomId: string,
    newStatus: RoomStatus,
    newHousekeepingStatus?: HousekeepingStatus
  ) => void;
}

export default function RealtimeRoomSubscriber({
  onRoomUpdated,
}: RealtimeRoomSubscriberProps) {
  const [isConnected, setIsConnected] = useState(true);

  // Keep a stable ref to latest onRoomUpdated callback without triggering effect re-runs
  const onRoomUpdatedRef = useRef(onRoomUpdated);
  useEffect(() => {
    onRoomUpdatedRef.current = onRoomUpdated;
  }, [onRoomUpdated]);

  useEffect(() => {
    // 1. Setup cross-tab BroadcastChannel for instantaneous updates
    let broadcast: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcast = new BroadcastChannel('hotel_pms_rooms_sync');
        broadcast.onmessage = (event) => {
          if (event.data?.type === 'ROOM_STATUS_UPDATED') {
            const { roomId, status, housekeeping_status } = event.data;
            onRoomUpdatedRef.current(roomId, status, housekeeping_status);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization error:', err);
      }
    }

    // 2. Setup Supabase Realtime postgres_changes subscription (Single stable channel)
    let channel: any = null;
    const supabase = createClient();
    try {
      channel = supabase
        .channel('rooms-realtime-channel')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rooms',
          },
          (payload: any) => {
            const newRow = payload.new;
            if (newRow && newRow.id) {
              onRoomUpdatedRef.current(newRow.id, newRow.status, newRow.housekeeping_status);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setIsConnected(false);
          }
        });
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err);
      setIsConnected(false);
    }

    return () => {
      if (broadcast) {
        try {
          broadcast.close();
        } catch {}
      }
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, []); // Stable: runs ONCE on mount, cleans up ONCE on unmount

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-tiny font-medium bg-status-green/10 text-status-green border border-status-green/20">
      <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
      <span>Realtime Sync Live</span>
    </div>
  );
}

/**
 * Utility to broadcast room changes to other open tabs
 */
export function broadcastRoomChange(
  roomId: string,
  status: RoomStatus,
  housekeepingStatus?: HousekeepingStatus
) {
  try {
    const broadcast = new BroadcastChannel('hotel_pms_rooms_sync');
    broadcast.postMessage({
      type: 'ROOM_STATUS_UPDATED',
      roomId,
      status,
      housekeeping_status: housekeepingStatus,
    });
    broadcast.close();
  } catch {
    // Ignore
  }
}
