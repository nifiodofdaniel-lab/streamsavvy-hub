import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, Film, Tv, Star, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import AppLayout from "@/components/AppLayout";
import { getPosterUrl } from "@/lib/tmdb";
import AuthModal from "@/components/AuthModal";

export default function SavedPage() {
  const { user } = useAuth();
  const { watchlist, isLoading, removeMutation } = useWatchlist();
  const [showAuth, setShowAuth] = useState(false);

  const movies = watchlist.filter(i => i.media_type === "movie");
  const tvShows = watchlist.filter(i => i.media_type === "tv");

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Lock size={48} className="text-muted-foreground mb-4 opacity-30" />
          <h2 className="font-display text-3xl text-foreground tracking-wider mb-2">YOUR WATCHLIST</h2>
          <p className="text-muted-foreground mb-6 text-center">Sign in to save movies and shows for later</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-gold text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-gold/90 transition-all"
          >
            Sign In
          </button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="text-gold" size={24} />
          <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wider">WATCHLIST</h1>
          <span className="bg-gold/20 text-gold text-sm font-semibold px-2 py-0.5 rounded-full">{watchlist.length}</span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-10">
            {/* Movies section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Film size={18} className="text-gold" />
                <h2 className="font-display text-xl text-foreground tracking-wider">MOVIES</h2>
                <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{movies.length}</span>
              </div>
              {movies.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
                  <Film size={32} className="text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-muted-foreground text-sm">No movies saved yet</p>
                  <Link to="/" className="text-gold hover:underline text-xs mt-1 inline-block">Browse movies →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {movies.map(item => (
                    <WatchlistCard key={item.id} item={item} onRemove={() => removeMutation.mutate({ mediaId: item.media_id, type: item.media_type })} />
                  ))}
                </div>
              )}
            </section>

            {/* TV Shows section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Tv size={18} className="text-gold" />
                <h2 className="font-display text-xl text-foreground tracking-wider">TV SHOWS</h2>
                <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{tvShows.length}</span>
              </div>
              {tvShows.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
                  <Tv size={32} className="text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-muted-foreground text-sm">No TV shows saved yet</p>
                  <Link to="/" className="text-gold hover:underline text-xs mt-1 inline-block">Browse shows →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tvShows.map(item => (
                    <WatchlistCard key={item.id} item={item} onRemove={() => removeMutation.mutate({ mediaId: item.media_id, type: item.media_type })} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <div className="pb-12" />
      </div>
    </AppLayout>
  );
}

function WatchlistCard({ item, onRemove }: { item: ReturnType<typeof useWatchlist>["watchlist"][0]; onRemove: () => void }) {
  return (
    <div className="flex gap-3 bg-card border border-border/50 rounded-xl p-3 hover:border-gold/30 transition-all group">
      <Link to={`/${item.media_type}/${item.media_id}`} className="shrink-0">
        <img
          src={getPosterUrl(item.poster_path, "w185")}
          alt={item.title}
          className="w-16 h-24 object-cover rounded-lg"
        />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/${item.media_type}/${item.media_id}`}>
            <h3 className="text-foreground text-sm font-semibold hover:text-gold transition-colors line-clamp-2 leading-tight">{item.title}</h3>
          </Link>
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
          onClick={onRemove}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors mt-2 w-fit"
        >
          <Trash2 size={12} />
          Remove
        </button>
      </div>
    </div>
  );
}
