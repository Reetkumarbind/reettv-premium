import React, { useState, useEffect, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { IPTVChannel } from '../types';
import heroPhoto from '@/assets/hero-photo.png';

interface HeroBannerProps {
  channels: IPTVChannel[];
  onSelect: (channel: IPTVChannel) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ channels, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const featured = channels.slice(0, 5);

  const goTo = useCallback((idx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const next = useCallback(() => {
    goTo((activeIndex + 1) % featured.length);
  }, [activeIndex, featured.length, goTo]);

  const prev = useCallback(() => {
    goTo((activeIndex - 1 + featured.length) % featured.length);
  }, [activeIndex, featured.length, goTo]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, featured.length]);

  if (featured.length === 0) return null;
  const safeIndex = activeIndex >= featured.length ? 0 : activeIndex;
  const current = featured[safeIndex];

  return (
    <div className="relative w-full h-48 sm:h-56 lg:h-72 mb-6 rounded-3xl overflow-hidden group animate-fade-in">
      {/* Hero photo background */}
      <img src={heroPhoto} alt="REET TV Hero" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[0.5px] border border-border/10 rounded-3xl" />

      {/* Floating particles effect */}
      <div className="absolute top-8 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-8 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Logo watermark */}
      {current.logo && (
        <div className={`absolute top-4 right-6 w-20 h-20 sm:w-28 sm:h-28 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-90' : 'opacity-10 scale-100'}`}>
          <img src={current.logo} alt="" className="w-full h-full object-contain" loading="lazy" />
        </div>
      )}

      {/* Content */}
      <div className={`absolute inset-0 flex items-end p-5 sm:p-7 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
              <span className="absolute w-1.5 h-1.5 top-[5px] left-[11px] rounded-full bg-destructive-foreground animate-ping opacity-40" />
              Live Now
            </span>
            {current.group && (
              <span className="text-[10px] text-muted-foreground bg-muted/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/10">{current.group}</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground truncate mb-1 tracking-tight">
            {current.name}
          </h2>
          {current.language && (
            <p className="text-xs text-muted-foreground/70">{current.language}</p>
          )}
        </div>

        <button
          onClick={() => onSelect(current)}
          className="flex-shrink-0 w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl shadow-primary/30 animate-pulse-ring"
        >
          <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
        </button>
      </div>

      {/* Nav arrows */}
      {featured.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/30 backdrop-blur-md border border-border/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background/50 hover:scale-110">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/30 backdrop-blur-md border border-border/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background/50 hover:scale-110">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </>
      )}

      {/* Animated progress bar + dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
              style={{ width: i === activeIndex ? 28 : 8 }}
            >
              <div className="absolute inset-0 bg-muted-foreground/20" />
              {i === activeIndex && (
                <div className="absolute inset-0 bg-primary rounded-full animate-[shimmer-pulse_6s_ease-in-out_infinite]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
