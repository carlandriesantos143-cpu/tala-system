import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { OfflineBadge } from "./components/shared/OfflineBadge";
import { InstallPrompt } from "./components/shared/InstallPrompt";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    // ErrorBoundary sa pinakalabas para masalo ang error kahit saang page (pati
    // sa loob ng AuthProvider) — iwas blank white screen.
    <ErrorBoundary>
      <AuthProvider>
        {/* Mga Global UI Overlays */}
        <OfflineBadge />
        <InstallPrompt />
        {/* Toaster: dito lumalabas ang lahat ng toast (success/error) ng buong app */}
        <Toaster richColors position="top-right" />

        {/* Main System Router */}
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}