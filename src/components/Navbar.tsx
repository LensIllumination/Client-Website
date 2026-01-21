import { Button } from "@/components/ui/button";
import { CameraIcon, Moon, Sun, Home, Image, Mail, Menu, X, DollarSign } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isContact = pathname === "/contact";
  const isAlbums = pathname === "/albums";
  const isPricing = pathname === "/pricing";
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <span className="text-xl sm:text-2xl font-bold tracking-tight">Lens Illumination</span>
          </a>

          {/* Large Screen Navigation - Full Text */}
          <div className="hidden 2xl:flex items-center gap-2">
            {/* Navigation Links */}
            <Button variant={isHome ? "default" : "outline"} size="sm" asChild>
              <a href="/">
                <Home className="h-4 w-4" />
                <span className="ml-1">Home</span>
              </a>
            </Button>
            <Button variant={isAlbums ? "default" : "outline"} size="sm" asChild>
              <a href="/albums">
                <Image className="h-4 w-4" />
                <span className="ml-1">Albums</span>
              </a>
            </Button>
            <Button variant={isPricing ? "default" : "outline"} size="sm" asChild>
              <a href="/pricing">
                <DollarSign className="h-4 w-4" />
                <span className="ml-1">Pricing</span>
              </a>
            </Button>
            <Button variant={isContact ? "default" : "outline"} size="sm" asChild>
              <a href="/contact">
                <Mail className="h-4 w-4" />
                <span className="ml-1">Contact</span>
              </a>
            </Button>

            {/* User Actions */}
            <Button size="sm" variant="outline" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Medium Screen Navigation - Icons Only */}
          <div className="hidden xl:flex 2xl:hidden items-center gap-2">
            <Button variant={isHome ? "default" : "outline"} size="sm" asChild title="Home">
              <a href="/">
                <Home className="h-4 w-4" />
              </a>
            </Button>
            <Button variant={isAlbums ? "default" : "outline"} size="sm" asChild title="Albums">
              <a href="/albums">
                <Image className="h-4 w-4" />
              </a>
            </Button>
            <Button variant={isPricing ? "default" : "outline"} size="sm" asChild title="Pricing">
              <a href="/pricing">
                <DollarSign className="h-4 w-4" />
              </a>
            </Button>
            <Button variant={isContact ? "default" : "outline"} size="sm" asChild title="Contact">
              <a href="/contact">
                <Mail className="h-4 w-4" />
              </a>
            </Button>

            <Button size="sm" variant="outline" onClick={toggleTheme} title="Toggle Theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Mobile Navigation - Hamburger */}
          <div className="flex xl:hidden items-center gap-2">
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
            <Button variant={isHome ? "default" : "outline"} size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
              <a href="/" className="justify-start">
                <Home className="h-4 w-4" />
                <span className="ml-1">Home</span>
              </a>
            </Button>
            <Button variant={isAlbums ? "default" : "outline"} size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
              <a href="/albums" className="justify-start">
                <Image className="h-4 w-4" />
                <span className="ml-1">Albums</span>
              </a>
            </Button>
            <Button variant={isPricing ? "default" : "outline"} size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
              <a href="/pricing" className="justify-start">
                <DollarSign className="h-4 w-4" />
                <span className="ml-1">Pricing</span>
              </a>
            </Button>
            <Button variant={isContact ? "default" : "outline"} size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
              <a href="/contact" className="justify-start">
                <Mail className="h-4 w-4" />
                <span className="ml-1">Contact</span>
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
              <span className="ml-1">Toggle Theme</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;