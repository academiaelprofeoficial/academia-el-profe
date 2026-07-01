'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, ExternalLink, Sun, Moon, MessageCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

export function MobileBottomBar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    if (standalone) {
      setIsInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert('Para instalar la app, usa la opción "Agregar a la pantalla de inicio" de tu navegador.');
    }
  }, [deferredPrompt]);

  const handleOpenApp = useCallback(() => {
    window.location.href = '/';
  }, []);

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const whatsappNumber = '51999999999';
  const whatsappMsg = 'Hola, quiero información sobre los cursos.';
  const goldBase = '#D4A017';
  const goldLight = '#F0C75E';

  // Si standalone, solo mostrar WhatsApp y Theme (sin boton App)
  const showInstall = !isStandalone && !isInstalled;
  const showOpenApp = !isStandalone && isInstalled;

  return (
    <>
      {/* Mini botón toggle para ocultar/mostrar la barra */}
      <button
        onClick={() => setHidden(!hidden)}
        className="sm:hidden fixed bottom-0 right-2 z-[9998] w-6 h-5 rounded-t-md flex items-center justify-center transition-all"
        style={{
          background: '#D4A017',
          color: '#0A192F',
          opacity: 0.7,
          transform: hidden ? 'translateY(0)' : 'translateY(-56px)',
        }}
        aria-label={hidden ? 'Mostrar barra' : 'Ocultar barra'}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={hidden ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
        </svg>
      </button>

      <div className={`sm:hidden fixed bottom-0 left-0 right-0 z-[9997] border-t bg-white/95 dark:bg-[#0A192F]/95 backdrop-blur-xl transition-transform duration-300 ${hidden ? 'translate-y-full' : 'translate-y-0'}`}
        style={{ borderColor: '#D4A01740' }}>
      <div className="flex items-center justify-around h-14 px-2">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
          <MessageCircle className="h-5 w-5" style={{ color: '#25D366' }} />
          <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">WhatsApp</span>
        </a>

        {/* Install / Open App — solo si NO estamos en standalone */}
        {(showInstall || showOpenApp) && (
          <button
            onClick={isInstalled ? handleOpenApp : handleInstall}
            className="flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-lg transition-all"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ background: `linear-gradient(135deg, ${goldBase}, ${goldLight})` }}>
              {isInstalled ? (
                <ExternalLink className="h-3.5 w-3.5" style={{ color: '#0A192F' }} />
              ) : (
                <Download className="h-3.5 w-3.5" style={{ color: '#0A192F' }} />
              )}
            </div>
            <span className="text-[9px] font-medium" style={{ color: goldBase }}>
              {isInstalled ? 'Abrir' : 'App'}
            </span>
          </button>
        )}

        {/* Tema claro/oscuro */}
        {montado && (
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
              {resolvedTheme === 'dark' ? 'Claro' : 'Oscuro'}
            </span>
          </button>
        )}
      </div>
    </div>
    </>
  );
}
