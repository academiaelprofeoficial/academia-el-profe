// ============================================================
// Dashboard Shell — Wrapper para páginas internas
// Mantiene el Header + Sidebar + MobileNav + Footer del diseño anterior.
// ============================================================

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

interface DashboardShellProps {
  readonly children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</div>
          <Footer />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}