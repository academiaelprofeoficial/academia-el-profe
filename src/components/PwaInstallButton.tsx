'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, X } from 'lucide-react';

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    if (window.matchMedia('(display-mode: standalone)').matches) {
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
    }
  }, [deferredPrompt]);

  if (isInstalled || dismissed) return null;

  // Colores dorados
  const goldBase = '#D4A017';
  const goldLight = '#F0C75E';
  const goldDark = '#B8860B';

  return (
    <>
      {/* Botón escritorio — siempre visible */}
      <button
        onClick={handleInstall}
        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300"
        style={{
          border: `2px solid ${goldBase}`,
          color: goldBase,
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `linear-gradient(135deg, ${goldBase}, ${goldLight})`;
          e.currentTarget.style.color = '#0A192F';
          e.currentTarget.style.boxShadow = `0 0 20px ${goldLight}80`;
          e.currentTarget.style.borderColor = goldLight;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = goldBase;
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = goldBase;
        }}
        title="Instalar App"
      >
        <Download className="h-3.5 w-3.5" />
        Instalar App
      </button>

      {/* Botón móvil flotante — siempre visible si hay prompt o no */}
      <div className="sm:hidden fixed bottom-20 left-0 right-0 z-[9999] flex justify-center px-4">
        <button
          onClick={handleInstall}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-xl transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${goldBase}, ${goldLight})`,
            color: '#0A192F',
            border: `1px solid ${goldLight}`,
            boxShadow: `0 4px 15px ${goldBase}60`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${goldDark}, ${goldBase})`;
            e.currentTarget.style.boxShadow = `0 4px 25px ${goldLight}99`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${goldBase}, ${goldLight})`;
            e.currentTarget.style.boxShadow = `0 4px 15px ${goldBase}60`;
          }}
          title="Instalar App"
        >
          <Download className="h-4 w-4" />
          Instalar App
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${goldBase}20`, color: goldBase }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Banner iOS */}
      {isIOS && (
        <div className="sm:hidden fixed bottom-20 left-4 right-4 z-[9999] rounded-xl p-3 shadow-xl text-xs text-center"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: `1px solid ${goldLight}40`,
            color: '#fff',
          }}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="font-medium mb-1" style={{ color: goldLight }}>Instala esta app</p>
              <p className="opacity-70">
                Toca <span className="inline-block px-1.5 py-0.5 rounded font-bold text-[10px]" style={{ background: `${goldLight}30` }}>Compartir</span> →{' '}
                <span className="inline-block px-1.5 py-0.5 rounded font-bold text-[10px]" style={{ background: `${goldLight}30` }}>Agregar a Inicio</span>
              </p>
            </div>
            <button onClick={() => setDismissed(true)} className="opacity-50 hover:opacity-100 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
