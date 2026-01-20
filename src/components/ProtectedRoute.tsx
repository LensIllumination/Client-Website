// components/ProtectedRoute.tsx
import { useAuth } from "@/hooks/useAuth"; // Your custom auth hook or context
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading Auth...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};