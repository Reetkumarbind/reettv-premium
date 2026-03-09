import { useEffect } from 'react';
import { useUIStore, useNotificationStore } from '@/store';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationCenter = () => {
  const { notifications, unreadCount, removeNotification, markAsRead } = useNotificationStore();
  const { showSettings } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.slice(0, 5).map((notif) => (
        <div
          key={notif.id}
          className={cn(
            'pointer-events-auto min-w-sm max-w-sm rounded-lg border shadow-lg p-4 backdrop-blur-sm animate-slide-in-right',
            {
              'bg-green-500/10 border-green-500/30': notif.type === 'success',
              'bg-red-500/10 border-red-500/30': notif.type === 'error',
              'bg-yellow-500/10 border-yellow-500/30': notif.type === 'warning',
              'bg-blue-500/10 border-blue-500/30': notif.type === 'info',
            }
          )}
          onClick={() => markAsRead(notif.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-medium text-foreground">{notif.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notif.id);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotificationBell = () => {
  const { unreadCount } = useNotificationStore();

  return (
    <div className="relative">
      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
        <Bell className="w-5 h-5" />
      </button>
      {unreadCount > 0 && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </div>
      )}
    </div>
  );
};
