import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminLayout } from "./components/layout/AdminLayout";
import { MobileLayout } from "./components/layout/MobileLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/app",
    Component: MobileLayout,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
  },
]);
