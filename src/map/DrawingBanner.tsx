import { useEffect, useState } from "react";

interface DrawingBannerProps {
  isDrawing: boolean;
  onCancel: () => void;
}

function DrawingBanner({ isDrawing, onCancel }: DrawingBannerProps) {
  // Same materialize-in pattern as the vessel popup: render closed for one
  // frame, then transition open, so it doesn't just pop into existence.
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!isDrawing) {
      setIsOpen(false);
      return;
    }
    const animationFrameId = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDrawing]);

  if (!isDrawing) return null;

  return (
    <div
      className={`absolute top-4 left-1/2 flex origin-top -translate-x-1/2 items-center gap-3 rounded-lg border border-white/10 bg-black/70 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md motion-safe:transition-all motion-safe:duration-200 ${
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      <span>Click the map to draw a route, double-click to finish</span>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium transition-colors hover:bg-white/20"
      >
        Cancel
      </button>
    </div>
  );
}

export default DrawingBanner;
