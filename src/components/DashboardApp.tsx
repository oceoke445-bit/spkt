'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/LoginPage';
import { Sidebar, SidebarContent } from '@/components/Sidebar';
import { MobileHeader } from '@/components/MobileHeader';
import { NotificationBell } from '@/components/NotificationBell';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { UserDashboard } from '@/components/UserDashboard';
import { CreateReport } from '@/components/CreateReport';
import { MyReports } from '@/components/MyReports';
import { LetterService } from '@/components/LetterService';
import { OfficerDashboard } from '@/components/OfficerDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminControl } from '@/components/AdminControl';
import { Information } from '@/components/Information';
import { Complaints } from '@/components/Complaints';
import { Settings } from '@/components/Settings';
import { AdminCSI } from '@/components/AdminCSI';
import { spktApi } from '@/lib/spktApi';
import { toast } from 'sonner';

export default function DashboardApp() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [draftReportId, setDraftReportId] = useState<string | null>(null);

  const navigate = (view: string, draftId?: string) => {
    if (draftId) setDraftReportId(draftId);
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <p className="text-blue-200">Memuat sesi...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const renderView = () => {
    if (user.role === 'user') {
      switch (currentView) {
        case 'dashboard':
          return <UserDashboard onNavigate={navigate} />;
        case 'create-report':
          return (
            <CreateReport
              draftId={draftReportId}
              onDraftConsumed={() => setDraftReportId(null)}
              onNavigate={navigate}
            />
          );
        case 'my-reports':
          return <MyReports onContinueDraft={(id) => navigate('create-report', id)} />;
        case 'letter-service':
          return <LetterService />;
        case 'complaints':
          return <Complaints />;
        case 'information':
          return <Information />;
        case 'settings':
          return <Settings />;
        default:
          return <UserDashboard onNavigate={navigate} />;
      }
    }

    if (user.role === 'petugas') {
      switch (currentView) {
        case 'dashboard':
        case 'incoming-reports':
          return <OfficerDashboard />;
        case 'letter-service':
          return <LetterService />;
        case 'complaints':
          return <Complaints />;
        case 'settings':
          return <Settings />;
        default:
          return <OfficerDashboard />;
      }
    }

    if (user.role === 'admin') {
      switch (currentView) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'all-reports':
          return <AdminControl />;
        case 'letter-service':
          return <LetterService />;
        case 'complaints':
          return <Complaints />;
        case 'user-management':
          return <UserManagement />;
        case 'statistics':
          return <AdminDashboard />;
        case 'csi-dashboard':
          return <AdminCSI />;
        case 'settings':
          return <Settings />;
        default:
          return <AdminDashboard />;
      }
    }

    return <UserDashboard onNavigate={navigate} />;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={navigate} />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[min(100vw-3rem,18rem)] max-w-[85vw] p-0 border-blue-500/30 bg-transparent [&>button]:text-white [&>button]:hover:text-blue-200 [&>button]:top-4 [&>button]:right-4"
        >
          <SidebarContent
            currentView={currentView}
            onViewChange={navigate}
            onNavigate={() => setMobileMenuOpen(false)}
            className="h-full"
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        <MobileHeader
          currentView={currentView}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onNavigate={navigate}
        />
        <div className="hidden md:flex items-center justify-end px-6 py-2 border-b border-blue-500/20 bg-blue-950/40">
          <NotificationBell onNavigate={navigate} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; email: string; role: string; active: boolean }>
  >([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    spktApi
      .getUsers()
      .then(({ users: data }) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleActive = async (u: { id: string; name: string; active: boolean }) => {
    try {
      await spktApi.updateUser(u.id, { active: !u.active });
      toast.success(u.active ? 'User dinonaktifkan' : 'User diaktifkan');
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
        <p className="text-blue-200 mt-1">Kelola pengguna sistem SPKT Digital</p>
      </div>

      {loading && <div className="text-center py-8 text-blue-300">Memuat data pengguna...</div>}

      {!loading && (
        <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border border-blue-500/50 rounded-lg shadow-xl overflow-hidden backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-blue-950/50 border-b border-blue-500/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/20">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/50">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          u.active
                            ? 'bg-green-500/30 text-green-100 border-green-400/50'
                            : 'bg-red-500/30 text-red-100 border-red-400/50'
                        }`}
                      >
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        className="text-red-400 hover:text-red-300"
                      >
                        {u.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
