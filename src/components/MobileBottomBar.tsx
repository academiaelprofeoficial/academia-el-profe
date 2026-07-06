'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, ExternalLink, Sun, Moon, Home, BookOpen, Award, Heart, Clock, Headset } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                   */
/* ------------------------------------------------------------------ */

const TABS_VISITOR = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Cursos', href: '/cursos', icon: BookOpen },
] as const;

const TABS_LOGGED = [
  { label: 'Cursos', href: '/dashboard/cursos', icon: BookOpen },
  { label: 'Diplomas', href: '/dashboard/certificados', icon: Award },
  { label: 'Deseos', href: '/dashboard/deseos', icon: Heart },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
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

  // PWA detection
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
      // Fallback: show instructions
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

  const tabs = isLoggedIn ? TABS_LOGGED : TABS_VISITOR;
  const whatsappNumber = '51922737951';
  const whatsappMsg = 'Hola, quiero información sobre los cursos de Academia El Profe.';

  // Don't show on auth pages
  if (pathname.startsWith('/iniciar-sesion') || pathname.startsWith('/registrarse')) return null;

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8, delay: 0.3 }}
        className="sm:hidden fixed bottom-0 inset-x-0 z-[9997] px-3 pb-[env(safe-area-inset-bottom,8px)] pt-1.5"
      >
        <div
          className="relative flex items-center justify-around gap-1 h-[62px] rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden"
          style={{
            background: resolvedTheme === 'dark'
              ? 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(15,23,42,0.85))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.85))',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: resolvedTheme === 'dark'
              ? '0 -4px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 -4px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* Subtle top highlight line */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[1px]"
            style={{
              background: resolvedTheme === 'dark'
                ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)',
            }}
          />

          {/* Nav tabs */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 transition-all duration-200"
              >
                {/* Active indicator dot */}
                <div className="h-5 flex items-center justify-center">
                  <Icon
                    className="h-[20px] w-[20px] transition-all duration-200"
                    style={{
                      color: active
                        ? (resolvedTheme === 'dark' ? '#34D399' : '#059669')
                        : (resolvedTheme === 'dark' ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.6)'),
                      strokeWidth: active ? 2.2 : 1.8,
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide transition-all duration-200"
                  style={{
                    color: active
                      ? (resolvedTheme === 'dark' ? '#34D399' : '#059669')
                      : (resolvedTheme === 'dark' ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.5)'),
                  }}
                >
                  {tab.label}
                </span>
                {/* Active underline */}
                {active && (
                  <motion.div
                    layoutId="bottombar-active"
                    className="absolute -top-0.5 left-[20%] right-[20%] h-[2.5px] rounded-full"
                    style={{ background: resolvedTheme === 'dark' ? '#34D399' : '#059669' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div
            className="w-[1px] h-8 my-auto rounded-full"
            style={{ background: resolvedTheme === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.08)' }}
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
              style={{ color: resolvedTheme === 'dark' ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.5)' }}
            >
              Chat
            </span>
          </a>

          {/* Install / Open App */}
          {(showInstall || showOpenApp) && (
            <>
              <div
                className="w-[1px] h-8 my-auto rounded-full"
                style={{ background: resolvedTheme === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.08)' }}
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
          {mounted && (
            <>
              <div
                className="w-[1px] h-8 my-auto rounded-full"
                style={{ background: resolvedTheme === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.08)' }}
              />
              <button
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1.5 transition-transform active:scale-90"
              >
                <div className="h-5 flex items-center justify-center">
                  {resolvedTheme === 'dark' ? (
                    <Sun className="h-[20px] w-[20px]" style={{ color: '#FBBF24' }} />
                  ) : (
                    <Moon className="h-[20px] w-[20px]" style={{ color: 'rgba(100,116,139,0.6)' }} />
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: resolvedTheme === 'dark' ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.5)' }}
                >
                  {resolvedTheme === 'dark' ? 'Claro' : 'Oscuro'}
                </span>
              </button>
            </>
          )}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}