import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Film, Tv, User } from "lucide-react";
import AppSidebar from "./AppSidebar";
import { cn } from "@/lib/utils";
import { searchMulti, getPosterUrl, getTitle, MediaItem } from "@/lib/tmdb";
import { IMG_BASE } from "@/lib/tmdb";

interface SuggestionItem extends MediaItem {
  profile_path?: string | null;
}

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsLoadingSuggestions(true);
    searchMulti(debouncedQuery)
      .then((results) => {
        // Include persons from the raw API — re-fetch raw to get person results with profile_path
        fetchRawSuggestions(debouncedQuery).then((raw) => {
          setSuggestions(raw.slice(0, 8));
          setShowDropdown(true);
          setIsLoadingSuggestions(false);
        });
      })
      .catch(() => {
        setSuggestions([]);
        setIsLoadingSuggestions(false);
      });
  }, [debouncedQuery]);

  // Click outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (item: SuggestionItem) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (item.media_type === "movie") {
      navigate(`/movie/${item.id}`);
    } else if (item.media_type === "tv") {
      navigate(`/tv/${item.id}`);
    } else {
      // person — search by their name
      const name = (item as any).name || "";
      navigate(`/search?q=${encodeURIComponent(name)}`);
    }
  };

  const getThumb = (item: SuggestionItem): string => {
    if ((item.media_type as string) === "person") {
      const path = (item as any).profile_path as string | null;
      return path ? `${IMG_BASE}/w92${path}` : "/placeholder.svg";
    }
    return item.poster_path ? `${IMG_BASE}/w92${item.poster_path}` : "/placeholder.svg";
  };

  const getLabel = (item: SuggestionItem): string => {
    if (item.media_type === "movie") return "Movie";
    if (item.media_type === "tv") return "Show";
    return "Actor";
  };

  const getLabelIcon = (item: SuggestionItem) => {
    if (item.media_type === "movie") return <Film size={10} />;
    if (item.media_type === "tv") return <Tv size={10} />;
    return <User size={10} />;
  };

  const getLabelColor = (item: SuggestionItem): string => {
    if (item.media_type === "movie") return "bg-blue-500/20 text-blue-400";
    if (item.media_type === "tv") return "bg-purple-500/20 text-purple-400";
    return "bg-gold/20 text-gold";
  };

  const getDisplayTitle = (item: SuggestionItem): string => {
    return (item as any).name || item.title || item.name || "Unknown";
  };

  const getYear = (item: SuggestionItem): string => {
    const date = item.release_date || item.first_air_date || "";
    return date ? date.slice(0, 4) : "";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar onCollapsedChange={setSidebarCollapsed} />

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-60"
        )}
      >
        {/* Top search bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border/30">
          <div ref={containerRef} className="w-full max-w-xl relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                <input
                  type="text"
                  placeholder="Search movies, shows, actors..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) setShowDropdown(false);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  className="w-full bg-muted/40 border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 focus:bg-muted/60 transition-all"
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border border-muted-foreground/40 border-t-gold rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </form>

            {/* Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden z-50">
                <ul>
                  {suggestions.map((item, idx) => (
                    <li key={`${item.media_type}-${item.id}-${idx}`}>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(item);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left group"
                      >
                        {/* Thumbnail */}
                        <div className="w-9 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <img
                            src={getThumb(item)}
                            alt={getDisplayTitle(item)}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium truncate group-hover:text-gold transition-colors">
                            {getDisplayTitle(item)}
                          </p>
                          {getYear(item) && (
                            <p className="text-xs text-muted-foreground">{getYear(item)}</p>
                          )}
                        </div>

                        {/* Type badge */}
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0",
                          getLabelColor(item)
                        )}>
                          {getLabelIcon(item)}
                          {getLabel(item)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="px-3 py-2 border-t border-border/40">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowDropdown(false);
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery("");
                    }}
                    className="text-xs text-muted-foreground hover:text-gold transition-colors w-full text-left"
                  >
                    Press Enter to see all results for <span className="text-gold font-medium">"{searchQuery}"</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

// Raw TMDB search to include persons with profile_path
async function fetchRawSuggestions(query: string): Promise<SuggestionItem[]> {
  const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzNlODllMzdmYjhhY2VhMDJkNmJiNmFhZWZmMzcwOCIsIm5iZiI6MTc3Mjk5ODc0My4yMzgwMDAyLCJzdWIiOiI2OWFkZDA1NzJiMGI1NDU2OTE4MGU5NWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.D_1TU0GgYOFQsbIHtVDzi8CEV4C263kDppdauz9MCqY";
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).filter((r: any) =>
    r.media_type === "movie" || r.media_type === "tv" || r.media_type === "person"
  ) as SuggestionItem[];
}
