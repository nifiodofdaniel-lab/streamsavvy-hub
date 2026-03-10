import { useQuery } from "@tanstack/react-query";
import { getTrending, getPopular, getTopRated, getNowPlaying, getOnAir } from "@/lib/tmdb";
import AppLayout from "@/components/AppLayout";
import HeroSection from "@/components/HeroSection";
import MediaRow from "@/components/MediaRow";

export default function Index() {
  const { data: trendingAll = [] } = useQuery({
    queryKey: ["trending", "all", "week"],
    queryFn: () => getTrending("all", "week"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendingMovies = [], isLoading: l2 } = useQuery({
    queryKey: ["trending", "movie", "day"],
    queryFn: () => getTrending("movie", "day"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendingTV = [], isLoading: l3 } = useQuery({
    queryKey: ["trending", "tv", "day"],
    queryFn: () => getTrending("tv", "day"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: popularMovies = [], isLoading: l4 } = useQuery({
    queryKey: ["popular", "movie"],
    queryFn: () => getPopular("movie"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: popularTV = [], isLoading: l5 } = useQuery({
    queryKey: ["popular", "tv"],
    queryFn: () => getPopular("tv"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: topRatedMovies = [], isLoading: l6 } = useQuery({
    queryKey: ["topRated", "movie"],
    queryFn: () => getTopRated("movie"),
    staleTime: 10 * 60 * 1000,
  });

  const { data: topRatedTV = [], isLoading: l7 } = useQuery({
    queryKey: ["topRated", "tv"],
    queryFn: () => getTopRated("tv"),
    staleTime: 10 * 60 * 1000,
  });

  const { data: nowPlaying = [], isLoading: l8 } = useQuery({
    queryKey: ["nowPlaying"],
    queryFn: getNowPlaying,
    staleTime: 10 * 60 * 1000,
  });

  const { data: onAir = [], isLoading: l9 } = useQuery({
    queryKey: ["onAir"],
    queryFn: getOnAir,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <AppLayout>
      <HeroSection items={trendingAll} />
      <div className="py-4">
        <MediaRow title="🔥 Trending Movies Today" items={trendingMovies} mediaType="movie" isLoading={l2} />
        <MediaRow title="📺 Trending Shows Today" items={trendingTV} mediaType="tv" isLoading={l3} />
        <MediaRow title="🎬 Now Playing in Cinemas" items={nowPlaying} mediaType="movie" isLoading={l8} />
        <MediaRow title="📡 Currently Airing" items={onAir} mediaType="tv" isLoading={l9} />
        <MediaRow title="⭐ Popular Movies" items={popularMovies} mediaType="movie" isLoading={l4} />
        <MediaRow title="🎭 Popular TV Shows" items={popularTV} mediaType="tv" isLoading={l5} />
        <MediaRow title="🏆 Top Rated Movies" items={topRatedMovies} mediaType="movie" isLoading={l6} />
        <MediaRow title="🏅 Top Rated TV Shows" items={topRatedTV} mediaType="tv" isLoading={l7} />
      </div>
      <footer className="border-t border-border/30 mt-8 py-8 text-center text-muted-foreground text-sm">
        <p>
          Powered by{" "}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-gold hover:underline">
            TMDB
          </a>{" "}
          · CineTrack &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </AppLayout>
  );
}
