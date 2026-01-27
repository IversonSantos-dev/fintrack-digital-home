import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
}));

// Initialize auth listener once
let authInitialized = false;

const initializeAuth = () => {
  if (authInitialized) return;
  authInitialized = true;

  const { setUser, setSession, setLoading, setInitialized } = useAuthStore.getState();

  // Set up auth state listener
  supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
    setInitialized(true);
  });

  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
    setInitialized(true);
  });
};

// Initialize on module load
initializeAuth();

export const useAuth = () => {
  const { user, session, loading, initialized } = useAuthStore();

  // Ensure auth is initialized when hook is used
  useEffect(() => {
    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/app`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Navigation should be handled by the component calling signOut
    window.location.href = '/auth';
  };

  return {
    user,
    session,
    loading: loading && !initialized,
    signIn,
    signUp,
    signOut,
  };
};
