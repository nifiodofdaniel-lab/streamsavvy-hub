export default function SkeletonCard() {
  return (
    <div className="w-[140px] sm:w-[160px] shrink-0 rounded-xl overflow-hidden bg-card border border-border/30">
      <div className="aspect-[2/3] shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 rounded shimmer" />
        <div className="h-2 rounded w-1/2 shimmer" />
      </div>
    </div>
  );
}
