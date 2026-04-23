import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  // Kinuha natin ang isLoading galing sa AuthContext
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Habang naghihintay kay Supabase na basahin ang session sa background,
  // wag muna tayong mag-kick! Magpakita muna ng loading screen.
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium text-sm">Verifying session...</p>
      </div>
    );
  }

  // 2. Kapag TAPOS NA mag-load (isLoading is false) at WALA talagang naka-login,
  // diyan pa lang natin siya i-ki-kick pabalik sa Login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Kapag authenticated is directed na sa Admin page
  return <>{children}</>;
}