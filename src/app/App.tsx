import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { Sidebar, SidebarContent } from "./components/Sidebar";
import { MobileHeader } from "./components/MobileHeader";
import { Sheet, SheetContent } from "./components/ui/sheet";
import { UserDashboard } from "./components/UserDashboard";
import { CreateReport } from "./components/CreateReport";
import { MyReports } from "./components/MyReports";
import { LetterService } from "./components/LetterService";
import { OfficerDashboard } from "./components/OfficerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminControl } from "./components/AdminControl";
import { Information } from "./components/Information";
import { Complaints } from "./components/Complaints";
import { Settings } from "./components/Settings";
import { Toaster } from "./components/ui/sonner";

const MainApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const renderView = () => {
    // User views
    if (user.role === "user") {
      switch (currentView) {
        case "dashboard":
          return <UserDashboard onNavigate={setCurrentView} />;
        case "create-report":
          return <CreateReport onNavigate={setCurrentView} />;
        case "my-reports":
          return <MyReports />;
        case "letter-service":
          return <LetterService />;
        case "complaints":
          return <Complaints />;
        case "information":
          return <Information />;
        case "settings":
          return <Settings />;
        default:
          return <UserDashboard onNavigate={setCurrentView} />;
      }
    }

    // Officer views
    if (user.role === "petugas") {
      switch (currentView) {
        case "dashboard":
        case "incoming-reports":
          return <OfficerDashboard />;
        case "letter-service":
          return <LetterService />;
        case "settings":
          return <Settings />;
        default:
          return <OfficerDashboard />;
      }
    }

    // Admin views
    if (user.role === "admin") {
      switch (currentView) {
        case "dashboard":
          return <AdminDashboard />;
        case "all-reports":
          return <AdminControl />;
        case "letter-service":
          return <LetterService />;
        case "complaints":
          return <Complaints />;
        case "user-management":
          return <UserManagement />;
        case "statistics":
          return <AdminDashboard />;
        case "settings":
          return <Settings />;
        default:
          return <AdminDashboard />;
      }
    }

    return <UserDashboard onNavigate={setCurrentView} />;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[min(100vw-3rem,18rem)] max-w-[85vw] p-0 border-blue-500/30 bg-transparent [&>button]:text-white [&>button]:hover:text-blue-200 [&>button]:top-4 [&>button]:right-4"
        >
          <SidebarContent
            currentView={currentView}
            onViewChange={setCurrentView}
            onNavigate={() => setMobileMenuOpen(false)}
            className="h-full"
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        <MobileHeader
          currentView={currentView}
          onMenuOpen={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {renderView()}
          </div>
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
};

// Coming Soon Component
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-white mb-2">
        {title}
      </h2>
      <p className="text-blue-200">
        Fitur ini sedang dalam pengembangan
      </p>
    </div>
  </div>
);

// User Management Component
const UserManagement: React.FC = () => {
  const users = [
    {
      id: "1",
      name: "Budi Santoso",
      email: "user@spkt.id",
      role: "User",
      status: "Active",
    },
    {
      id: "2",
      name: "Ipda. Ahmad Wijaya",
      email: "petugas@spkt.id",
      role: "Petugas",
      status: "Active",
    },
    {
      id: "3",
      name: "Kompol. Sarah Putri",
      email: "admin@spkt.id",
      role: "Admin",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          User Management
        </h1>
        <p className="text-blue-200 mt-1">
          Kelola pengguna sistem SPKT Digital
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border border-blue-500/50 rounded-lg shadow-xl overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-blue-950/50 border-b border-blue-500/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500/20">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-blue-800/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-white">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/50">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/30 text-green-100 border border-green-400/50">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-400 hover:text-blue-300 mr-3">
                    Edit
                  </button>
                  <button className="text-red-400 hover:text-red-300">
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

// Main App with Provider
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}