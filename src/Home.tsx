import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <Button>Click me</Button>
        
        {!loading && user && (
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Admin Dashboard
          </Button>
        )}
      </main>
    </div>
  );
}

export default Home;