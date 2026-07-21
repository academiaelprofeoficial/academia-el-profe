'use client';

// ============================================================
// Landing Header — UNIFIED
// Nav principal [Inicio, Cursos, Nosotros, Soporte] SIEMPRE visible.
// Derecha: Invitado → "Iniciar sesión" | Autenticado → User dropdown
// Logo → siempre a /
// Mobile drawer: nav principal + "Mi Panel" extra si logueado
// ============================================================

import { useState, useEffect, useRef } from 'react';
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
  UserCircle,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { urlFor } from '@/lib/sanity.client';
import { PwaInstallButton } from '@/components/PwaInstallButton';

// ---- Nav links principales (SIEMPRE visibles) ----
const MAIN_NAV = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Cursos', href: '/cursos' },
  { etiqueta: 'Nosotros', href: '/nosotros' },
  { etiqueta: 'Soporte', href: '/soporte' },
] as const;

// ---- Nav links del panel de usuario (solo logueado, en drawer) ----
const DASHBOARD_NAV = [
  { etiqueta: 'Mi perfil', href: '/perfil', icon: UserCircle },
  { etiqueta: 'Mis cursos', href: '/dashboard/cursos', icon: BookOpen },
  { etiqueta: 'Mis certificados', href: '/dashboard/certificados', icon: Award },
  { etiqueta: 'Lista de deseos', href: '/dashboard/deseos', icon: Heart },
  { etiqueta: 'Historial de clases', href: '/dashboard/historial', icon: Clock },
] as const;

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
/*  User Dropdown (desktop)                                            */
/* ------------------------------------------------------------------ */

function UserDropdown({ user, signOut, profileName, profilePhoto }: { user: any; signOut: () => void; profileName: string | null; profilePhoto: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = profileName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const initials = displayName[0].toUpperCase();
  const photoSrc = profilePhoto || user?.photoURL || null;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 pl-1.5 pr-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden ${photoSrc ? '' : 'bg-brand-primary'}`}>
          {photoSrc && <img src={photoSrc} alt={displayName} className="h-full w-full object-cover" />}
          {!photoSrc && initials}
        </div>
        <span className="text-sm font-medium text-brand-heading-secondary max-w-[120px] truncate hidden md:inline">
          {displayName}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[var(--surface-2)] rounded-xl shadow-xl border border-slate-200 dark:border-[var(--surface-border)] overflow-hidden z-[10001]"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-semibold text-brand-heading truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>

            {/* Links */}
            <div className="py-1">
              {[
                { icon: UserCircle, label: 'Mi perfil', href: '/perfil' },
                { icon: BookOpen, label: 'Mis cursos', href: '/dashboard/cursos' },
                { icon: Award, label: 'Mis certificados', href: '/dashboard/certificados' },
                { icon: Heart, label: 'Lista de deseos', href: '/dashboard/deseos' },
                { icon: Clock, label: 'Historial de clases', href: '/dashboard/historial' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <item.icon className="h-4 w-4 text-slate-400" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-slate-100 dark:border-slate-700/50 py-1">
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const { user, signOut, loading, profileName, profilePhoto } = useAuth();

  const isLoggedIn = !!user && !loading;

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
      {/* NAVBAR SUPERIOR FIJA — UNIFICADA                              */}
      {/* ============================================================ */}
      <header className={`fixed top-0 inset-x-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-500 ${
        scrolled
          ? 'bg-brand-primary/95 dark:bg-[var(--surface-0)]/95 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-brand-primary/20 dark:border-[var(--surface-border)]'
          : 'bg-white/80 dark:bg-transparent border-b border-slate-200/60 dark:border-transparent backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">

          {/* ====== LAYOUT PC ====== */}
          <div className="hidden lg:flex items-center justify-between h-full">
            {/* Logo — siempre a / */}
            <Link href="/" className="flex items-center shrink-0">
              <Logo className="h-12 w-auto object-contain" />
            </Link>

            {/* Centro: Nav SIEMPRE visible (invitado + autenticado) */}
            <nav className="flex items-center gap-1">
              {MAIN_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? scrolled
                        ? 'text-brand-primary bg-white/90 dark:text-white dark:bg-white/20'
                        : 'text-brand-primary bg-brand-primary-bg-light'
                      : scrolled
                        ? 'text-white/90 hover:text-white hover:bg-white/10 dark:text-slate-300 dark:hover:text-white'
                        : 'text-slate-700 hover:text-brand-primary hover:bg-slate-50 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10'
                  }`}
                >
                  {link.etiqueta}
                </Link>
              ))}
            </nav>

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

              {/* Autenticado: User Dropdown */}
              {isLoggedIn ? (
                <UserDropdown user={user} signOut={signOut} profileName={profileName} profilePhoto={profilePhoto} />
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
              className={`h-10 w-10 flex items-center justify-center rounded-lg transition-colors -ml-1 ${scrolled ? 'text-brand-body dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/10' : 'text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo — siempre a / */}
            <Link href="/" className="flex items-center shrink-0">
              <Logo className="h-9 w-auto object-contain" />
            </Link>

            {/* Derecha: Avatar mini si logueado, botón login si no */}
            {isLoggedIn ? (() => {
              const mobileName = profileName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';
              const mobilePhoto = profilePhoto || user?.photoURL || null;
              return (
                <Link href="/dashboard/cursos" className="flex items-center gap-1.5">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold overflow-hidden ${mobilePhoto ? '' : 'bg-brand-primary'}`}>
                    {mobilePhoto && <img src={mobilePhoto} alt={mobileName} className="h-full w-full object-cover" />}
                    {!mobilePhoto && mobileName[0].toUpperCase()}
                  </div>
                  <span className={`text-xs font-medium max-w-[80px] truncate ${scrolled ? 'text-brand-heading-secondary' : 'text-slate-800 dark:text-white/90'}`}>
                    {mobileName}
                  </span>
                </Link>
              );
            })() : (
              <Link href="/iniciar-sesion" onClick={() => setMenuAbierto(false)}>
                <Button className={`h-8 text-xs font-semibold gap-1.5 px-3 rounded-lg transition-all bg-brand-primary hover:bg-brand-primary-hover text-white`}>
                  <LogIn className="h-3.5 w-3.5" />
                  Iniciar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacer — always match header height (h-16 = 64px) + safe area */}
      <div className="shrink-0 h-[calc(4rem+env(safe-area-inset-top))]" />

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
              className="fixed top-0 left-0 bottom-0 z-[9999] w-[85%] max-w-[360px] bg-white dark:bg-[var(--surface-1)] shadow-2xl lg:hidden flex flex-col pt-[env(safe-area-inset-top)]"
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

              {/* Main nav links — SIEMPRE visibles */}
              <nav className="px-4 pt-4 space-y-1">
                {MAIN_NAV.map((link, i) => {
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
                        {link.etiqueta}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Dashboard nav — SOLO si está logueado */}
              {isLoggedIn && (
                <div className="px-4 pt-3">
                  <p className="px-4 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mi Panel</p>
                  <nav className="space-y-1">
                    {DASHBOARD_NAV.map((link, i) => {
                      const Icon = link.icon;
                      return (
                        <motion.div
                          key={link.href}
                          custom={i + MAIN_NAV.length}
                          variants={menuItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Link
                            href={link.href}
                            onClick={() => setMenuAbierto(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                              isActive(link.href)
                                ? 'text-brand-primary-text bg-brand-primary-bg-light'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                            {link.etiqueta}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Pie */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-auto px-4 pb-6"
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
                  <Link
                    href="/iniciar-sesion"
                    onClick={() => setMenuAbierto(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </>
  );
}