import { Suspense } from 'react';
import DashboardApp from '@/components/DashboardApp';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <p className="text-blue-200">Memuat...</p>
      </div>
    }>
      <DashboardApp />
    </Suspense>
  );
}
