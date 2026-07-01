'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    // Detectar si ya está instalada (display-mode: standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Escuchar appinstalled
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

  if (isInstalled) return null;

  return (
    <>
      {/* Botón escritorio */}
      <button
        onClick={handleInstall}
        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-lg hover:shadow-brand-primary/30 hover:border-[#FFD700] transition-all duration-300"
        title="Instalar App"
      >
        <Download className="h-3.5 w-3.5" />
        Instalar App
      </button>

      {/* Botón móvil flotante */}
      {deferredPrompt && (
        <button
          onClick={handleInstall}
          className="sm:hidden fixed bottom-20 right-4 z-[9999] w-12 h-12 rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/40 flex items-center justify-center hover:bg-brand-primary-hover active:scale-95 transition-all"
          title="Instalar App"
        >
          <Download className="h-5 w-5" />
        </button>
      )}

      {/* Banner iOS */}
      {isIOS && !isInstalled && (
        <div className="sm:hidden fixed bottom-20 left-4 right-4 z-[9999] bg-card border border-border/40 rounded-xl p-3 shadow-xl text-xs text-center">
          <p className="text-foreground font-medium mb-1">Instala esta app</p>
          <p className="text-muted-foreground">
            Toca <span className="inline-block px-1.5 py-0.5 rounded bg-muted font-bold text-[10px]">Compartir</span> →{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-muted font-bold text-[10px]">Agregar a Inicio</span>
          </p>
        </div>
      )}
    </>
  );
}
