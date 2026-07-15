'use client';

// ============================================================
// Shell Anti-Piratería — Academia El Profe Oficial
// 1. Banner de advertencia: SOLO UNA VEZ por sesión (sessionStorage)
// 2. Clic derecho, selección y arrastre deshabilitados globalmente
//
// NOTA: La protección anti-grabación de pantalla se maneja
// de forma condicional mediante el hook useRecordingDetection,
// que SOLO activa el overlay negro sobre videos cuando
// detecta una grabación activa vía getDisplayMedia.
// Ya NO se usa el blackout agresivo por visibility/blur
// porque eso bloqueaba la reproducción normal de videos.
// ============================================================

import { useEffect, useCallback, useState } from 'react';

const STORAGE_KEY = 'aep_welcome_shown';

export function AntiPiracyShell() {
  const [showWelcome, setShowWelcome] = useState(false);

  /* -------------------------------------------------------------- */
  /*  1. Banner de bienvenida — SOLO UNA VEZ por sesión          */
  /*  NOTA: sessionStorage lanza SecurityError en iOS Safari */
  /*  modo privado. Todo acceso va envuelto en try/catch.      */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = !!sessionStorage.getItem(STORAGE_KEY);
    } catch {
      // iOS Safari Private Mode: sessionStorage no disponible
      // Mostramos el banner igualmente, pero no persistimos
    }
    if (!alreadyShown) {
      // Esperar a que la página cargue para mostrar el banner
      const timer = setTimeout(() => {
        setShowWelcome(true);
        try {
          sessionStorage.setItem(STORAGE_KEY, 'true');
        } catch {
          // Ignorar error de almacenamiento en iOS
        }
        // Auto-ocultar después de 4 segundos
        setTimeout(() => setShowWelcome(false), 4000);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  /* -------------------------------------------------------------- */
  /*  2. Clic derecho, selección y arrastre deshabilitados            */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const blockCtx = (e: MouseEvent) => e.preventDefault();
    const blockSel = (e: Event) => e.preventDefault();
    const blockDrag = (e: DragEvent) => e.preventDefault();

    document.addEventListener('contextmenu', blockCtx);
    document.addEventListener('selectstart', blockSel);
    document.addEventListener('dragstart', blockDrag);

    return () => {
      document.removeEventListener('contextmenu', blockCtx);
      document.removeEventListener('selectstart', blockSel);
      document.removeEventListener('dragstart', blockDrag);
    };
  }, []);

  /* -------------------------------------------------------------- */
  /*  Render                                                         */
  /* -------------------------------------------------------------- */
  return (
    <>
      {/* Banner de bienvenida — solo una vez */}
      {showWelcome && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeWelcome}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center animate-in fade-in-0 zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icono */}
            <div className="mx-auto mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary-bg-light">
              <svg className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            {/* Título */}
            <h3 className="text-lg font-bold text-brand-heading mb-2">
              Contenido Protegido
            </h3>
            {/* Mensaje */}
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              El contenido de esta plataforma está protegido por derechos de autor. 
              No está permitido copiar, descargar ni capturar el material.
            </p>
            {/* Botón cerrar */}
            <button
              onClick={closeWelcome}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}