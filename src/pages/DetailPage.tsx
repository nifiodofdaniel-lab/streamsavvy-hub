import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getDetail, getVideos, getWatchProviders, getCredits, getSimilar,
  getTitle, getReleaseYear, getBackdropUrl, getPosterUrl,
  MediaItem
} from "@/lib/tmdb";
import AppLayout from "@/components/AppLayout";
import MediaRow from "@/components/MediaRow";
import TrailerModal from "@/components/TrailerModal";
import { useState } from "react";
import {
  Star, Play, Bookmark, BookmarkCheck, Heart, Clock, Calendar,
  Globe, ChevronLeft, ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

type Props = { mediaType: "movie" | "tv" };

export default function DetailPage({ mediaType }: Props) {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const { user } = useAuth();
  const { isInWatchlist, addMutation: wAdd, removeMutation: wRemove } = useWatchlist();
  const { isFavorite, addMutation: fAdd, removeMutation: fRemove } = useFavorites();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["detail", mediaType, numId],
    queryFn: () => getDetail(mediaType, numId),
    enabled: !!numId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["videos", mediaType, numId],
    queryFn: () => getVideos(mediaType, numId),
    enabled: !!numId,
  });

  const { data: providers } = useQuery({
    queryKey: ["providers", mediaType, numId],
    queryFn: () => getWatchProviders(mediaType, numId),
    enabled: !!numId,
  });

  const { data: cast = [] } = useQuery({
    queryKey: ["credits", mediaType, numId],
    queryFn: () => getCredits(mediaType, numId),
    enabled: !!numId,
  });

  const { data: similar = [] } = useQuery({
    queryKey: ["similar", mediaType, numId],
    queryFn: () => getSimilar(mediaType, numId),
    enabled: !!numId,
  });

  if (isLoading || !detail) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube" && v.official)
    || videos.find(v => v.type === "Trailer" && v.site === "YouTube")
    || videos.find(v => v.site === "YouTube");

  const usProviders = providers?.US;
  const streamingProviders = usProviders?.flatrate || [];
  const rentProviders = usProviders?.rent || [];

  const inWatchlist = isInWatchlist(numId, mediaType);
  const inFavorites = isFavorite(numId, mediaType);

  const itemAsMedia: MediaItem = {
    ...detail,
    media_type: mediaType,
  };

  const handleWatchlist = () => {
    if (!user) { toast.error("Sign in to save"); return; }
    if (inWatchlist) wRemove.mutate({ mediaId: numId, type: mediaType });
    else wAdd.mutate({ item: itemAsMedia, type: mediaType });
  };

  const handleFavorite = () => {
    if (!user) { toast.error("Sign in to add favorites"); return; }
    if (inFavorites) fRemove.mutate({ mediaId: numId, type: mediaType });
    else fAdd.mutate({ item: itemAsMedia, type: mediaType });
  };

  const ratingColor = detail.vote_average >= 7.5 ? "text-green-400" : detail.vote_average >= 6 ? "text-yellow-400" : "text-red-400";

  return (
    <AppLayout>
      {/* Backdrop Hero */}
      <div className="relative">
        <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
          <img
            src={getBackdropUrl(detail.backdrop_path, "original")}
            alt={getTitle(detail)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
          <Link to={-1 as unknown as string} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
            <ChevronLeft size={16} />
            Back
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 lg:gap-10">
            {/* Poster */}
            <div className="shrink-0">
              <img
                src={getPosterUrl(detail.poster_path, "w500")}
                alt={getTitle(detail)}
                className="w-40 sm:w-56 rounded-xl shadow-2xl border border-border/30"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-gold text-xs font-semibold uppercase tracking-widest bg-gold/10 px-2 py-1 rounded-full border border-gold/20">
                  {mediaType === "tv" ? "TV Series" : "Movie"}
                </span>
                {detail.genres?.map(g => (
                  <span key={g.id} className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">{g.name}</span>
                ))}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground leading-none mb-1 tracking-wider">
                {getTitle(detail)}
              </h1>

              {detail.tagline && (
                <p className="text-gold text-sm italic mb-3 opacity-80">"{detail.tagline}"</p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-gold fill-gold" />
                  <span className={`font-bold text-lg ${ratingColor}`}>{detail.vote_average.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">/ 10 ({detail.vote_count?.toLocaleString()} votes)</span>
                </div>
                {detail.runtime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={14} />
                    {Math.floor(detail.runtime / 60)}h {detail.runtime % 60}m
                  </div>
                )}
                {detail.number_of_seasons && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Globe size={14} />
                    {detail.number_of_seasons} season{detail.number_of_seasons > 1 ? "s" : ""}
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar size={14} />
                  {getReleaseYear(detail)}
                </div>
                <span className="text-muted-foreground capitalize">{detail.status}</span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">{detail.overview}</p>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                {trailer && (
                  <button
                    onClick={() => setTrailerKey(trailer.key)}
                    className="flex items-center gap-2 bg-gold text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-gold/90 transition-all"
                  >
                    <Play size={16} className="fill-current" />
                    Watch Trailer
                  </button>
                )}

                <button
                  onClick={handleWatchlist}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm border transition-all ${
                    inWatchlist
                      ? "bg-gold text-primary-foreground border-gold"
                      : "bg-muted text-foreground border-border hover:border-gold/50"
                  }`}
                >
                  {inWatchlist ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>

                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm border transition-all ${
                    inFavorites
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-muted text-foreground border-border hover:border-red-500/50"
                  }`}
                >
                  <Heart size={16} className={inFavorites ? "fill-white" : ""} />
                  {inFavorites ? "Favorited" : "Add to Favorites"}
                </button>
              </div>

              {/* Streaming Providers */}
              {streamingProviders.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">Stream On</h3>
                  <div className="flex flex-wrap gap-2">
                    {streamingProviders.map(p => (
                      <div key={p.provider_id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border/50">
                        <img
                          src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                          alt={p.provider_name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-xs text-foreground font-medium">{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rentProviders.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Rent / Buy On</h3>
                  <div className="flex flex-wrap gap-2">
                    {rentProviders.slice(0, 5).map(p => (
                      <div key={p.provider_id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border border-border/30">
                        <img
                          src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                          alt={p.provider_name}
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-xs text-muted-foreground">{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {streamingProviders.length === 0 && rentProviders.length === 0 && (
                <p className="text-muted-foreground text-sm mb-4">No streaming info available for your region (US).</p>
              )}
            </div>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl text-foreground tracking-wider mb-4">CAST</h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {cast.slice(0, 12).map(member => (
                  <div key={member.id} className="shrink-0 w-24 text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-2 mx-auto border-2 border-border/30">
                      {member.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">
                          👤
                        </div>
                      )}
                    </div>
                    <p className="text-foreground text-xs font-medium truncate">{member.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{member.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trailers / Videos */}
          {videos.filter(v => v.site === "YouTube").length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl text-foreground tracking-wider mb-4">VIDEOS</h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {videos.filter(v => v.site === "YouTube").slice(0, 8).map(video => (
                  <button
                    key={video.id}
                    onClick={() => setTrailerKey(video.key)}
                    className="shrink-0 group relative w-48 rounded-xl overflow-hidden border border-border hover:border-gold/50 transition-all"
                  >
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                        alt={video.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gold/90 flex items-center justify-center">
                          <Play size={14} className="fill-primary-foreground text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-foreground font-medium truncate">{video.name}</p>
                      <p className="text-xs text-muted-foreground">{video.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <div className="mt-6 -mx-4 sm:-mx-6">
              <MediaRow
                title={`More Like This`}
                items={similar}
                mediaType={mediaType}
              />
            </div>
          )}

          <div className="pb-12" />
        </div>
      </div>

      {trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={getTitle(detail)}
          onClose={() => setTrailerKey(null)}
        />
      )}
    </AppLayout>
  );
}
