'use client';

// ============================================================
// Navegación Móvil Inferior — Academia El Profe Oficial
// Barra fija en la parte inferior de la pantalla para acceso
// rápido en dispositivos móviles (PWA-style). Solo visible
// en pantallas menores a lg.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Award, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Tabs de navegación móvil inferior */
const MOBILE_TABS: readonly { etiqueta: string; href: string; icono: React.ComponentType<{ className?: string }> }[] = [
  { etiqueta: 'Inicio', href: '/', icono: Home },
  { etiqueta: 'Mis Cursos', href: '/cursos', icono: BookOpen },
  { etiqueta: 'Certificados', href: '/certificados', icono: Award },
  { etiqueta: 'Soporte', href: '/soporte', icono: Headphones },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación móvil"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_TABS.map((tab) => {
          const activo =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icono = tab.icono;

          return (
            <Link
              key={tab.etiqueta}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg min-w-[64px] transition-colors',
                activo
                  ? 'text-brand-primary-text'
                  : 'text-muted-foreground'
              )}
              aria-current={activo ? 'page' : undefined}
            >
              <Icono className={cn('h-5 w-5', activo && 'stroke-[2.5px]')} />
              <span className={cn(
                'text-[10px] font-medium leading-tight',
                activo && 'font-bold'
              )}>
                {tab.etiqueta}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}