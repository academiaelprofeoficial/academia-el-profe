'use client';

// ============================================================
// Sidebar Desktop — Academia El Profe Oficial
// Panel lateral izquierdo con enlaces de navegación
// rápida y sección de ayuda. Solo visible en desktop (lg+).
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Award,
  Heart,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { SIDEBAR_NAV } from '@/lib/data';
import { cn } from '@/lib/utils';

/** Mapa de íconos Lucide por clave */
const ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  BookOpen,
  Award,
  Heart,
  Clock,
  HelpCircle,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border/40 bg-muted/30 h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex flex-col gap-1 p-4 flex-1" aria-label="Navegación lateral">
        {SIDEBAR_NAV.map((item) => {
          const Icono = ICONOS[item.icono];
          const activo = pathname === item.href;

          return (
            <Link
              key={item.etiqueta}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activo
                  ? 'bg-brand-primary-bg-light text-brand-primary-text dark:bg-brand-primary-darkest/50 dark:text-brand-primary-text'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {Icono && <Icono className="h-4 w-4 shrink-0" />}
              {item.etiqueta}
            </Link>
          );
        })}
      </nav>

      {/* Sección de ayuda */}
      <div className="p-4 border-t border-border/40">
        <Link
          href="/soporte"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          ¿Necesitas ayuda?
        </Link>
      </div>
    </aside>
  );
}