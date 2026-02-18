'use client';

import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  orderNumber: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({ notifications, onMarkAsRead, onClearAll }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {notifications.length > 0 && (
             <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto text-xs px-2 text-gray-500 hover:text-gray-900"
                onClick={onClearAll}
             >
                Clear all
             </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
           {notifications.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs">No notifications yet</p>
             </div>
           ) : (
             <div className="divide-y">
               {notifications.map((notification) => (
                 <div 
                    key={notification.id} 
                    className={cn(
                        "px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-3",
                        !notification.read && "bg-blue-50/50"
                    )}
                    onClick={() => onMarkAsRead(notification.id)}
                 >
                    <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", !notification.read ? "bg-blue-600" : "bg-transparent")} />
                    <div className="flex-1 space-y-1">
                        <p className={cn("text-sm", !notification.read ? "font-medium text-gray-900" : "text-gray-600")}>
                            New Order <span className="font-mono bg-gray-100 px-1 rounded">{notification.orderNumber}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
