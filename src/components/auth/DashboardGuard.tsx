'use client';

// ============================================================
// DashboardGuard — Protege rutas /dashboard/*
// - Si NO hay usuario logueado → redirige a /#hero
// - Si está cargando → muestra spinner centrado
// - Si hay usuario → renderiza children normalmente
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Estado para evitar redirección duplicada
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar Y no hay usuario Y no se ha redirigido aún
    if (!loading && !user && !redirected) {
      setRedirected(true);
      router.replace('/#hero');
    }
  }, [loading, user, redirected, router]);

  // ---- Estado: cargando auth ----
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  // ---- No autenticado: no renderizar nada (la redirección ya se disparó) ----
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          <p className="text-sm text-slate-400">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // ---- Autenticado: renderizar contenido del dashboard ----
  return <>{children}</>;
}