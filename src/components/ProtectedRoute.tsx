// components/ProtectedRoute.tsx
import { useAuth } from "@/hooks/useAuth"; // Your custom auth hook or context
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen animate-fade-in">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Authenticating...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};