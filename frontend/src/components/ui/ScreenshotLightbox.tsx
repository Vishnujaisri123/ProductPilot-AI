import { useEffect, useState, useRef } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ScreenshotLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ScreenshotLightbox({ src, alt, onClose }: ScreenshotLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Prevent body scrolling while open
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const nextScale = e.deltaY < 0 ? scale + zoomFactor : scale - zoomFactor;
    setScale(Math.max(0.5, Math.min(4, nextScale)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-lg select-none"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Bar */}
      <div className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-black/20 z-10">
        <div>
          <h3 className="font-semibold text-white text-sm line-clamp-1">{alt}</h3>
          <p className="text-white/40 text-xs mt-0.5">Use scroll wheel to zoom, drag to pan</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScale((s) => Math.min(4, s + 0.25))}
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={reset}
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors border border-white/5"
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors bg-white/5"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="flex-1 w-full overflow-hidden flex items-center justify-center relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className="max-w-[90%] max-h-[85vh] transition-transform duration-300"
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="rounded-xl shadow-2xl border border-white/10 max-h-[80vh] w-auto object-contain pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
