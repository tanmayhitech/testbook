import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.js";
import { PublicRoute } from "./PublicRoute.js";
import { AppLayout } from "../layouts/AppLayout.js";
import { AuthLayout } from "../layouts/AuthLayout.js";
import { Loader2 } from "lucide-react";

// Lazy-loaded page components for route-based code splitting
const LandingPage = React.lazy(() =>
  import("../pages/LandingPage.js").then((m) => ({ default: m.LandingPage }))
);
const LoginPage = React.lazy(() =>
  import("../pages/LoginPage.js").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = React.lazy(() =>
  import("../pages/RegisterPage.js").then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = React.lazy(() =>
  import("../pages/DashboardPage.js").then((m) => ({ default: m.DashboardPage }))
);
const RepositoriesPage = React.lazy(() =>
  import("../pages/RepositoriesPage.js").then((m) => ({ default: m.RepositoriesPage }))
);
const RepositoryDetailPage = React.lazy(() =>
  import("../pages/RepositoryDetailPage.js").then((m) => ({ default: m.RepositoryDetailPage }))
);
const ProfilePage = React.lazy(() =>
  import("../pages/ProfilePage.js").then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = React.lazy(() =>
  import("../pages/SettingsPage.js").then((m) => ({ default: m.SettingsPage }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-matte-400 font-mono text-xs">
    <Loader2 size={24} className="animate-spin text-sage-400" />
    <span>Loading view...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Guest/Auth routes (login/register) */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/repositories" element={<RepositoriesPage />} />
            <Route path="/repositories/:id" element={<RepositoryDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
