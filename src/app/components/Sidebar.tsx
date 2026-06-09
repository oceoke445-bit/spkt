import React from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from './ui/button';
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
  Inbox
} from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  view: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', view: 'dashboard', roles: ['user', 'petugas', 'admin'] },
  { icon: <FileText className="w-5 h-5" />, label: 'Buat Laporan', view: 'create-report', roles: ['user'] },
  { icon: <ClipboardList className="w-5 h-5" />, label: 'Laporan Saya', view: 'my-reports', roles: ['user'] },
  { icon: <Inbox className="w-5 h-5" />, label: 'Laporan Masuk', view: 'incoming-reports', roles: ['petugas'] },
  { icon: <ClipboardList className="w-5 h-5" />, label: 'Semua Laporan', view: 'all-reports', roles: ['admin'] },
  { icon: <Mail className="w-5 h-5" />, label: 'Layanan Surat', view: 'letter-service', roles: ['user', 'petugas', 'admin'] },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Pengaduan', view: 'complaints', roles: ['user', 'admin'] },
  { icon: <Users className="w-5 h-5" />, label: 'User Management', view: 'user-management', roles: ['admin'] },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Statistik', view: 'statistics', roles: ['admin'] },
  { icon: <Info className="w-5 h-5" />, label: 'Informasi', view: 'information', roles: ['user'] },
  { icon: <Settings className="w-5 h-5" />, label: 'Pengaturan', view: 'settings', roles: ['user', 'petugas', 'admin'] }
];

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-64 bg-gradient-to-b from-blue-950/95 via-blue-900/95 to-blue-950/95 border-r border-blue-500/30 flex flex-col h-screen shadow-2xl backdrop-blur">
      <div className="p-6 border-b border-blue-500/30 bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-xl border border-blue-400/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">SPKT Digital</h1>
            <p className="text-xs text-blue-200">Polisi Indonesia</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredMenuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                currentView === item.view
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg border border-blue-400/50'
                  : 'text-blue-200 hover:bg-blue-800/60 hover:text-white hover:border hover:border-blue-500/30'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-blue-500/30 bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-blue-200">{user.email}</p>
          <p className="text-xs text-blue-100 mt-1 capitalize bg-blue-700/50 px-2 py-0.5 rounded inline-block border border-blue-500/30">
            {user.role}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-blue-500/50 text-blue-200 hover:bg-blue-800/50 hover:text-white hover:border-blue-400"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
};
