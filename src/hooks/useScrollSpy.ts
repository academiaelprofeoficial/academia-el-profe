'use client';

// ============================================================
// useScrollSpy — Hook reutilizable de Deep Linking + Scroll Spy
//
// - IntersectionObserver detecta la sección visible
// - History API actualiza la URL SIN recargar la página
// - Soporta hash navigation al cargar (compartir enlaces)
// - Escalable: agregar sección = agregar un string al array
//
// Uso:
//   const { activeId, scrollTo } = useScrollSpy(['hero', 'cursos', 'faq']);
//   // activeId → 'hero' | 'cursos' | 'faq' | null
//   // scrollTo('cursos') → smooth scroll + URL update
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollSpyOptions {
  /** Offset superior (px) para considerar una sección "visible". Default: 80 (navbar height) */
  rootMarginTop?: number;
  /** Offset inferior (px). Default: 60% viewport */
  rootMarginBottom?: string;
  /** Umbral de visibilidad (0-1). Default: 0.1 */
  threshold?: number;
}

export function useScrollSpy(
  sectionIds: readonly string[],
  options: UseScrollSpyOptions = {}
) {
  const {
    rootMarginTop = 80,
    rootMarginBottom = '60%',
    threshold = 0.1,
  } = options;

  const [activeId, setActiveId] = useState<string | null>(null);
  const isScrolling = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionIdsRef = useRef(sectionIds);

  // Mantener ref actualizado sin recrear el observer
  useEffect(() => {
    sectionIdsRef.current = sectionIds;
  }, [sectionIds]);

  /* ================================================================ */
  /*  Scroll Spy — IntersectionObserver                               */
  /* ================================================================ */

  useEffect(() => {
    if (!sectionIds.length) return;

    // Feature detection — evitar crash en WebViews antiguos de iOS
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: activar la primera sección por defecto
      setActiveId(sectionIds[0] || null);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrolling.current) return;

        // Tomar la sección más visible que esté intersectando
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          const id = visible.target.id;
          if (id !== activeId) {
            setActiveId(id);
            window.history.replaceState(null, '', `#${id}`);
          }
        }
      },
      {
        rootMargin: `-${rootMarginTop}px 0px -${rootMarginBottom} 0px`,
        threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observar todos los elementos
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds, rootMarginTop, rootMarginBottom, threshold]);

  /* ================================================================ */
  /*  Hash Navigation — Al cargar con #hash, hacer scroll             */
  /* ================================================================ */

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && sectionIds.includes(hash)) {
      // Esperar a que el DOM esté completamente renderizado
      let retries = 0;
      const MAX_RETRIES = 30; // ~500ms max de espera
      const attempt = () => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveId(hash);
        } else if (retries < MAX_RETRIES) {
          retries++;
          // Reintentar si aún no existe (render lazy)
          requestAnimationFrame(attempt);
        }
      };
      // Pequeño delay para permitir renderizado
      setTimeout(attempt, 100);
    }
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================ */
  /*  scrollTo — Smooth scroll a una sección + URL update             */
  /* ================================================================ */

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    isScrolling.current = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Actualizar URL inmediatamente
    window.history.replaceState(null, '', `#${id}`);
    setActiveId(id);

    // Re-habilitar scroll spy después de la animación
    setTimeout(() => {
      isScrolling.current = false;
    }, 800);
  }, []);

  return { activeId, scrollTo } as const;
}