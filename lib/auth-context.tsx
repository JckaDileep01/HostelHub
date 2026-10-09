'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  switchHostel: (hostelId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  switchHostel: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialLoadDone = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        void loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
      initialLoadDone = true;
    }).catch((error) => {
      console.error('Error restoring session:', error);
      setLoading(false);
      initialLoadDone = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Skip the very first fired event — it duplicates getSession() on page load
      if (!initialLoadDone) return;
      setSession(session);
      if (session) {
        (async () => {
          await loadProfile(session.user.id);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
    }

    let loadedProfile = data as Profile | null;
    if (loadedProfile && typeof window !== 'undefined') {
      const savedHostelId = localStorage.getItem(`hostelhub_active_hostel_${userId}`);
      if (savedHostelId) {
        loadedProfile = { ...loadedProfile, hostel_id: savedHostelId };
      }
    }

    setProfile(loadedProfile);
    setLoading(false);
  }

  async function switchHostel(hostelId: string) {
    if (!session?.user?.id) return;

    // Save to localStorage for instant persistence across reloads/sessions
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hostelhub_active_hostel_${session.user.id}`, hostelId);
    }

    // Immediately update profile in React state so all hooks, pages, and components react instantly
    setProfile((prev) => (prev ? { ...prev, hostel_id: hostelId } : null));

    // Also attempt to update the profile in the database (safely handling column RLS restrictions)
    try {
      await supabase
        .from('profiles')
        .update({ hostel_id: hostelId })
        .eq('id', session.user.id);
    } catch (e) {
      console.warn('DB profile update for hostel_id ignored:', e);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut, switchHostel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

