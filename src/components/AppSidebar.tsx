import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Film, Home, Bookmark, Heart, Search, LogOut, User, LogIn, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/saved", icon: Bookmark, label: "Watchlist" },
  { to: "/favorites", icon: Heart, label: "Favorites" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: Props) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  // Close menu when route changes
  useEffect(() => {
    if (open) onClose();
  }, [location.pathname]);

  // Animate in/out
  useEffect(() => {
    if (open) {
      setVisible(true);
      setAnimating(false);
    } else if (visible) {
      setAnimating(true);
      const t = setTimeout(() => {
        setVisible(false);
        setAnimating(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleNavClick = () => onClose();

  if (!visible) return showAuth ? <AuthModal onClose={() => setShowAuth(false)} /> : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          animating ? "opacity-0" : "opacity-100"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Fullscreen overlay panel */}
      <div
        className={cn(
          "fixed inset-0 z-[100] flex flex-col bg-background",
          animating ? "menu-overlay-exit" : "menu-overlay-enter"
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
              <Film className="text-gold" size={20} />
            </div>
            <span className="font-display text-2xl text-gold tracking-wider">CINETRACK</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors text-foreground hover:text-gold"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-5 py-5 px-6 rounded-2xl text-xl font-medium transition-all duration-200",
                isActive(to)
                  ? "bg-gold/12 text-gold"
                  : "text-foreground hover:bg-muted/50 hover:text-gold"
              )}
            >
              <Icon size={24} className="shrink-0" />
              <span style={{ lineHeight: 1.8 }}>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="px-8 py-8 border-t border-border/20">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-muted/40">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <User size={18} className="text-gold" />
                </div>
                <span className="text-base text-foreground font-medium truncate">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={() => { signOut(); onClose(); }}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium text-foreground hover:bg-destructive/15 hover:text-destructive transition-all"
              >
                <LogOut size={22} className="shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowAuth(true); onClose(); }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium bg-gold/12 text-gold hover:bg-gold/20 transition-all"
            >
              <LogIn size={22} className="shrink-0" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
