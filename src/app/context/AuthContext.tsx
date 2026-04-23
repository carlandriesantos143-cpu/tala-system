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
    // 1. Initial Auth Check (Optimistic UI for INSTANT Load)
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // OPTIMISTIC LOAD: Papasukin agad ang user gamit ang placeholder data
          // para hindi siya ma-kick out habang naghihintay magising ang database!
          setUser({
            id: session.user.id,
            full_name: session.user.email?.split('@')[0] || 'BHW Admin',
            email: session.user.email || '',
            barangay: 'Loading...',
            is_active: true,
          });
          
          setIsLoading(false); // Patayin agad ang loading screen (1 sec pasok agad!)
          
          // Kunin ang totoong profile sa background nang tahimik
          await loadUserProfile(session.user.id);
          return;
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();

    // 2. Listen for Login/Logout events
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
      const { data, error } = await supabase
          .from('bhw_users')
          .select('*')
          .eq('id', userId)
          .single();

      if (!error && data) {
        setUser(data as BHWUser); // I-update ang UI gamit ang totoong data kapag nakuha na
      }
    } catch (err) {
      console.error("Background profile fetch error:", err);
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