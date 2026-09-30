'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '../../lib/supabase/client';
import type { StaffProfile } from '../../lib/auth/types';
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

function hasClientAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('-auth-token') || document.cookie.includes('sb-');
}

export function AuthProvider({
  children,
  initialStaff = null,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialStaff?: StaffProfile | null;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [staff, setStaff] = useState<StaffProfile | null>(initialStaff);
  const [isLoading, setIsLoading] = useState<boolean>(!initialStaff);

  // Synchronize state if server-rendered initialStaff prop changes (e.g. after server action revalidation / account switch)
  const [prevStaffId, setPrevStaffId] = useState<string | null>(initialStaff?.id ?? null);
  if (initialStaff && initialStaff.id !== prevStaffId) {
    setPrevStaffId(initialStaff.id);
    setStaff(initialStaff);
    if (initialUser) {
      setUser(initialUser);
    }
    setIsLoading(false);
  }

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
            logo_url,
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
              logo_url,
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
        const hotelLogoUrl = hotelData?.logo_url || hotelData?.settings?.logo_url || null;

        setStaff({
          id: staffData.id,
          email: staffData.email,
          full_name: staffData.full_name,
          role: staffData.role as StaffRole,
          hotel_id: staffData.hotel_id,
          hotel_name: hotelData?.name || 'Hotel Greenery View',
          hotel_slug: hotelData?.slug || 'hotel-greenery-view',
          hotel_logo_url: hotelLogoUrl,
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
    // If initialStaff was already provided by the server, skip redundant initial client fetch
    if (!initialStaff) {
      if (hasClientAuthCookie()) {
        refreshStaff();
      } else {
        setIsLoading(false);
      }
    }

    // Subscribe to auth state changes for real-time reactivity
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;

      // On INITIAL_SESSION: If initialStaff was provided and matches session user, skip duplicate fetch
      if (event === 'INITIAL_SESSION') {
        if (currentUser) {
          setUser(currentUser);
          if (initialStaff && initialStaff.id === currentUser.id) {
            setIsLoading(false);
            return;
          }
          await fetchStaffProfile(currentUser.id, currentUser.email);
        } else if (!initialStaff) {
          setUser(null);
          setStaff(null);
        }
        setIsLoading(false);
        return;
      }

      // On TOKEN_REFRESHED: Tokens refreshed in background, user identity is unchanged
      if (event === 'TOKEN_REFRESHED') {
        if (currentUser) {
          setUser(currentUser);
          if (staff && staff.id === currentUser.id) {
            return;
          }
        }
      }

      // On SIGNED_OUT: Clear active staff context
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStaff(null);
        setIsLoading(false);
        return;
      }

      // On SIGNED_IN or USER_UPDATED: Fetch the new active staff profile
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
  }, [supabase, fetchStaffProfile, refreshStaff, initialStaff]);

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
        isAuthenticated: Boolean((user || staff) && staff),
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
