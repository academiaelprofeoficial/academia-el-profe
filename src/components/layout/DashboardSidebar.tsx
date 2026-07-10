'use client';

// ============================================================
// DashboardSidebar — Sidebar compartido para todas las
// subpáginas del dashboard (/dashboard/*).
// Solo visible en PC (lg+). En móvil se usa el tab bar inferior.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Award,
  Heart,
  Clock,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SIDEBAR_ITEMS = [
  { label: 'Mis cursos', icon: BookOpen, href: '/dashboard/cursos' },
  { label: 'Mis certificados', icon: Award, href: '/dashboard/certificados' },
  { label: 'Lista de deseos', icon: Heart, href: '/dashboard/deseos' },
  { label: 'Historial de clases', icon: Clock, href: '/dashboard/historial' },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6">
      {/* Volver al inicio */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-heading transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-primary-bg-light text-brand-primary-text dark:bg-brand-primary-darkest/30 dark:text-brand-primary-text'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Help box */}
      <div className="mt-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-brand-primary" />
          <span className="text-sm font-semibold text-brand-heading dark:text-slate-200">
            ¿Necesitas ayuda?
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Nuestro equipo de soporte está disponible para ayudarte con
          cualquier consulta.
        </p>
        <Link href="/soporte">
          <Button
            size="sm"
            className="w-full h-9 text-xs font-semibold gap-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white"
          >
            <Headphones className="h-3.5 w-3.5" />
            Contactar soporte
          </Button>
        </Link>
      </div>
    </aside>
  );
}