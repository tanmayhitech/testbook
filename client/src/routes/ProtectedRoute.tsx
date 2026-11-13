import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-matte-950 flex flex-col items-center justify-center text-matte-400 font-mono text-xs gap-3">
        <Loader2 size={24} className="animate-spin text-sage-400" />
        <span>Authenticating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
