import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
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

  const containerClasses = isHome
    ? theme === "dark"
      ? "w-full bg-[#050b14] text-white"
      : "w-full bg-white/90 text-slate-900 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    : "w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 text-foreground";

  const innerClasses = isHome
    ? "max-w-6xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 py-5"
    : "max-w-6xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 py-4";

  const logoTone = isHome ? (theme === "dark" ? "text-white" : "text-slate-900") : "text-foreground";

  const homeGhostClass =
    theme === "dark"
      ? "text-slate-100 hover:text-white hover:bg-white/10"
      : "text-slate-900 hover:bg-slate-100/70";

  return (
    <NavigationMenu className={containerClasses}>
      <NavigationMenuItem className={innerClasses}>
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isHome
                ? theme === "dark"
                  ? "bg-white/10 text-white"
                  : "bg-slate-900 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <CameraIcon size={22} />
          </div>
          <NavigationMenuLink href="/" className="no-underline">
            <span className={`text-xl sm:text-2xl font-bold tracking-tight ${logoTone}`}>
              Lens Illumination
            </span>
          </NavigationMenuLink>
        </div>

        <div className="flex items-center gap-2">
          {!isHome && (
            <Button
              variant={isHome ? "ghost" : "outline"}
              size="sm"
              className={isHome ? "hidden sm:inline-flex text-slate-100 hover:text-white hover:bg-white/10" : "hidden sm:inline-flex"}
              asChild
            >
              <NavigationMenuLink href="/">Home</NavigationMenuLink>
            </Button>
          )}
          {!isAlbums && (
            <Button
              variant={isHome ? "secondary" : "outline"}
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <NavigationMenuLink href="/albums">Albums</NavigationMenuLink>
            </Button>
          )}
          {!isContact && (
            <Button
              variant={isHome ? "secondary" : "outline"}
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
            </Button>
          )}
          {user ? (
            <>
              {!isAdmin && (
                <Button
                  size="sm"
                  variant={isHome ? "secondary" : "default"}
                  className="gap-2"
                  asChild
                  title="Admin Dashboard"
                >
                  <NavigationMenuLink href="/admin">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </NavigationMenuLink>
                </Button>
              )}
              <Button
                size="sm"
                variant={isHome ? "ghost" : "outline"}
                className={isHome ? homeGhostClass : "text-foreground"}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant={isHome ? "ghost" : "outline"}
                className={isHome ? homeGhostClass : "text-foreground"}
                onClick={() => signOut(auth)}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant={isHome ? "secondary" : "default"}
              className="gap-2"
              asChild
            >
              <NavigationMenuLink href="/admin/signin">
                <span className="hidden sm:inline">Login</span>
              </NavigationMenuLink>
            </Button>
          )}
          {!user && (
            <Button
              size="sm"
              variant={isHome ? "ghost" : "outline"}
              className={isHome ? homeGhostClass : "text-foreground"}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </NavigationMenuItem>
    </NavigationMenu>
  );
}

export default Navbar;