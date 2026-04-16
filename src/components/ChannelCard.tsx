import React, { useState, memo } from 'react';
import { Heart, Play, Wifi } from 'lucide-react';
import { IPTVChannel } from '../types';

interface ChannelCardProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  index: number;
}

function getInitials(name: string): string {
  return name.split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function getGradientHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function getLogoSearchUrl(name: string): string {
  const cleanName = name.replace(/\s*(HD|SD|FHD|UHD|4K|\+)\s*/gi, '').trim();
  const domain = cleanName.toLowerCase().replace(/\s+/g, '') + '.com';
  return `https://img.logo.dev/${domain}?token=pk_anonymous&size=120&format=png`;
}

const ChannelCard: React.FC<ChannelCardProps> = memo(({
  channel,
  isFavorite,
  onSelect,
  onToggleFavorite,
  index,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [lookupFailed, setLookupFailed] = useState(false);
  const showOriginal = channel.logo && !imgFailed;
  const showLookup = !showOriginal && !lookupFailed;
  const showFallback = !showOriginal && lookupFailed;
  const hue = getGradientHue(channel.name);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const delay = Math.min(index * 40, 400);

  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 active:scale-[0.96] hover:-translate-y-1.5 animate-slide-up-fade"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Circular card */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden">
        {/* Ambient glow on hover */}
        <div
          className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10"
          style={{ background: `radial-gradient(circle, hsl(${hue} 70% 50% / 0.25), transparent 70%)` }}
        />

        {/* Border ring */}
        <div className="absolute inset-0 rounded-full border-2 border-border/20 group-hover:border-primary/40 transition-colors duration-500" />

        {/* Background */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{ background: `linear-gradient(145deg, hsl(${hue} 40% 15%), hsl(${(hue + 60) % 360} 30% 10%))` }}
        />
        <div className="absolute inset-0 rounded-full bg-card/60 backdrop-blur-xl" />

        {/* Logo / Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          {showOriginal && (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          )}
          {showLookup && (
            <img
              src={getLogoSearchUrl(channel.name)}
              alt={channel.name}
              className="w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setLookupFailed(true)}
            />
          )}
          {showFallback && (
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 50% 20%), hsl(${(hue + 40) % 360} 40% 15%))` }}
            >
              <span className="text-xl sm:text-2xl font-black text-foreground/40 select-none tracking-wider">{getInitials(channel.name)}</span>
            </div>
          )}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 delay-75 shadow-lg shadow-primary/30">
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* LIVE badge */}
        <div className="absolute top-0 right-0">
          <span className="relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase bg-destructive/90 text-destructive-foreground backdrop-blur-sm shadow-sm">
            <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse" />
            Live
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute bottom-0 right-0 p-1.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 ${
            isFavorite ? 'bg-destructive/20' : 'bg-background/40 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 transition-all duration-300 ${isFavorite ? 'text-destructive fill-destructive' : 'text-foreground/80'}`} />
        </button>
      </div>

      {/* Channel name below circle */}
      <div className="mt-2 text-center w-24 sm:w-28 md:w-32">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate leading-snug group-hover:text-primary transition-colors duration-300">{channel.name}</h3>
        {channel.group && (
          <span className="text-[9px] text-muted-foreground truncate block mt-0.5">{channel.group}</span>
        )}
      </div>
    </div>
  );
}, (prev, next) => (
  prev.channel.id === next.channel.id &&
  prev.isFavorite === next.isFavorite &&
  prev.index === next.index
));

ChannelCard.displayName = 'ChannelCard';

export default ChannelCard;
