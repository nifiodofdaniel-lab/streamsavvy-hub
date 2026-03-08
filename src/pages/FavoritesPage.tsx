import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Film, Tv, Star, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import Navbar from "@/components/Navbar";
import { getPosterUrl } from "@/lib/tmdb";
import AuthModal from "@/components/AuthModal";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, isLoading, removeMutation } = useFavorites();
  const [showAuth, setShowAuth] = useState(false);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const filtered = filter === "all" ? favorites : favorites.filter(i => i.media_type === filter);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Lock size={48} className="text-muted-foreground mb-4 opacity-30" />
          <h2 className="font-display text-3xl text-foreground tracking-wider mb-2">YOUR FAVORITES</h2>
          <p className="text-muted-foreground mb-6 text-center">Sign in to keep track of your favorite movies and shows</p>
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
            <Heart className="text-red-500 fill-red-500" size={24} />
            <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wider">FAVORITES</h1>
            <span className="bg-red-500/20 text-red-400 text-sm font-semibold px-2 py-0.5 rounded-full">{favorites.length}</span>
          </div>

          <div className="flex gap-2">
            {(["all", "movie", "tv"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-red-500 text-white"
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
            <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24">
            <Heart size={48} className="text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg">
              {filter === "all" ? "No favorites yet" : `No ${filter === "movie" ? "movies" : "TV shows"} favorited`}
            </p>
            <Link to="/" className="text-gold hover:underline text-sm mt-2 inline-block">
              Discover content →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative">
              <Link to={`/${item.media_type}/${item.media_id}`}>
                <div className="relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-red-500/30 transition-all">
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
                    <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
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
                onClick={() => removeMutation.mutate({ mediaId: item.media_id, type: item.media_type })}
                className="absolute top-10 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-full p-1.5 hover:bg-red-500/80"
                title="Remove from favorites"
              >
                <Trash2 size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>

        <div className="pb-12" />
      </div>
    </div>
  );
}
