'use client';

// ============================================================
// Shell Anti-Piratería — Academia El Profe Oficial
// 1. Banner de advertencia: SOLO UNA VEZ por sesión (sessionStorage)
// 2. Anti-grabación de pantalla: pantalla negra al detectar blur
//    (estilo Netflix) — se restaura al volver al sitio
// 3. Clic derecho, selección y arrastre deshabilitados globalmente
// ============================================================

import { useEffect, useCallback, useState } from 'react';

const STORAGE_KEY = 'aep_welcome_shown';

export function AntiPiracyShell() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isBlackedOut, setIsBlackedOut] = useState(false);

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
  /*  2. Anti-grabación de pantalla — Pantalla negra estilo Netflix */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    let blurTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // El usuario salió de la pestaña — posible grabación de pantalla
        // Activar pantalla negra después de un breve delay
        blurTimeout = setTimeout(() => {
          setIsBlackedOut(true);
        }, 200);
      } else {
        // El usuario volvió — restaurar la vista
        if (blurTimeout) {
          clearTimeout(blurTimeout);
          blurTimeout = null;
        }
        // Restaurar después de un momento para dar efecto
        setTimeout(() => {
          setIsBlackedOut(false);
        }, 100);
      }
    };

    const handleBlur = () => {
      // Detectar cuando la ventana pierde foco (cambio de app, grabadora)
      blurTimeout = setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          setIsBlackedOut(true);
        }
      }, 300);
    };

    const handleFocus = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
      setTimeout(() => {
        setIsBlackedOut(false);
      }, 100);
    };

    // Deshabilitar tecla Print Screen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Poner negro brevemente para arruinar la captura
        setIsBlackedOut(true);
        setTimeout(() => setIsBlackedOut(false), 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, []);

  /* -------------------------------------------------------------- */
  /*  3. Clic derecho, selección y arrastre deshabilitados            */
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

      {/* Overlay negro anti-grabación — pantalla negra estilo Netflix */}
      {isBlackedOut && (
        <div
          className="fixed inset-0 z-[100000] bg-black"
          aria-hidden="true"
        />
      )}
    </>
  );
}