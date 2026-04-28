import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { OfflineBadge } from "./components/shared/OfflineBadge";
import { InstallPrompt } from "./components/shared/InstallPrompt";

export default function App() {
  return (
    <AuthProvider>
      {/* Mga Global UI Overlays */}
      <OfflineBadge />
      <InstallPrompt />
      
      {/* Main System Router */}
      <RouterProvider router={router} />
    </AuthProvider>
  );
}