import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { MediaItem, getTitle, getReleaseYear } from "@/lib/tmdb";
import { toast } from "sonner";

export type SavedMedia = {
  id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  release_date: string | null;
  overview: string | null;
  created_at: string;
};

export function useWatchlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ["watchlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavedMedia[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ item, type }: { item: MediaItem; type: "movie" | "tv" }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        media_id: item.id,
        media_type: type,
        title: getTitle(item),
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date || getReleaseYear(item),
        overview: item.overview,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Added to watchlist");
    },
    onError: () => toast.error("Failed to add to watchlist"),
  });

  const removeMutation = useMutation({
    mutationFn: async ({ mediaId, type }: { mediaId: number; type: "movie" | "tv" }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("media_id", mediaId)
        .eq("media_type", type);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchlist");
    },
  });

  const isInWatchlist = (mediaId: number, type: "movie" | "tv") =>
    watchlist.some(w => w.media_id === mediaId && w.media_type === type);

  return { watchlist, isLoading, addMutation, removeMutation, isInWatchlist };
}
