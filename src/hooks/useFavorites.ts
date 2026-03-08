import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { MediaItem, getTitle, getReleaseYear } from "@/lib/tmdb";
import { toast } from "sonner";
import { SavedMedia } from "./useWatchlist";

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavedMedia[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ item, type }: { item: MediaItem; type: "movie" | "tv" }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("favorites").insert({
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
      qc.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Added to favorites");
    },
    onError: () => toast.error("Failed to add to favorites"),
  });

  const removeMutation = useMutation({
    mutationFn: async ({ mediaId, type }: { mediaId: number; type: "movie" | "tv" }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("media_id", mediaId)
        .eq("media_type", type);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from favorites");
    },
  });

  const isFavorite = (mediaId: number, type: "movie" | "tv") =>
    favorites.some(f => f.media_id === mediaId && f.media_type === type);

  return { favorites, isLoading, addMutation, removeMutation, isFavorite };
}
