import type { Metadata } from 'next';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardGuard } from '@/components/auth/DashboardGuard';

export const metadata: Metadata = {
  title: 'Mi Panel — Academia El Profe',
  description: 'Panel de estudiante de Academia El Profe Oficial.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <LandingHeader />
      <DashboardGuard>
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <DashboardSidebar />
              <main className="lg:col-span-4 flex flex-col gap-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </DashboardGuard>
    </div>
  );
}