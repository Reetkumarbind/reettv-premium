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
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 active:scale-[0.96] hover:-translate-y-1.5 animate-slide-up-fade"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Glassmorphism card background */}
      <div className="absolute inset-0 bg-card/60 backdrop-blur-xl border border-border/10 rounded-2xl group-hover:border-primary/20 transition-colors duration-500" />
      
      {/* Ambient glow on hover */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10"
        style={{ background: `radial-gradient(circle, hsl(${hue} 70% 50% / 0.15), transparent 70%)` }}
      />

      {/* Thumbnail / Logo area */}
      <div className="relative aspect-[4/3] sm:aspect-video flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `linear-gradient(145deg, hsl(${hue} 40% 15%), hsl(${(hue + 60) % 360} 30% 10%))` }}
        />

        {showOriginal && (
          <img
            src={channel.logo}
            alt={channel.name}
            className="relative w-full h-full object-contain p-5 transition-all duration-700 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        {showLookup && (
          <img
            src={getLogoSearchUrl(channel.name)}
            alt={channel.name}
            className="relative w-full h-full object-contain p-5 transition-all duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={() => setLookupFailed(true)}
          />
        )}
        {showFallback && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 50% 20%), hsl(${(hue + 40) % 360} 40% 15%))` }}
            />
            <span className="relative text-3xl font-black text-foreground/40 select-none tracking-wider">{getInitials(channel.name)}</span>
          </div>
        )}

        {/* Play overlay with cinematic reveal */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 delay-75 shadow-lg shadow-primary/30">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* LIVE badge with pulse ring */}
        <div className="absolute top-2.5 left-2.5">
          <span className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-destructive/90 text-destructive-foreground backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
            <span className="absolute w-1.5 h-1.5 top-[5px] left-[9px] rounded-full bg-destructive-foreground animate-ping opacity-50" />
            Live
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90 ${
            isFavorite ? 'bg-destructive/20 opacity-100' : 'bg-background/20 hover:bg-background/40'
          }`}
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? 'text-destructive fill-destructive scale-110' : 'text-foreground/80'}`} />
        </button>
      </div>

      {/* Info with subtle separator */}
      <div className="relative p-3">
        <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
        <h3 className="text-sm font-semibold text-foreground truncate leading-snug group-hover:text-primary transition-colors duration-300">{channel.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          {channel.group && (
            <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full border border-border/10">{channel.group}</span>
          )}
          {channel.language && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Wifi className="w-2.5 h-2.5" />
              {channel.language}
            </span>
          )}
        </div>
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
