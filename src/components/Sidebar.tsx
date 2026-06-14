import React from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Mail,
  MessageSquare,
  Info,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
  BarChart3,
  Inbox,
  Star
} from 'lucide-react';
import { cn } from './ui/utils';
import { iconAccent } from './iconStyles';

interface MenuItem {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  view: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, iconColor: iconAccent.sky.color, label: 'Dashboard', view: 'dashboard', roles: ['user', 'petugas', 'admin'] },
  { icon: FileText, iconColor: iconAccent.cyan.color, label: 'Buat Laporan', view: 'create-report', roles: ['user'] },
  { icon: ClipboardList, iconColor: iconAccent.blue.color, label: 'Laporan Saya', view: 'my-reports', roles: ['user'] },
  { icon: Inbox, iconColor: iconAccent.indigo.color, label: 'Laporan Masuk', view: 'incoming-reports', roles: ['petugas'] },
  { icon: ClipboardList, iconColor: iconAccent.violet.color, label: 'Semua Laporan', view: 'all-reports', roles: ['admin'] },
  { icon: Mail, iconColor: iconAccent.violet.color, label: 'Layanan Surat', view: 'letter-service', roles: ['user', 'petugas', 'admin'] },
  { icon: MessageSquare, iconColor: iconAccent.emerald.color, label: 'Pengaduan', view: 'complaints', roles: ['user', 'petugas', 'admin'] },
  { icon: Users, iconColor: iconAccent.sky.color, label: 'User Management', view: 'user-management', roles: ['admin'] },
  { icon: BarChart3, iconColor: iconAccent.amber.color, label: 'Statistik', view: 'statistics', roles: ['admin'] },
  { icon: Star, iconColor: iconAccent.amber.color, label: 'Kepuasan (CSI)', view: 'csi-dashboard', roles: ['admin'] },
  { icon: Info, iconColor: iconAccent.cyan.color, label: 'Informasi', view: 'information', roles: ['user'] },
  { icon: Settings, iconColor: iconAccent.blue.color, label: 'Pengaturan', view: 'settings', roles: ['user', 'petugas', 'admin'] },
];

export const getViewLabel = (view: string): string => {
  const item = menuItems.find((menuItem) => menuItem.view === view);
  return item?.label ?? 'Dashboard';
};

interface SidebarContentProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onNavigate?: () => void;
  className?: string;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  currentView,
  onViewChange,
  onNavigate,
  className
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user.role));

  const handleNavigate = (view: string) => {
    onViewChange(view);
    onNavigate?.();
  };

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
  };

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-b from-blue-950/95 via-blue-900/95 to-blue-950/95', className)}>
      <div className="p-4 sm:p-6 border-b border-blue-500/30 bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-xl border border-blue-400/30 shrink-0">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-sky-200" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg text-white truncate">SPKT Digital</h1>
            <p className="text-xs text-blue-200">Polisi Indonesia</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full">
        <nav className="space-y-1 px-3">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNavigate(item.view)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg border border-blue-400/50'
                    : 'text-blue-200 hover:bg-blue-800/60 hover:text-white hover:border hover:border-blue-500/30'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0',
                    isActive ? 'text-sky-200' : item.iconColor
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-blue-500/30 bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur">
        <div className="mb-3 px-3 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-blue-200 truncate">{user.email}</p>
          <p className="text-xs text-blue-100 mt-1 capitalize bg-blue-700/50 px-2 py-0.5 rounded inline-block border border-blue-500/30">
            {user.role}
          </p>
        </div>
        <Button
          className="w-full justify-start gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white border border-rose-400/50 shadow-sm [&_svg]:text-rose-100"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
};

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-blue-500/30 shadow-2xl backdrop-blur h-screen">
      <SidebarContent currentView={currentView} onViewChange={onViewChange} className="w-full" />
    </aside>
  );
};
