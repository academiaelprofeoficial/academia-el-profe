'use client';

// ============================================================
// Landing Header — Adaptive
// - NO logueado: Nav landing completa (Inicio, Cursos, Nosotros, Soporte)
// - Logueado: Nav inmersiva (solo logo + perfil + lupa), tab bar cambia
//   a items del dashboard
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  Monitor,
  Smartphone,
  BookOpen,
  Home,
  Award,
  Headset,
  Search,
  Heart,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { urlFor } from '@/lib/sanity.client';
import { PwaInstallButton } from '@/components/PwaInstallButton';

// ---- Nav links para visitante (landing) ----
const LANDING_NAV = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Cursos', href: '/cursos' },
  { etiqueta: 'Nosotros', href: '/nosotros' },
  { etiqueta: 'Soporte', href: '/soporte' },
] as const;

// ---- Nav links para usuario logueado (móvil menú) ----
const DASHBOARD_NAV = [
  { etiqueta: 'Mis cursos', href: '/dashboard/cursos', icon: BookOpen },
  { etiqueta: 'Mis certificados', href: '/dashboard/certificados', icon: Award },
  { etiqueta: 'Lista de deseos', href: '/dashboard/deseos', icon: Heart },
  { etiqueta: 'Historial de clases', href: '/dashboard/historial', icon: Clock },
  { etiqueta: 'Soporte', href: '/soporte', icon: Headset },
] as const;

// ---- Tab bar visitante (handled by MobileBottomBar) ----

// ---- Tab bar logueado (handled by MobileBottomBar) ----

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                             */
/* ------------------------------------------------------------------ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const menuVariants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.8 },
  },
  exit: {
    x: '-100%',
    transition: { type: 'spring' as const, damping: 30, stiffness: 350, mass: 0.6 },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.08 + i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

/* ------------------------------------------------------------------ */
/*  Logo component (CMS-first with static fallback)                    */
/* ------------------------------------------------------------------ */

function Logo({ className }: { readonly className?: string }) {
  const settings = useSiteSettings();

  const cmsLogoLight = settings?.logo?.asset
    ? urlFor(settings.logo).width(400).height(150).fit('clip').url()
    : null;

  const cmsLogoDark = settings?.logoWhite?.asset
    ? urlFor(settings.logoWhite).width(400).height(150).fit('clip').url()
    : null;

  // If CMS has logos, use them
  if (cmsLogoLight || cmsLogoDark) {
    return (
      <>
        {cmsLogoDark ? (
          <img
            src={cmsLogoDark}
            alt={settings?.companyName || 'Academia El Profe'}
            className={`${className} hidden dark:block object-contain`}
          />
        ) : null}
        {cmsLogoLight ? (
          <img
            src={cmsLogoLight}
            alt={settings?.companyName || 'Academia El Profe'}
            className={`${className} ${cmsLogoDark ? 'block dark:hidden' : 'block'} object-contain`}
          />
        ) : null}
      </>
    );
  }

  // Static fallback
  return (
    <>
      <Image
        src="/images/logo-academia.webp"
        alt="Academia El Profe"
        width={1624}
        height={609}
        className={`${className} hidden dark:block`}
        priority
        unoptimized
      />
      <Image
        src="/images/logo-academia-dark.webp"
        alt="Academia El Profe"
        width={1624}
        height={609}
        className={`${className} block dark:hidden`}
        priority
        unoptimized
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function LandingHeader() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for header effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const isLoggedIn = !!user && !loading;

  // Determinar qué nav mostrar en el drawer
  const currentNav = isLoggedIn ? DASHBOARD_NAV : LANDING_NAV;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  useEffect(() => { setMenuAbierto(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAbierto]);


  return (
    <>
      {/* ============================================================ */}
      {/* NAVBAR SUPERIOR FIJA                                          */}
      {/* ============================================================ */}
      <header className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-primary/95 dark:bg-[var(--surface-0)]/95 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-brand-primary/20 dark:border-[var(--surface-border)]'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">

          {/* ====== LAYOUT PC ====== */}
          <div className="hidden lg:flex items-center justify-between h-full">
            {/* Logo */}
            <Link href={isLoggedIn ? '/dashboard/cursos' : '/'} className="flex items-center shrink-0">
              <Logo className="h-12 w-auto object-contain" />
            </Link>

            {/* Centro: Nav landing (solo visitante) */}
            {!isLoggedIn && (
              <nav className="flex items-center gap-1">
                {LANDING_NAV.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.href)
                        ? scrolled
                          ? 'text-brand-primary bg-white/90 dark:text-white dark:bg-white/20'
                          : 'text-white bg-white/15'
                        : scrolled
                          ? 'text-white/90 hover:text-white hover:bg-white/10 dark:text-slate-300 dark:hover:text-white'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.etiqueta}
                  </Link>
                ))}
              </nav>
            )}

            {/* Logueado: centro vacío (inmersivo) — espacio para que el
                header se vea limpio, solo logo + perfil */}
            {isLoggedIn && <div />}

            {/* Derecha */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* PWA Install Button */}
              <PwaInstallButton />

              {/* Badge plataforma (solo visitante) */}
              {!isLoggedIn && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5">
                  <Monitor className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:inline">
                    Escritorio
                  </span>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                  <Smartphone className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:inline">
                    Android / iOS
                  </span>
                </div>
              )}

              {/* Logueado: Lupa + Perfil + Cerrar sesión */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {/* Lupa */}
                  <Link
                    href="/dashboard/cursos"
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-heading-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Buscar cursos"
                  >
                    <Search className="h-4 w-4" />
                  </Link>

                  {/* Separador */}
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

                  {/* Avatar + nombre */}
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-1.5">
                    <div className="h-7 w-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                      {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-brand-heading-secondary max-w-[120px] truncate">
                      {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                    </span>
                  </div>

                  {/* Cerrar sesión */}
                  <button
                    onClick={signOut}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link href="/iniciar-sesion">
                  <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white h-9 text-sm font-semibold gap-2 rounded-lg">
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* ====== LAYOUT MÓVIL ====== */}
          <div className="flex lg:hidden items-center justify-between h-full">
            {/* Hamburguesa */}
            <button
              onClick={() => setMenuAbierto(true)}
              className={`h-10 w-10 flex items-center justify-center rounded-lg transition-colors -ml-1 ${scrolled ? 'text-brand-body dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/10' : 'text-white hover:bg-white/10'}`}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href={isLoggedIn ? '/dashboard/cursos' : '/'} className="flex items-center shrink-0">
              <Logo className="h-9 w-auto object-contain" />
            </Link>

            {/* Derecha */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1">
                {/* Lupa */}
                <Link
                  href="/dashboard/cursos"
                  className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors ${scrolled ? 'text-slate-400' : 'text-white/90 hover:text-white'}`}
                >
                  <Search className="h-4 w-4" />
                </Link>
                {/* Avatar mini */}
                <Link href="/dashboard/cursos" className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-bold">
                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className={`text-xs font-medium max-w-[80px] truncate ${scrolled ? 'text-brand-heading-secondary' : 'text-white/90'}`}>
                    {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </Link>
              </div>
            ) : (
              <Link href="/iniciar-sesion" onClick={() => setMenuAbierto(false)}>
                <Button className={`h-8 text-xs font-semibold gap-1.5 px-3 rounded-lg transition-all ${scrolled ? 'bg-brand-primary hover:bg-brand-primary-hover text-white' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'}`}>
                  <LogIn className="h-3.5 w-3.5" />
                  Iniciar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacer — always match header height (h-16 = 64px) */}
      <div className="h-16 shrink-0" />

      {/* ============================================================ */}
      {/* MENÚ MÓVIL — Framer Motion                                    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuAbierto(false)}
            />

            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 bottom-0 z-[9999] w-[85%] max-w-[360px] bg-white dark:bg-[var(--surface-1)] shadow-2xl lg:hidden flex flex-col"
              style={{
                transformOrigin: 'left center',
                borderTopRightRadius: '24px',
                borderBottomRightRadius: '24px',
              }}
            >
              {/* Cabecera */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <Logo className="h-9 w-auto object-contain" />
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-heading dark:hover:text-white transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Theme Toggle — dentro del menú móvil */}
              <div className="px-4 pt-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Apariencia</span>
                <ThemeToggle />
              </div>

              {/* Links — usa currentNav (landing o dashboard) */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {currentNav.map((link, i) => {
                  const Icon = 'icon' in link ? (link.icon as React.ComponentType<{ className?: string }>) : null;
                  return (
                    <motion.div
                      key={link.href}
                      custom={i}
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuAbierto(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                          isActive(link.href)
                            ? 'text-brand-primary-text bg-brand-primary-bg-light'
                            : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {link.etiqueta}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Pie — Cerrar sesión (solo logueado) o Plataforma (visitante) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="px-4 pb-6"
              >
                {isLoggedIn ? (
                  <button
                    onClick={() => { signOut(); setMenuAbierto(false); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="h-4 w-4 text-brand-primary" />
                      <span className="text-xs text-brand-body dark:text-slate-300">Escritorio</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-brand-primary" />
                      <span className="text-xs text-brand-body dark:text-slate-300">Android / iOS</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </>
  );
}