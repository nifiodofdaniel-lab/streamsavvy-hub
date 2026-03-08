import { useState, useEffect } from "react";
import { Play, Star, Bookmark, Heart, BookmarkCheck, HeartIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MediaItem, getTitle, getReleaseYear, getBackdropUrl } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

type Props = {
  items: MediaItem[];
};

export default function HeroSection({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const { user } = useAuth();
  const { isInWatchlist, addMutation: wAdd, removeMutation: wRemove } = useWatchlist();
  const { isFavorite, addMutation: fAdd, removeMutation: fRemove } = useFavorites();

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % Math.min(items.length, 5)), 7000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const item = items[current];
  const type = (item.media_type as "movie" | "tv") || "movie";
  const inWatchlist = isInWatchlist(item.id, type);
  const inFavorites = isFavorite(item.id, type);

  const handleWatchlist = () => {
    if (!user) { toast.error("Sign in to save"); return; }
    if (inWatchlist) wRemove.mutate({ mediaId: item.id, type });
    else wAdd.mutate({ item, type });
  };

  const handleFavorite = () => {
    if (!user) { toast.error("Sign in to add favorites"); return; }
    if (inFavorites) fRemove.mutate({ mediaId: item.id, type });
    else fAdd.mutate({ item, type });
  };

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Backdrop */}
      {items.slice(0, 5).map((it, idx) => (
        <div
          key={it.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: idx === current ? 1 : 0 }}
        >
          <img
            src={getBackdropUrl(it.backdrop_path, "original")}
            alt={getTitle(it)}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex items-end pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="max-w-xl animate-fade-in-up" key={item.id}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gold text-xs font-semibold uppercase tracking-widest bg-gold/10 px-2 py-1 rounded-full border border-gold/20">
              {type === "tv" ? "TV Series" : "Movie"}
            </span>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-gold fill-gold" />
              <span className="text-foreground text-sm font-semibold">{item.vote_average.toFixed(1)}</span>
            </div>
            {getReleaseYear(item) && (
              <span className="text-muted-foreground text-sm">{getReleaseYear(item)}</span>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-6xl text-foreground leading-none mb-4 tracking-wider">
            {getTitle(item)}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
            {item.overview}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/${type}/${item.id}`}
              className="flex items-center gap-2 bg-gold text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-gold/90 transition-all"
            >
              <Play size={16} className="fill-current" />
              View Details
            </Link>

            <button
              onClick={handleWatchlist}
              className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm border transition-all ${
                inWatchlist
                  ? "bg-gold text-primary-foreground border-gold"
                  : "bg-black/40 text-foreground border-border hover:border-gold/50 backdrop-blur-sm"
              }`}
            >
              {inWatchlist ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              <span className="hidden sm:inline">{inWatchlist ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={handleFavorite}
              className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm border transition-all ${
                inFavorites
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-black/40 text-foreground border-border hover:border-red-500/50 backdrop-blur-sm"
              }`}
            >
              <HeartIcon size={16} className={inFavorites ? "fill-white" : ""} />
              <span className="hidden sm:inline">{inFavorites ? "Favorited" : "Favorite"}</span>
            </button>

            <Link
              to={`/${type}/${item.id}`}
              className="flex items-center gap-1 text-muted-foreground hover:text-gold transition-colors text-sm"
            >
              More Info <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {items.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current ? "w-6 h-2 bg-gold" : "w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
