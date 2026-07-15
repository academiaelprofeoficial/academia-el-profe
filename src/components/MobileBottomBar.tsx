'use client';

// ============================================================
// Mobile Bottom Bar — UNIFIED
// Tabs: Inicio, Cursos (siempre) + Mis Cursos (solo auth) + Chat + App + Tema
// "Cursos" SIEMPRE va a /cursos (nunca a /dashboard/cursos)
// "Mis Cursos" solo visible si está autenticado
// CORREGIDO: Respeto total del tema dark/light — no renderiza hasta
// que next-themes haya resuelto el tema (evita flash de tema incorrecto).
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { Download, ExternalLink, Sun, Moon, Home, BookOpen, BookOpenCheck } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const MAIN_TABS = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Cursos', href: '/cursos', icon: BookOpen },
] as const;

const AUTH_TABS = [
  { label: 'Mis Cursos', href: '/dashboard/cursos', icon: BookOpenCheck },
] as const;

/* ------------------------------------------------------------------ */
/*  Theme-aware style constants                                         */
/* ------------------------------------------------------------------ */

function useBarStyles(theme: 'dark' | 'light') {
  const isDark = theme === 'dark';

  return {
    // Bar container
    containerBg: isDark
      ? 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.88))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))',
    containerBorder: isDark
      ? 'rgba(148,163,184,0.12)'
      : 'rgba(0,0,0,0.06)',
    containerShadow: isDark
      ? '0 -4px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.08), inset 0 1px 0 rgba(148,163,184,0.06)'
      : '0 -4px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',

    // Highlight line
    highlightGradient: isDark
      ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)',

    // Tab colors
    activeColor: isDark ? '#34D399' : '#059669',
    inactiveIcon: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.6)',
    inactiveLabel: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.5)',
    separator: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.06)',

    // Theme toggle specific
    sunColor: '#FBBF24',
    moonColor: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.6)',
    themeLabel: isDark ? 'Claro' : 'Oscuro',
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MobileBottomBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isLoggedIn = !!user;

  // PWA + theme detection
  useEffect(() => {
    setMounted(true);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    if (standalone) { setIsInstalled(true); return; }
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') { setIsInstalled(true); setDeferredPrompt(null); }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Para instalar: toca el botón de compartir (cuadrado con flecha) y selecciona "Agregar a pantalla de inicio".');
      } else {
        alert('Para instalar la app, usa la opción "Agregar a pantalla de inicio" del menú de tu navegador.');
      }
    }
  }, [deferredPrompt]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const showInstall = !isStandalone && !isInstalled;
  const showOpenApp = !isStandalone && isInstalled;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const whatsappNumber = '51922737951';
  const whatsappMsg = 'Hola, quiero información sobre los cursos de Academia El Profe.';

  // Don't show on auth pages or admin routes
  if (pathname.startsWith('/iniciar-sesion') || pathname.startsWith('/registrarse') || pathname.startsWith('/admin')) return null;

  // CRITICAL: Don't render until theme is resolved to avoid flash of wrong theme
  if (!mounted || !resolvedTheme) return null;

  const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const styles = useBarStyles(theme);

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8, delay: 0.3 }}
        className="fixed bottom-0 inset-x-0 z-[9997] px-3 pb-[env(safe-area-inset-bottom,8px)] pt-1.5 lg:hidden"
      >
        <div
          className="relative flex items-center justify-around gap-1 h-[62px] rounded-2xl overflow-hidden"
          style={{
            background: styles.containerBg,
            border: `1px solid ${styles.containerBorder}`,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: styles.containerShadow,
          }}
        >
          {/* Subtle top highlight line */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[1px]"
            style={{ background: styles.highlightGradient }}
          />

          {/* Main tabs — SIEMPRE visibles */}
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 transition-all duration-200"
              >
                <div className="h-5 flex items-center justify-center">
                  <Icon
                    className="h-[20px] w-[20px] transition-all duration-200"
                    style={{
                      color: active ? styles.activeColor : styles.inactiveIcon,
                      strokeWidth: active ? 2.2 : 1.8,
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide transition-all duration-200"
                  style={{ color: active ? styles.activeColor : styles.inactiveLabel }}
                >
                  {tab.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottombar-active"
                    className="absolute -top-0.5 left-[20%] right-[20%] h-[2.5px] rounded-full"
                    style={{ background: styles.activeColor }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
              </Link>
            );
          })}

          {/* "Mis Cursos" — SOLO si está autenticado */}
          {isLoggedIn && (
            <>
              <div
                className="w-[1px] h-8 my-auto rounded-full"
                style={{ background: styles.separator }}
              />
              {AUTH_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 transition-all duration-200"
                  >
                    <div className="h-5 flex items-center justify-center">
                      <Icon
                        className="h-[20px] w-[20px] transition-all duration-200"
                        style={{
                          color: active ? styles.activeColor : styles.inactiveIcon,
                          strokeWidth: active ? 2.2 : 1.8,
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-semibold tracking-wide transition-all duration-200"
                      style={{ color: active ? styles.activeColor : styles.inactiveLabel }}
                    >
                      {tab.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="bottombar-active"
                        className="absolute -top-0.5 left-[20%] right-[20%] h-[2.5px] rounded-full"
                        style={{ background: styles.activeColor }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                      />
                    )}
                  </Link>
                );
              })}
            </>
          )}

          {/* Separator */}
          <div
            className="w-[1px] h-8 my-auto rounded-full"
            style={{ background: styles.separator }}
          />

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1.5 transition-transform active:scale-90"
          >
            <div className="h-5 flex items-center justify-center">
              <WhatsAppIcon size={21} />
            </div>
            <span
              className="text-[10px] font-semibold tracking-wide"
              style={{ color: styles.inactiveLabel }}
            >
              Chat
            </span>
          </a>

          {/* Install / Open App */}
          {(showInstall || showOpenApp) && (
            <>
              <div
                className="w-[1px] h-8 my-auto rounded-full"
                style={{ background: styles.separator }}
              />
              <button
                onClick={isInstalled ? () => { window.location.href = '/'; } : handleInstall}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1.5 transition-transform active:scale-90"
              >
                <div
                  className="h-[21px] w-[21px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #D4A017, #F0C75E)',
                    boxShadow: '0 2px 8px rgba(212,160,23,0.35)',
                  }}
                >
                  {isInstalled ? (
                    <ExternalLink className="h-3 w-3" style={{ color: '#0A192F' }} />
                  ) : (
                    <Download className="h-3 w-3" style={{ color: '#0A192F' }} />
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: '#D4A017' }}
                >
                  {isInstalled ? 'Abrir' : 'App'}
                </span>
              </button>
            </>
          )}

          {/* Theme toggle */}
          <>
            <div
              className="w-[1px] h-8 my-auto rounded-full"
              style={{ background: styles.separator }}
            />
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1.5 transition-transform active:scale-90"
            >
              <div className="h-5 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Sun className="h-[20px] w-[20px]" style={{ color: styles.sunColor }} />
                ) : (
                  <Moon className="h-[20px] w-[20px]" style={{ color: styles.moonColor }} />
                )}
              </div>
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: styles.inactiveLabel }}
              >
                {styles.themeLabel}
              </span>
            </button>
          </>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}