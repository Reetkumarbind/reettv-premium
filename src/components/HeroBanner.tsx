import React, { useState, useEffect, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { IPTVChannel } from '../types';

interface HeroBannerProps {
  channels: IPTVChannel[];
  onSelect: (channel: IPTVChannel) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ channels, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = channels.slice(0, 5);

  const next = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + featured.length) % featured.length);
  }, [featured.length]);

  // Auto-rotate every 5s
  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, featured.length]);

  if (featured.length === 0) return null;

  const current = featured[activeIndex];

  return (
    <div className="relative w-full h-48 sm:h-56 lg:h-64 mb-6 rounded-2xl overflow-hidden group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end p-6 sm:p-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-live text-[10px] px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              LIVE
            </span>
            {current.group && (
              <span className="badge-category text-[10px] px-2 py-0.5">{current.group}</span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground truncate mb-1">
            {current.name}
          </h2>
          {current.language && (
            <p className="text-sm text-muted-foreground">{current.language}</p>
          )}
        </div>

        <button
          onClick={() => onSelect(current)}
          className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-premium flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
        >
          <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
        </button>
      </div>

      {/* Logo watermark */}
      {current.logo && (
        <div className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 opacity-30">
          <img src={current.logo} alt="" className="w-full h-full object-contain" loading="lazy" />
        </div>
      )}

      {/* Navigation arrows */}
      {featured.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/40 backdrop-blur-sm border border-border/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/60"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/40 backdrop-blur-sm border border-border/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/60"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </>
      )}

      {/* Dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
