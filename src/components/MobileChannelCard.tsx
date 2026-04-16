import React, { useState, memo } from 'react';
import { Heart, Play, TrendingUp, Star } from 'lucide-react';
import { IPTVChannel } from '../types';

interface MobileChannelCardProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  index: number;
  badge?: 'trending' | 'favorite' | 'new';
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

const MobileChannelCard: React.FC<MobileChannelCardProps> = memo(({
  channel,
  isFavorite,
  onSelect,
  onToggleFavorite,
  index,
  badge,
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

  const getBadgeIcon = () => {
    switch (badge) {
      case 'trending':
        return <TrendingUp className="w-3 h-3" />;
      case 'favorite':
        return <Star className="w-3 h-3 fill-current" />;
      case 'new':
        return <span className="text-[10px] font-bold">NEW</span>;
      default:
        return null;
    }
  };

  const getBadgeLabel = () => {
    switch (badge) {
      case 'trending':
        return 'Trending';
      case 'favorite':
        return 'Favorite';
      case 'new':
        return 'New';
      default:
        return '';
    }
  };

  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col items-center cursor-pointer transition-all duration-300 active:scale-[0.97]"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      {/* Circular card */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
        <div className="absolute inset-0 rounded-full border-2 border-border/20 group-hover:border-primary/40 transition-colors duration-300" />
        <div className="absolute inset-0 rounded-full bg-card" />

        <div className="relative w-full h-full flex items-center justify-center">
          {showOriginal && (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          )}
          {showLookup && (
            <img
              src={getLogoSearchUrl(channel.name)}
              alt={channel.name}
              className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setLookupFailed(true)}
            />
          )}
          {showFallback && (
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 25%), hsl(${(hue + 40) % 360} 50% 20%))` }}
            >
              <span className="text-lg font-black text-foreground/60 select-none">{getInitials(channel.name)}</span>
            </div>
          )}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
        </div>

        {/* LIVE badge */}
        <div className="absolute top-0 right-0 z-20">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase bg-destructive/90 text-destructive-foreground">
            <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse" />
            Live
          </span>
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute bottom-0 left-0 z-20">
            <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase ${
              badge === 'trending' ? 'bg-orange-500/90 text-white'
              : badge === 'favorite' ? 'bg-rose-500/90 text-white'
              : 'bg-blue-500/90 text-white'
            }`}>
              {getBadgeIcon()}
            </div>
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute bottom-0 right-0 p-1.5 rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200 active:scale-90 z-20 ${isFavorite ? '' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'text-red-400 fill-red-400' : 'text-white/90'}`} />
        </button>
      </div>

      {/* Name below */}
      <div className="mt-1.5 text-center w-20 sm:w-24">
        <h3 className="text-[11px] sm:text-xs font-bold text-foreground truncate leading-tight">{channel.name}</h3>
        {channel.group && (
          <span className="text-[9px] text-muted-foreground truncate block mt-0.5">{channel.group}</span>
        )}
      </div>
    </div>
  );
}, (prev, next) => (
  prev.channel.id === next.channel.id &&
  prev.isFavorite === next.isFavorite &&
  prev.badge === next.badge &&
  prev.index === next.index
));

MobileChannelCard.displayName = 'MobileChannelCard';

export default MobileChannelCard;
