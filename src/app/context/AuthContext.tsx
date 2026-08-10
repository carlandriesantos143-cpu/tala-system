import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from '../utils/supabase/client';

export interface BHWUser {
  id: string;
  full_name: string;
  email: string;
  barangay: string;
  avatar_url?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: BHWUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<BHWUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    try {
      // getSession() ay LOCAL read mula sa storage na pinamamahalaan ng supabase-js,
      // kaya gumagana ito kahit offline. Hindi tulad ng dating code na nagbabasa ng
      // hilaw na localStorage key at nagtitiwala kahit kanino, ang supabase na ang
      // may hawak ng session na ito.
      //
      // Safety timeout lang ito para hindi mag-freeze ang app kung sakaling mag-hang.
      // MAHALAGA: kapag nag-timeout, FAIL CLOSED tayo (session = null) — mananatiling
      // naka-logout at ire-redirect sa /login. Hindi na tayo nagbibigay ng access
      // mula sa hindi na-validate na localStorage (yun ang dating spoof risk / C2).
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 5000)
      );

      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;

      if (session?.user) {
        // Provisional user mula sa session para mabilis mag-render ang UI;
        // ang buong profile ay kinukuha sa background.
        setUser({
          id: session.user.id,
          full_name: session.user.email?.split('@')[0] || 'BHW Admin',
          email: session.user.email || '',
          barangay: 'Loading...',
          is_active: true,
        });
        loadUserProfile(session.user.id);
      }
    } catch (err) {
      // Fail closed: manatiling naka-logout (null user) kapag may pumalpak.
      console.error("Auth init error:", err);
    } finally {
      setIsLoading(false); // Patayin ang loading screen kahit anong mangyari
    }
  };

    initAuth();

    // Listen for Login/Logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') await supabase.auth.getSession();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fetch the BHW Admin profile (Walang strict timeout para iwas error sa Cold Start)
  const loadUserProfile = async (userId: string) => {
    try {
      // Lagyan din natin ng 5-second timeout ang pag-fetch ng profile
      const fetchPromise = supabase.from('bhw_users').select('*').eq('id', userId).single();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('profile_timeout')), 5000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (!error && data) {
        setUser(data as BHWUser);
      }
    } catch (err) {
      console.error("Background profile fetch error or timeout:", err);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Login failed. Try again.' };

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Connection error. Please check your internet.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
