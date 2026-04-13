import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IPTVChannel } from '../types';
import ChannelCard from './ChannelCard';

interface CategoryRowProps {
  title: string;
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (channels.length === 0) return null;

  return (
    <div className="mb-8 group/row animate-slide-up-fade">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <h3 className="text-base font-bold text-foreground tracking-tight">{title}</h3>
        </div>
        <span className="text-[11px] text-muted-foreground bg-muted/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-border/10">{channels.length} channels</span>
      </div>
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background/60 backdrop-blur-md border border-border/10 opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:bg-background/80 hover:scale-110 shadow-xl"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {channels.map((channel, index) => (
            <div key={channel.id} className="flex-shrink-0 w-36 sm:w-44 lg:w-48 snap-start">
              <ChannelCard
                channel={channel}
                isFavorite={favorites.has(channel.id)}
                onSelect={() => onSelect(channel)}
                onToggleFavorite={() => onToggleFavorite(channel.id)}
                index={index}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background/60 backdrop-blur-md border border-border/10 opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:bg-background/80 hover:scale-110 shadow-xl"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default CategoryRow;
