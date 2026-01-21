import { Button } from "@/components/ui/button";
import { CameraIcon, LogOut, Settings, Moon, Sun, Home, Image, Mail, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 no-underline whitespace-nowrap">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
              <CameraIcon size={22} />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight">
              Lens Illumination
            </span>
          </a>

          {/* Large Screen Navigation - Full Text */}
          <div className="hidden 2xl:flex items-center gap-2">
            {/* Navigation Links */}
            {!isHome && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href="/">
                  <Home className="h-4 w-4" />
                  <span className="ml-2">Home</span>
                </a>
              </Button>
            )}
            {!isAlbums && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href="/albums">
                  <Image className="h-4 w-4" />
                  <span className="ml-2">Albums</span>
                </a>
              </Button>
            )}
            {!isContact && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href="/contact">
                  <Mail className="h-4 w-4" />
                  <span className="ml-2">Contact</span>
                </a>
              </Button>
            )}

            {/* User Actions */}
            {user ? (
              <>
                {!isAdmin && (
                  <Button
                    size="sm"
                    variant="default"
                    asChild
                  >
                    <a href="/admin">
                      <Settings className="h-4 w-4" />
                      <span className="ml-2">Admin</span>
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
                  <span className="ml-2">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="default"
                  asChild
                >
                  <a href="/admin/signin">
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Login</span>
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

          {/* Medium Screen Navigation - Icons Only */}
          <div className="hidden xl:flex 2xl:hidden items-center gap-2">
            {/* Navigation Links - Icons Only */}
            {!isHome && (
              <Button
                variant="outline"
                size="sm"
                asChild
                title="Home"
              >
                <a href="/">
                  <Home className="h-4 w-4" />
                </a>
              </Button>
            )}
            {!isAlbums && (
              <Button
                variant="outline"
                size="sm"
                asChild
                title="Albums"
              >
                <a href="/albums">
                  <Image className="h-4 w-4" />
                </a>
              </Button>
            )}
            {!isContact && (
              <Button
                variant="outline"
                size="sm"
                asChild
                title="Contact"
              >
                <a href="/contact">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}

            {/* User Actions - Icons Only */}
            {user ? (
              <>
                {!isAdmin && (
                  <Button
                    size="sm"
                    variant="default"
                    asChild
                    title="Admin"
                  >
                    <a href="/admin">
                      <Settings className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleTheme}
                  title="Toggle theme"
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
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="default"
                  asChild
                  title="Login"
                >
                  <a href="/admin/signin">
                    <LogOut className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleTheme}
                  title="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation - Hamburger */}
          <div className="flex xl:hidden items-center gap-2">
            {/* Always show Contact button */}
            {!isContact && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href="/contact">
                  <Mail className="h-4 w-4" />
                  <span className="ml-2">Contact</span>
                </a>
              </Button>
            )}
            
            {/* Hamburger Menu */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 rotate-90 transition-transform duration-200" />
              ) : (
                <Menu className="h-4 w-4 transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-16 z-40 bg-background border-b shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2">
            {/* Navigation Links */}
            {!isHome && (
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <a href="/" className="justify-start">
                  <Home className="h-4 w-4" />
                  <span className="ml-2">Home</span>
                </a>
              </Button>
            )}
            {!isAlbums && (
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <a href="/albums" className="justify-start">
                  <Image className="h-4 w-4" />
                  <span className="ml-2">Albums</span>
                </a>
              </Button>
            )}

            {/* User Actions */}
            {user ? (
              <>
                {!isAdmin && (
                  <Button
                    size="sm"
                    variant="default"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <a href="/admin" className="justify-start">
                      <Settings className="h-4 w-4" />
                      <span className="ml-2">Admin</span>
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="ml-2">Toggle Theme</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    signOut(auth);
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="default"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <a href="/admin/signin" className="justify-start">
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Login</span>
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="ml-2">Toggle Theme</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;