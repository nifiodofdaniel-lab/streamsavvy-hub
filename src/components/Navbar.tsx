import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bookmark, Heart, LogOut, User, Film } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background/95 to-background/0 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <Film className="text-gold" size={18} />
            </div>
            <span className="font-display text-2xl text-gold tracking-widest hidden sm:block">CINETRACK</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input
                type="text"
                placeholder="Search movies, shows..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-muted/40 border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:bg-muted/60 transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link
                  to="/saved"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors px-3 py-2 rounded-lg hover:bg-muted/50 text-sm"
                >
                  <Bookmark size={16} />
                  <span className="hidden sm:block">Saved</span>
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors px-3 py-2 rounded-lg hover:bg-muted/50 text-sm"
                >
                  <Heart size={16} />
                  <span className="hidden sm:block">Favorites</span>
                </Link>
                <div className="h-6 w-px bg-border mx-1" />
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <User size={14} />
                  <span className="hidden md:block truncate max-w-[100px]">{user.email?.split("@")[0]}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gold text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-gold/90 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
