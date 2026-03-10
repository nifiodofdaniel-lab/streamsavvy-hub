import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Film, Tv, Star, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import AppLayout from "@/components/AppLayout";
import { getPosterUrl } from "@/lib/tmdb";
import AuthModal from "@/components/AuthModal";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, isLoading, removeMutation } = useFavorites();
  const [showAuth, setShowAuth] = useState(false);

  const movies = favorites.filter(i => i.media_type === "movie");
  const tvShows = favorites.filter(i => i.media_type === "tv");

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Lock size={48} className="text-muted-foreground mb-4 opacity-30" />
          <h2 className="font-display text-3xl text-foreground tracking-wider mb-2">YOUR FAVORITES</h2>
          <p className="text-muted-foreground mb-6 text-center">Sign in to keep track of your favorite movies and shows</p>
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
          <Heart className="text-destructive fill-destructive" size={24} />
          <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wider">FAVORITES</h1>
          <span className="bg-destructive/20 text-destructive text-sm font-semibold px-2 py-0.5 rounded-full">{favorites.length}</span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-10">
            {/* Movies section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Film size={18} className="text-destructive" />
                <h2 className="font-display text-xl text-foreground tracking-wider">MOVIES</h2>
                <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{movies.length}</span>
              </div>
              {movies.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
                  <Film size={32} className="text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-muted-foreground text-sm">No favorite movies yet</p>
                  <Link to="/" className="text-gold hover:underline text-xs mt-1 inline-block">Discover movies →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map(item => (
                    <FavoriteCard key={item.id} item={item} onRemove={() => removeMutation.mutate({ mediaId: item.media_id, type: item.media_type })} />
                  ))}
                </div>
              )}
            </section>

            {/* TV Shows section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Tv size={18} className="text-destructive" />
                <h2 className="font-display text-xl text-foreground tracking-wider">TV SHOWS</h2>
                <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{tvShows.length}</span>
              </div>
              {tvShows.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
                  <Tv size={32} className="text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-muted-foreground text-sm">No favorite TV shows yet</p>
                  <Link to="/" className="text-gold hover:underline text-xs mt-1 inline-block">Discover shows →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tvShows.map(item => (
                    <FavoriteCard key={item.id} item={item} onRemove={() => removeMutation.mutate({ mediaId: item.media_id, type: item.media_type })} />
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

function FavoriteCard({ item, onRemove }: { item: ReturnType<typeof useFavorites>["favorites"][0]; onRemove: () => void }) {
  return (
    <div className="group relative">
      <Link to={`/${item.media_type}/${item.media_id}`}>
        <div className="relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-destructive/30 transition-all">
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={getPosterUrl(item.poster_path, "w342")}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 card-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
              <Star size={10} className="text-gold fill-gold" />
              <span className="text-xs font-semibold text-foreground">{Number(item.vote_average).toFixed(1)}</span>
            </div>
            <div className="absolute top-2 right-2 bg-destructive/80 rounded-full p-1">
              <Heart size={10} className="fill-white text-white" />
            </div>
          </div>
          <div className="p-2">
            <p className="text-foreground text-xs font-medium truncate">{item.title}</p>
            <p className="text-muted-foreground text-xs">{String(item.release_date || "").slice(0, 4)}</p>
          </div>
        </div>
      </Link>
      <button
        onClick={onRemove}
        className="absolute top-10 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-full p-1.5 hover:bg-destructive/80"
        title="Remove from favorites"
      >
        <Trash2 size={10} className="text-white" />
      </button>
    </div>
  );
}
