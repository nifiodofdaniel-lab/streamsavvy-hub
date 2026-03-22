import { useParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import MediaCard from "@/components/MediaCard";
import SkeletonCard from "@/components/SkeletonCard";
import { getSectionPage, SECTION_META, SectionId } from "@/lib/tmdb";

export default function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();

  const validId = sectionId as SectionId;
  const meta = SECTION_META[validId];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["section", validId],
    queryFn: ({ pageParam = 1 }) => getSectionPage(validId, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: !!meta,
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.pages.flatMap(p => p.results) ?? [];

  if (!meta) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground text-lg">Section not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back button — top-right, clears the header */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-border/40 text-foreground hover:text-gold hover:border-gold/40 transition-all duration-200 text-sm font-medium"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Page title */}
        <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">
          {meta.title}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {items.length > 0 ? `Showing ${items.length} results` : "Loading…"}
        </p>

        {/* Grid */}
        {isError ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            Failed to load results. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {isLoading
              ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
              : items.map(item => (
                  <MediaCard
                    key={`${item.id}-${item.media_type || meta.mediaType}`}
                    item={item}
                    mediaType={(item.media_type as "movie" | "tv") || meta.mediaType}
                  />
                ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && !isError && (
          <div className="flex justify-center mt-12">
            {hasNextPage ? (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/60 text-gold font-medium text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            ) : (
              items.length > 0 && (
                <p className="text-muted-foreground text-sm">All results loaded</p>
              )
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
