'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '../../lib/supabase/client';
import { StaffProfile } from '../../lib/auth/session';
import { StaffRole } from '../../lib/types/database.types';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  staff: StaffProfile | null;
  role: StaffRole | null;
  hotelId: string | null;
  hotelName: string | null;
  hotelLogoUrl: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshStaff: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  staff: null,
  role: null,
  hotelId: null,
  hotelName: null,
  hotelLogoUrl: null,
  isLoading: true,
  isAuthenticated: false,
  refreshStaff: async () => {},
});

export function AuthProvider({
  children,
  initialStaff = null,
}: {
  children: React.ReactNode;
  initialStaff?: StaffProfile | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<StaffProfile | null>(initialStaff);
  const [isLoading, setIsLoading] = useState<boolean>(!initialStaff);

  const supabase = createClient();

  const fetchStaffProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      let { data: staffData, error: staffErr } = (await supabase
        .from('staff')
        .select(`
          id,
          email,
          full_name,
          role,
          is_active,
          hotel_id,
          hotel:hotel_id (
            id,
            name,
            slug,
            settings
          )
        `)
        .eq('id', userId)
        .maybeSingle()) as { data: any; error: any };

      if (staffErr) {
        console.error('AuthProvider: error fetching staff profile:', staffErr.message);
      }

      if (!staffData && userEmail) {
        const { data: staffByEmail } = await supabase
          .from('staff')
          .select(`
            id,
            email,
            full_name,
            role,
            is_active,
            hotel_id,
            hotel:hotel_id (
              id,
              name,
              slug,
              settings
            )
          `)
          .ilike('email', userEmail.trim().toLowerCase())
          .maybeSingle();

        if (staffByEmail) {
          staffData = staffByEmail;
        }
      }

      if (staffData && staffData.is_active && staffData.hotel_id) {
        const hotelData = staffData.hotel as any;
        const hotelSettings = hotelData?.settings || null;
        const hotelLogoUrl = hotelSettings?.logo_url || hotelData?.logo_url || null;

        setStaff({
          id: staffData.id,
          email: staffData.email,
          full_name: staffData.full_name,
          role: staffData.role as StaffRole,
          hotel_id: staffData.hotel_id,
          hotel_name: hotelData?.name || 'Hotel Greenery View',
          hotel_slug: hotelData?.slug || 'hotel-greenery-view',
          hotel_logo_url: hotelLogoUrl,
          hotel_settings: hotelSettings,
          is_active: staffData.is_active,
        });
      } else {
        setStaff(null);
      }

    } catch (err) {
      console.error('AuthProvider: unexpected error:', err);
      setStaff(null);
    }
  }, [supabase]);

  const refreshStaff = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        await fetchStaffProfile(currentUser.id, currentUser.email);
      } else {
        setStaff(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchStaffProfile]);

  useEffect(() => {
    // Initial fetch
    refreshStaff();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchStaffProfile(currentUser.id, currentUser.email);
      } else {
        setStaff(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchStaffProfile, refreshStaff]);

  return (
    <AuthContext.Provider
      value={{
        user,
        staff,
        role: staff?.role ?? null,
        hotelId: staff?.hotel_id ?? null,
        hotelName: staff?.hotel_name ?? null,
        hotelLogoUrl: staff?.hotel_logo_url ?? null,
        isLoading,
        isAuthenticated: Boolean(user && staff),
        refreshStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
