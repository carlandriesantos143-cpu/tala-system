import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface BHWUser {
  id: string;
  name: string;
  email: string;
  role: "BHW Admin" | "BHW Staff";
  barangay: string;
  avatar?: string;
}

interface AuthContextType {
  user: BHWUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo accounts
const DEMO_ACCOUNTS: Record<string, { password: string; user: BHWUser }> = {
  "maria.santos@bhw.gov.ph": {
    password: "admin123",
    user: {
      id: "bhw-001",
      name: "Maria Santos",
      email: "maria.santos@bhw.gov.ph",
      role: "BHW Admin",
      barangay: "Barangay San Isidro",
    },
  },
  "juan.delacruz@bhw.gov.ph": {
    password: "staff123",
    user: {
      id: "bhw-002",
      name: "Juan Dela Cruz",
      email: "juan.delacruz@bhw.gov.ph",
      role: "BHW Staff",
      barangay: "Barangay San Isidro",
    },
  },
};

const SESSION_KEY = "tala_bhw_session";

function loadSession(): BHWUser | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BHWUser | null>(loadSession);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));

    const account = DEMO_ACCOUNTS[email.toLowerCase().trim()];
    if (!account) {
      return { success: false, error: "No account found with this email address" };
    }
    if (account.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    setUser(account.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(account.user));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
