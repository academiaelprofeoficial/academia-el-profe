'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, ExternalLink, Zap } from 'lucide-react';

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detectar si estamos dentro de la app instalada (standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar si ya está instalada via localStorage o appinstalled event
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
    }
  }, [deferredPrompt]);

  const handleOpenApp = useCallback(() => {
    window.location.href = '/';
  }, []);

  // Si estamos dentro de la app (standalone), no mostrar nada
  if (isStandalone || dismissed) return null;

  const goldBase = '#D4A017';
  const goldLight = '#F0C75E';

  return (
    <>
      {/* Botón escritorio — dorado siempre */}
      <button
        onClick={isInstalled ? handleOpenApp : handleInstall}
        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 group"
        style={{
          background: `linear-gradient(135deg, ${goldBase}, ${goldLight})`,
          color: '#0A192F',
          border: `1px solid ${goldLight}`,
          boxShadow: `0 2px 10px ${goldBase}60`,
        }}
        onMouseEnter={(e) => {
          const g = document.getElementById('gold-bg');
          if (g) g.style.opacity = '0';
          e.currentTarget.style.boxShadow = `0 0 25px ${goldLight}99, 0 0 50px ${goldLight}40`;
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 2px 10px ${goldBase}60`;
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={isInstalled ? 'Abrir App' : 'Instalar App'}
      >
        {isInstalled ? (
          <ExternalLink className="h-3.5 w-3.5" />
        ) : (
          <Download className="h-3.5 w-3.5 group-hover:animate-bounce" />
        )}
        <span>{isInstalled ? 'Abrir App' : 'Instalar App'}</span>
        <span className="text-sm group-hover:scale-125 transition-transform">⚡</span>
      </button>

      {/* Botón móvil flotante */}
      <div className="sm:hidden fixed bottom-20 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
        <button
          onClick={isInstalled ? handleOpenApp : handleInstall}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-xl transition-all pointer-events-auto"
          style={{
            background: `linear-gradient(135deg, ${goldBase}, ${goldLight})`,
            color: '#0A192F',
            border: `1px solid ${goldLight}`,
            boxShadow: `0 4px 15px ${goldBase}60`,
          }}
          title={isInstalled ? 'Abrir App' : 'Instalar App'}
        >
          {isInstalled ? (
            <ExternalLink className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isInstalled ? 'Abrir App' : 'Instalar App'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 w-9 h-9 rounded-full flex items-center justify-center shrink-0 pointer-events-auto"
          style={{ background: `${goldBase}20`, color: goldBase }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </>
  );
}
