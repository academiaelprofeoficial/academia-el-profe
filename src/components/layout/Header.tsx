'use client';

// ============================================================
// Header Principal — Academia El Profe Oficial
// Barra superior fija con logo, navegación, búsqueda,
// toggle de tema y perfil de usuario.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  Shield,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/** Links de navegación del header */
const NAV_LINKS: readonly { etiqueta: string; href: string }[] = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Mis Cursos', href: '/cursos' },
  { etiqueta: 'Certificados', href: '/certificados' },
  { etiqueta: 'Soporte', href: '/soporte' },
] as const;

export function Header() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Logo + Hamburguesa móvil */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuMovilAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-brand-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
              ACADEMIA <span className="text-brand-primary">EL PROFE</span>
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground sm:hidden">
              EL PROFE
            </span>
          </Link>
        </div>

        {/* Navegación desktop */}
        <nav className="hidden lg:flex items-center gap-1 ml-8" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href + link.etiqueta}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              {link.etiqueta}
            </Link>
          ))}
        </nav>

        {/* Espacio flexible */}
        <div className="flex-1" />

        {/* Barra de búsqueda desktop */}
        <div className="hidden md:flex items-center max-w-sm w-full mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notificaciones">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Menú de perfil */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-brand-primary-bg text-brand-primary-text text-xs font-bold">
                    MR
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  Hola, Mario
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Panel de Administración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuMovilAbierto && (
        <nav className="lg:hidden border-t border-border/40 bg-background px-4 pb-4" aria-label="Navegación móvil">
          <div className="flex flex-col gap-1 pt-3">
            {/* Búsqueda móvil */}
            <div className="relative mb-3 md:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href + '-movil'}
                href={link.href}
                onClick={() => setMenuMovilAbierto(false)}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                {link.etiqueta}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}