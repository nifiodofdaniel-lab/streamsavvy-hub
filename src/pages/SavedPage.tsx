import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, Film, Tv, Star, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import Navbar from "@/components/Navbar";
import { getPosterUrl } from "@/lib/tmdb";
import AuthModal from "@/components/AuthModal";

export default function SavedPage() {
  const { user } = useAuth();
  const { watchlist, isLoading, removeMutation } = useWatchlist();
  const [showAuth, setShowAuth] = useState(false);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const filtered = filter === "all" ? watchlist : watchlist.filter(i => i.media_type === filter);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Lock size={48} className="text-muted-foreground mb-4 opacity-30" />
          <h2 className="font-display text-3xl text-foreground tracking-wider mb-2">YOUR WATCHLIST</h2>
          <p className="text-muted-foreground mb-6 text-center">Sign in to save movies and shows for later</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-gold text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-gold/90 transition-all"
          >
            Sign In
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Bookmark className="text-gold" size={24} />
            <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wider">WATCHLIST</h1>
            <span className="bg-gold/20 text-gold text-sm font-semibold px-2 py-0.5 rounded-full">{watchlist.length}</span>
          </div>

          <div className="flex gap-2">
            {(["all", "movie", "tv"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-gold text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "movie" ? "Movies" : "TV Shows"}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24">
            <Bookmark size={48} className="text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg">
              {filter === "all" ? "Your watchlist is empty" : `No ${filter === "movie" ? "movies" : "TV shows"} saved`}
            </p>
            <Link to="/" className="text-gold hover:underline text-sm mt-2 inline-block">
              Browse content →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="flex gap-3 bg-card border border-border/50 rounded-xl p-3 hover:border-gold/30 transition-all group">
              <Link to={`/${item.media_type}/${item.media_id}`} className="shrink-0">
                <img
                  src={getPosterUrl(item.poster_path, "w185")}
                  alt={item.title}
                  className="w-16 h-24 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/${item.media_type}/${item.media_id}`}>
                      <h3 className="text-foreground text-sm font-semibold hover:text-gold transition-colors line-clamp-2 leading-tight">{item.title}</h3>
                    </Link>
                    <span className="shrink-0">
                      {item.media_type === "movie" ? <Film size={12} className="text-muted-foreground" /> : <Tv size={12} className="text-muted-foreground" />}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {item.vote_average && (
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-gold fill-gold" />
                        <span className="text-xs text-muted-foreground">{Number(item.vote_average).toFixed(1)}</span>
                      </div>
                    )}
                    {item.release_date && <span className="text-xs text-muted-foreground">{String(item.release_date).slice(0, 4)}</span>}
                  </div>
                  <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2 leading-relaxed">{item.overview}</p>
                </div>
                <button
                  onClick={() => removeMutation.mutate({ mediaId: item.media_id, type: item.media_type })}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors mt-2 w-fit"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pb-12" />
      </div>
    </div>
  );
}
