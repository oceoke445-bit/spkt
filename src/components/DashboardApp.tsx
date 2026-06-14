'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { AdminStatistics } from '@/components/AdminStatistics';
import { AdminControl } from '@/components/AdminControl';
import { AdminUserManagement } from '@/components/AdminUserManagement';
import { AdminOfficerManagement } from '@/components/AdminOfficerManagement';
import { Information } from '@/components/Information';
import { Complaints } from '@/components/Complaints';
import { Settings } from '@/components/Settings';
import { AdminCSI } from '@/components/AdminCSI';

const VIEW_PARAM = 'view';

export default function DashboardApp() {
  const { user, isAuthenticated, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [draftReportId, setDraftReportId] = useState<string | null>(null);

  const currentView = searchParams.get(VIEW_PARAM) ?? 'dashboard';

  const navigate = useCallback(
    (view: string, draftId?: string) => {
      if (draftId) setDraftReportId(draftId);
      const params = new URLSearchParams(searchParams.toString());
      params.set(VIEW_PARAM, view);
      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const view = searchParams.get(VIEW_PARAM);
      if (!view) {
        navigate('dashboard');
      }
    }
  }, [loading, isAuthenticated, user, searchParams, navigate]);

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
          return <OfficerDashboard />;
        case 'incoming-reports':
          return <OfficerDashboard />;
        case 'letter-service':
          return <LetterService />;
        case 'complaints':
          return <Complaints />;
        case 'information':
          return <Information />;
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
          return <AdminUserManagement />;
        case 'officer-management':
          return <AdminOfficerManagement />;
        case 'statistics':
          return <AdminStatistics />;
        case 'csi-dashboard':
          return <AdminCSI />;
        case 'information':
          return <Information />;
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
