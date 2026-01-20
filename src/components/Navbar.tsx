import { Button } from "@/components/ui/button";
import { CameraIcon, LogOut, Settings, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isContact = pathname === "/contact";
  const isAlbums = pathname === "/albums";
  const isAdmin = pathname.startsWith("/admin");
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("theme");
    const initial = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 no-underline">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
            <CameraIcon size={22} />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight">
            Lens Illumination
          </span>
        </a>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-2">
          {/* Navigation Links */}
          {!isHome && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <a href="/">Home</a>
            </Button>
          )}
          {!isAlbums && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <a href="/albums">Albums</a>
            </Button>
          )}
          {!isContact && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <a href="/contact">Contact</a>
            </Button>
          )}

          {/* User Actions */}
          {user ? (
            <>
              {!isAdmin && (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-2"
                  asChild
                >
                  <a href="/admin">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => signOut(auth)}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="default"
                className="gap-2"
                asChild
              >
                <a href="/admin/signin">
                  <span className="hidden sm:inline">Login</span>
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;