import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null; // TEMPORARY: Replace with Database['public']['Tables']['users']['Row'] after Supabase types are generated
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<{ success: boolean; error: string | null }>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      set({ user: null, session: null, loading: false });
      return;
    }
    if (session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
        set({ user: null, session: null, loading: false });
        return;
      }
      set({ user, session, loading: false });
    } else {
      set({ user: null, session: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Sign-in error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
    set({ user: data.user, session: data.session, loading: false });
    return { success: true, error: null };
  },

  signUp: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error('Sign-up error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
    set({ user: data.user, session: data.session, loading: false });
    return { success: true, error: null };
  },

  signOut: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
    set({ user: null, session: null, loading: false });
    return { success: true, error: null };
  },
}));

// Fetch user on store initialization
useAuthStore.getState().fetchUser();