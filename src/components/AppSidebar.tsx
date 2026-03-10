import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Film, Home, Bookmark, Heart, Search, LogOut, User, LogIn, ChevronLeft, ChevronRight } from "lucide-react";
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
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function AppSidebar({ onCollapsedChange }: Props) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 border-r border-border/40",
          "bg-sidebar",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-border/40 shrink-0",
          collapsed ? "justify-center px-3" : "gap-3 px-4"
        )}>
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
            <Film className="text-gold" size={18} />
          </div>
          {!collapsed && (
            <span className="font-display text-xl text-gold tracking-widest">CINETRACK</span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center px-2" : "px-3",
                isActive(to)
                  ? "bg-gold/15 text-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border/40 p-2 flex flex-col gap-1 shrink-0">
          {user ? (
            <>
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50",
                collapsed && "justify-center px-2"
              )}>
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <User size={12} className="text-gold" />
                </div>
                {!collapsed && (
                  <span className="text-xs text-sidebar-foreground truncate flex-1">
                    {user.email?.split("@")[0]}
                  </span>
                )}
              </div>
              <button
                onClick={signOut}
                className={cn(
                  "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all",
                  collapsed ? "justify-center px-2" : "px-3",
                  "text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive"
                )}
                title={collapsed ? "Sign out" : undefined}
              >
                <LogOut size={18} className="shrink-0" />
                {!collapsed && <span>Sign out</span>}
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center px-2" : "px-3",
                "bg-gold/15 text-gold hover:bg-gold/25"
              )}
              title={collapsed ? "Sign in" : undefined}
            >
              <LogIn size={18} className="shrink-0" />
              {!collapsed && <span>Sign In</span>}
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-border/60 flex items-center justify-center hover:bg-sidebar-accent transition-colors z-10 shadow-sm"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight size={12} className="text-sidebar-foreground" />
            : <ChevronLeft size={12} className="text-sidebar-foreground" />}
        </button>
      </aside>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
