import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminFab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  if (!user || isAdmin) return null;

  return (
    <div className="fixed top-1 left-1 sm:top-3 sm:left-3 z-50">
      <Button
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        aria-label="Admin"
        onClick={() => navigate("/admin")}
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
}