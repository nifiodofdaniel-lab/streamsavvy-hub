import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import AppSidebar from "./AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      {/* Main content — shifts right based on sidebar */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 pl-16 md:pl-60">
        {/* Top bar: search only */}
        <header className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border/30">
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input
                type="text"
                placeholder="Search movies, shows, actors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-muted/40 border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:bg-muted/60 transition-all"
              />
            </div>
          </form>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
