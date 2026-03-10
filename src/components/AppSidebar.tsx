import React, { useState } from 'react';
import {
  Home,
  Heart,
  Grid3X3,
  Settings,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  Tv,
  TrendingUp,
  Clock,
  Flame,
  Menu,
  X,
} from 'lucide-react';

export type SidebarView = 'home' | 'favorites' | 'categories' | 'trending';

interface AppSidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  favoritesCount: number;
}

const navItems: { id: SidebarView; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
];

const AppSidebar: React.FC<AppSidebarProps> = ({
  activeView,
  onViewChange,
  onOpenSettings,
  onOpenShortcuts,
  favoritesCount,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-primary" />
        ) : (
          <Menu className="w-5 h-5 text-primary" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          h-full flex flex-col bg-card/60 backdrop-blur-xl border-r border-border/30 
          transition-all duration-300 ease-out
          fixed lg:relative z-40 lg:z-auto
          ${
            mobileOpen
              ? 'w-[220px] translate-x-0'
              : collapsed
              ? 'w-[72px] -translate-x-full lg:translate-x-0'
              : 'w-[220px] translate-x-0'
          }
          lg:w-auto
          md:w-[200px]
        `}
        style={{
          width: mobileOpen ? '220px' : collapsed ? '72px' : '220px',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 md:px-4 h-14 md:h-16 border-b border-border/20 flex-shrink-0">
          <div className="w-8 md:w-9 h-8 md:h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Tv className="w-4 md:w-5 h-4 md:h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm md:text-base font-black tracking-tight text-foreground leading-none">
                REET TV
              </h1>
              <p className="text-[8px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Stream
              </p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 md:py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onViewChange(id);
                  closeMobileMenu();
                }}
                className={`
                  w-full flex items-center gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl 
                  text-xs md:text-sm font-medium transition-all duration-200 group relative
                  min-h-[44px] md:min-h-auto touch-target
                  ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  }
                `}
                title={collapsed ? label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 md:w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <Icon className={`w-4 md:w-[18px] h-4 md:h-[18px] flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {!collapsed && (
                  <span className="truncate text-left">{label}</span>
                )}
                {!collapsed && id === 'favorites' && favoritesCount > 0 && (
                  <span className="ml-auto text-[8px] md:text-[10px] font-bold bg-primary/20 text-primary px-1 md:px-1.5 py-0.5 rounded-md flex-shrink-0">
                    {favoritesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-border/20 p-2 space-y-1 flex-shrink-0">
          <button
            onClick={() => {
              onOpenShortcuts();
              closeMobileMenu();
            }}
            className="
              w-full flex items-center gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl 
              text-xs md:text-sm font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground 
              transition-colors min-h-[44px] md:min-h-auto
            "
            title={collapsed ? 'Shortcuts' : undefined}
          >
            <Keyboard className="w-4 md:w-[18px] h-4 md:h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-left">Shortcuts</span>}
          </button>
          <button
            onClick={() => {
              onOpenSettings();
              closeMobileMenu();
            }}
            className="
              w-full flex items-center gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl 
              text-xs md:text-sm font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground 
              transition-colors min-h-[44px] md:min-h-auto
            "
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 md:w-[18px] h-4 md:h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-left">Settings</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2 rounded-lg md:rounded-xl 
              text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground 
              transition-all min-h-[44px] md:min-h-auto
            "
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0" />
                <span className="text-left text-xs md:text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
