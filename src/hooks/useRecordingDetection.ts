'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// useRecordingDetection — Hook pasivo de detección de
// grabación de pantalla.
//
// Intercepta navigator.mediaDevices.getDisplayMedia para
// detectar cuándo ALGUIEN (el usuario o una extensión)
// inicia una grabación de pantalla.
//
// SOLO en ese momento:
//   - Agrega la clase 'recording-active' al body
//   - Inyecta overlays negros sobre <video> e <iframe>
//   - Retorna isRecording = true
//
// Cuando la grabación se detiene, todo se restaura.
// NO afecta la reproducción normal de videos.
// ============================================================

const OVERLAY_CLASS = 'screen-recording-overlay';

function createOverlayElement(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.innerHTML = `
    <div class="screen-recording-overlay-inner">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span>Contenido protegido durante la grabacion</span>
    </div>
  `;
  return overlay;
}

export function useRecordingDetection() {
  const [isRecording, setIsRecording] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const activeStreamsRef = useRef<Set<MediaStream>>(new Set());

  // ── Inyectar overlays sobre videos existentes ──
  const injectOverlays = useCallback(() => {
    const selectors = [
      'video',
      'iframe[src*="youtube.com"]',
      'iframe[src*="youtu.be"]',
      'iframe[src*="player.vimeo.com"]',
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((target) => {
        const container =
          (target as HTMLElement).closest('.relative.aspect-video') ||
          (target as HTMLElement).closest('[class*="aspect-video"]') ||
          (target as HTMLElement).closest('.video-player-container') ||
          target.parentElement;

        if (!container) return;
        if (container.querySelector(`.${OVERLAY_CLASS}`)) return;

        const htmlContainer = container as HTMLElement;
        const position = getComputedStyle(htmlContainer).position;
        if (position === 'static') {
          htmlContainer.style.position = 'relative';
        }

        htmlContainer.appendChild(createOverlayElement());
      });
    });
  }, []);

  // ── Remover todos los overlays ──
  const removeOverlays = useCallback(() => {
    document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((el) => el.remove());
  }, []);

  // ── Activar protección completa ──
  const activateProtection = useCallback(() => {
    if (activeStreamsRef.current.size === 0) {
      // Primera stream — activar protección
      setIsRecording(true);
      document.body.classList.add('recording-active');

      setTimeout(() => {
        injectOverlays();
        // Observer para videos que se monten después
        observerRef.current = new MutationObserver(() => {
          injectOverlays();
        });
        observerRef.current.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }, 100);
    }
  }, [injectOverlays]);

  // ── Desactivar protección ──
  const deactivateProtection = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    removeOverlays();
    document.body.classList.remove('recording-active');
    setIsRecording(false);
  }, [removeOverlays]);

  useEffect(() => {
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;

    if (!originalGetDisplayMedia) return;

    // Interceptar getDisplayMedia
    navigator.mediaDevices.getDisplayMedia = async function (constraints) {
      try {
        const stream = await originalGetDisplayMedia.call(this, constraints);

        // Registrar esta stream
        activeStreamsRef.current.add(stream);
        activateProtection();

        // Detectar cuando se detiene esta stream específica
        const handleTrackEnded = () => {
          activeStreamsRef.current.delete(stream);
          if (activeStreamsRef.current.size === 0) {
            deactivateProtection();
          }
        };

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.addEventListener('ended', handleTrackEnded);
        }

        return stream;
      } catch (error) {
        // El usuario canceló el selector de pantalla — no hacer nada
        throw error;
      }
    };

    return () => {
      // Restaurar función original
      navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;

      // Limpiar todo
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      removeOverlays();
      document.body.classList.remove('recording-active');
      activeStreamsRef.current.clear();
    };
  }, [activateProtection, deactivateProtection, injectOverlays, removeOverlays]);

  return { isRecording };
}