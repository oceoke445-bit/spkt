'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { spktApi, type NotificationItem } from '@/lib/spktApi';

interface NotificationBellProps {
  onNavigate?: (view: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { notifications: data } = await spktApi.getNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const unread = notifications.filter((n) => !n.read).length;

  const handleClick = async (n: NotificationItem) => {
    if (!n.read) {
      await spktApi.markNotificationRead(n.id);
      refresh();
    }
    if (n.link && onNavigate) {
      onNavigate(n.link);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative border-blue-500/50 text-blue-100 hover:bg-blue-800/60"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 p-0"
      >
        <div className="p-3 border-b border-blue-500/30 flex justify-between items-center">
          <span className="text-sm font-medium text-white">Notifikasi</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => spktApi.markAllNotificationsRead().then(refresh)}
              className="text-xs text-cyan-300 hover:text-cyan-200"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-blue-300 text-center">Tidak ada notifikasi</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClick(n)}
                className={`w-full text-left p-3 border-b border-blue-500/20 hover:bg-blue-800/40 transition-colors ${
                  !n.read ? 'bg-blue-800/30' : ''
                }`}
              >
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="text-xs text-blue-200 mt-1">{n.message}</p>
                <p className="text-[10px] text-blue-400 mt-1">
                  {new Date(n.createdAt).toLocaleString('id-ID')}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
