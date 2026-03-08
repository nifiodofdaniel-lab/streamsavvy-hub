import { X } from "lucide-react";

type Props = {
  videoKey: string;
  title: string;
  onClose: () => void;
};

export default function TrailerModal({ videoKey, title, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl text-foreground tracking-wider truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 bg-muted/50 rounded-full p-2"
          >
            <X size={18} />
          </button>
        </div>
        <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
