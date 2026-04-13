import React from 'react';
import { Home, Flame, Heart, Grid3X3, Settings } from 'lucide-react';
import { SidebarView } from './AppSidebar';

interface BottomNavBarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onOpenSettings: () => void;
  favoritesCount: number;
}

const tabs: { id: SidebarView; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'categories', label: 'Browse', icon: Grid3X3 },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeView,
  onViewChange,
  onOpenSettings,
  favoritesCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-bottom">
      <div className="bg-card/80 backdrop-blur-2xl border-t border-border/10 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around px-1 h-16">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 relative transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                )}
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    fill={isActive && id === 'favorites' ? 'currentColor' : 'none'}
                  />
                  {id === 'favorites' && favoritesCount > 0 && (
                    <span className="absolute -top-0.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full px-1 shadow-sm">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] transition-all duration-300 ${
                  isActive ? 'font-bold text-primary' : 'font-medium'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-muted-foreground transition-all duration-300 hover:text-foreground"
          >
            <div className="p-1.5 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
