import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, Heart, BookmarkCheck, HeartIcon } from "lucide-react";
import { MediaItem, getTitle, getReleaseYear, getPosterUrl } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

type Props = {
  item: MediaItem;
  mediaType: "movie" | "tv";
};

export default function MediaCard({ item, mediaType }: Props) {
  const { user } = useAuth();
  const { isInWatchlist, addMutation: wAdd, removeMutation: wRemove } = useWatchlist();
  const { isFavorite, addMutation: fAdd, removeMutation: fRemove } = useFavorites();
  const [imgError, setImgError] = useState(false);

  const type = (item.media_type as "movie" | "tv") || mediaType;
  const inWatchlist = isInWatchlist(item.id, type);
  const inFavorites = isFavorite(item.id, type);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save to watchlist"); return; }
    if (inWatchlist) {
      wRemove.mutate({ mediaId: item.id, type });
    } else {
      wAdd.mutate({ item, type });
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to add to favorites"); return; }
    if (inFavorites) {
      fRemove.mutate({ mediaId: item.id, type });
    } else {
      fAdd.mutate({ item, type });
    }
  };

  return (
    <Link
      to={`/${type}/${item.id}`}
      className="group relative block rounded-xl overflow-hidden bg-card border border-border/50 hover:border-gold/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {!imgError ? (
          <img
            src={getPosterUrl(item.poster_path, "w342")}
            alt={getTitle(item)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-xs text-center px-2">{getTitle(item)}</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 card-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5 backdrop-blur-sm">
          <Star size={10} className="text-gold fill-gold" />
          <span className="text-xs font-semibold text-foreground">{item.vote_average.toFixed(1)}</span>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-0.5 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{type === "tv" ? "TV" : "Film"}</span>
        </div>

        {/* Action buttons on hover */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleWatchlist}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              inWatchlist ? "bg-gold text-primary-foreground" : "bg-black/60 text-foreground hover:bg-gold/80"
            }`}
            title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              inFavorites ? "bg-red-500 text-white" : "bg-black/60 text-foreground hover:bg-red-500/80"
            }`}
            title={inFavorites ? "Remove from favorites" : "Add to favorites"}
          >
            <HeartIcon size={14} className={inFavorites ? "fill-white" : ""} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-foreground text-sm font-medium truncate leading-tight">{getTitle(item)}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{getReleaseYear(item)}</p>
      </div>
    </Link>
  );
}
