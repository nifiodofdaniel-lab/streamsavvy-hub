const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzNlODllMzdmYjhhY2VhMDJkNmJiNmFhZWZmMzcwOCIsIm5iZiI6MTc3Mjk5ODc0My4yMzgwMDAyLCJzdWIiOiI2OWFkZDA1NzJiMGI1NDU2OTE4MGU5NWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.D_1TU0GgYOFQsbIHtVDzi8CEV4C263kDppdauz9MCqY";
const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p";

const headers = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  "Content-Type": "application/json",
};

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
};

export type MediaDetail = MediaItem & {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  status: string;
  tagline?: string;
  vote_count: number;
  revenue?: number;
  budget?: number;
  original_language: string;
  spoken_languages?: { english_name: string }[];
  networks?: { name: string; logo_path: string }[];
  production_companies?: { name: string; logo_path: string | null }[];
};

export type Video = {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  official: boolean;
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

// Trending
export async function getTrending(type: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "day") {
  const data = await fetchTMDB(`/trending/${type}/${timeWindow}`);
  return data.results as MediaItem[];
}

// Popular
export async function getPopular(type: "movie" | "tv") {
  const data = await fetchTMDB(`/${type}/popular`);
  return data.results as MediaItem[];
}

// Top Rated
export async function getTopRated(type: "movie" | "tv") {
  const data = await fetchTMDB(`/${type}/top_rated`);
  return data.results as MediaItem[];
}

// Now Playing / On Air
export async function getNowPlaying() {
  const data = await fetchTMDB("/movie/now_playing");
  return data.results as MediaItem[];
}

export async function getOnAir() {
  const data = await fetchTMDB("/tv/on_the_air");
  return data.results as MediaItem[];
}

// Detail
export async function getDetail(type: "movie" | "tv", id: number): Promise<MediaDetail> {
  return fetchTMDB(`/${type}/${id}`);
}

// Videos (trailers)
export async function getVideos(type: "movie" | "tv", id: number): Promise<Video[]> {
  const data = await fetchTMDB(`/${type}/${id}/videos`);
  return data.results as Video[];
}

// Watch Providers
export async function getWatchProviders(type: "movie" | "tv", id: number) {
  const data = await fetchTMDB(`/${type}/${id}/watch/providers`);
  return data.results as Record<string, { flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] }>;
}

// Credits
export async function getCredits(type: "movie" | "tv", id: number): Promise<CastMember[]> {
  const data = await fetchTMDB(`/${type}/${id}/credits`);
  return (data.cast || []).slice(0, 15) as CastMember[];
}

// Similar
export async function getSimilar(type: "movie" | "tv", id: number): Promise<MediaItem[]> {
  const data = await fetchTMDB(`/${type}/${id}/similar`);
  return data.results.slice(0, 12) as MediaItem[];
}

// Search
export async function searchMulti(query: string): Promise<MediaItem[]> {
  const data = await fetchTMDB("/search/multi", { query, include_adult: "false" });
  return (data.results as MediaItem[]).filter(r => r.media_type === "movie" || r.media_type === "tv");
}

// Discover by year
export async function discoverByYear(type: "movie" | "tv", year: number): Promise<MediaItem[]> {
  const params = type === "movie"
    ? { sort_by: "popularity.desc", primary_release_year: String(year) }
    : { sort_by: "popularity.desc", first_air_date_year: String(year) };
  const data = await fetchTMDB(`/discover/${type}`, params);
  return data.results as MediaItem[];
}

export function getTitle(item: MediaItem): string {
  return item.title || item.name || "Unknown";
}

export function getReleaseYear(item: MediaItem): string {
  const date = item.release_date || item.first_air_date || "";
  return date ? date.slice(0, 4) : "";
}

export function getPosterUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w342"): string {
  if (!path) return "/placeholder.svg";
  return `${IMG_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "w1280"): string {
  if (!path) return "/placeholder.svg";
  return `${IMG_BASE}/${size}${path}`;
}

export function getRatingColor(rating: number): string {
  if (rating >= 7.5) return "text-green-400";
  if (rating >= 6) return "text-yellow-400";
  return "text-red-400";
}
