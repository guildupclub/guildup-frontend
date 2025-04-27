import React from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from './NotificationContext';

const NotificationDropdown = () => {
  const context = useNotifications();
  
  if (!context) {
    console.error('NotificationDropdown must be used within a NotificationProvider');
    return null;
  }

  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    fetchNotifications
  } = context;

  const handleRefresh = async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-col items-center">
          <button className="relative rounded-full hover:bg-zinc-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
          <span className="text-sm mt-1 text-zinc-500">Notifications</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto mt-2 bg-white">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleRefresh}
              className="text-xs text-primary border border-primary rounded px-2 py-1 hover:bg-primary hover:text-white"
            >
              Refresh
            </button>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="py-2">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification._id}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-gray-50' : ''}`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm bg-zinc-100 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No notifications yet</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown; 