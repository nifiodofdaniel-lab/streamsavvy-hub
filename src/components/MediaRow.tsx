import { useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MediaCard from "./MediaCard";
import { MediaItem, SectionId } from "@/lib/tmdb";
import SkeletonCard from "./SkeletonCard";

type Props = {
  title: string;
  items: MediaItem[];
  mediaType: "movie" | "tv" | "mixed";
  isLoading?: boolean;
  sectionId?: SectionId;
};

export default function MediaRow({ title, items, mediaType, isLoading, sectionId }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wider">{title}</h2>
        <div className="flex items-center gap-2">
          {sectionId && (
            <button
              onClick={() => navigate(`/section/${sectionId}`)}
              className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors px-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/20"
            >
              See More
              <ArrowRight size={14} />
            </button>
          )}
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/20 hover:text-gold border border-border transition-all flex items-center justify-center text-muted-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/20 hover:text-gold border border-border transition-all flex items-center justify-center text-muted-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6"
        style={{ maxWidth: "100%", scrollPaddingLeft: "1.5rem" }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(item => (
              <div key={`${item.id}-${item.media_type || mediaType}`} className="shrink-0 w-[140px] sm:w-[160px]">
                <MediaCard
                  item={item}
                  mediaType={(item.media_type as "movie" | "tv") || (mediaType === "mixed" ? "movie" : mediaType)}
                />
              </div>
            ))}
      </div>
    </section>
  );
}
