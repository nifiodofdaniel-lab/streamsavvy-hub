import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchMulti } from "@/lib/tmdb";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import SkeletonCard from "@/components/SkeletonCard";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMulti(query),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Search className="text-gold" size={24} />
            <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wider">SEARCH RESULTS</h1>
          </div>
          {query && (
            <p className="text-muted-foreground ml-9">
              {isLoading ? "Searching..." : `${results.length} results for `}
              {!isLoading && <span className="text-gold font-medium">"{query}"</span>}
            </p>
          )}
        </div>

        {!query && (
          <div className="text-center py-24">
            <Search size={48} className="text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">Type something in the search bar above</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!isLoading && results.length === 0 && query && (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
            <p className="text-muted-foreground text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map(item => (
              <MediaCard
                key={`${item.id}-${item.media_type}`}
                item={item}
                mediaType={(item.media_type as "movie" | "tv") || "movie"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
