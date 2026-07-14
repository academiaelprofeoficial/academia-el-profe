'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================
// useScreenRecorder — Hook de grabación de pantalla
// con protección anti-piratería (overlay negro sobre videos)
//
// - Usa getDisplayMedia para capturar la pestaña del navegador
// - Inyecta overlays negros sobre todos los <video> e
//   <iframe> (YouTube/Vimeo) durante la grabación
// - Descarga automáticamente el archivo .webm al detener
// - Limpia todo al desmontar el componente
// ============================================================

const OVERLAY_CLASS = 'screen-recording-overlay';
const INDICATOR_CLASS = 'screen-rec-indicator';

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

function createIndicatorElement(): HTMLDivElement {
  const indicator = document.createElement('div');
  indicator.className = INDICATOR_CLASS;
  indicator.innerHTML = `
    <div class="screen-rec-dot"></div>
    <span>REC</span>
  `;
  return indicator;
}

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'video/webm';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) return 'video/webm;codecs=vp9';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) return 'video/webm;codecs=vp8';
  return 'video/webm';
}

export function useScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  // Ref para evitar stale closures en el event listener de 'ended'
  const stopRecordingRef = useRef<() => void>(() => {});

  // ── Inyectar overlays sobre videos ──
  const injectOverlays = useCallback(() => {
    const selectors = [
      'video',
      'iframe[src*="youtube.com"]',
      'iframe[src*="youtu.be"]',
      'iframe[src*="player.vimeo.com"]',
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((target) => {
        // Buscar el contenedor posicionado más cercano (el wrapper del VideoPlayer)
        const container =
          (target as HTMLElement).closest('.relative.aspect-video') ||
          (target as HTMLElement).closest('[class*="aspect-video"]') ||
          target.parentElement;

        if (!container) return;
        // No duplicar si ya tiene overlay
        if (container.querySelector(`.${OVERLAY_CLASS}`)) return;

        // Asegurar que el contenedor tiene position:relative para el overlay
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

  // ── Detener grabación ──
  const stopRecording = useCallback(() => {
    // Detener MediaRecorder si está activo
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    // Detener todos los tracks del stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Desconectar MutationObserver
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Remover indicador REC
    if (indicatorRef.current) {
      indicatorRef.current.remove();
      indicatorRef.current = null;
    }

    setIsRecording(false);
    streamRef.current = null;
    mediaRecorderRef.current = null;

    // Remover clase CSS del body
    document.body.classList.remove('recording-active');
    removeOverlays();
  }, [removeOverlays]);

  // Mantener el ref actualizado
  stopRecordingRef.current = stopRecording;

  // ── Iniciar grabación ──
  const startRecording = useCallback(async () => {
    // Verificar soporte del navegador
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error(
        'Tu navegador no soporta grabacion de pantalla. Usa Chrome, Firefox o Edge.'
      );
    }

    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          preferCurrentTab: true,
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Detectar cuando el usuario detiene compartir pantalla desde el navegador
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecordingRef.current();
      });

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Solo descargar si hay datos
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, '-');
          a.download = `clase-${timestamp}.webm`;
          // Adjuntar al DOM para evitar bloqueo de popup
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          chunksRef.current = [];
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = mediaStream;
      setIsRecording(true);

      // Activar protección: clase CSS + overlays
      document.body.classList.add('recording-active');

      // Pequeño delay para asegurar que los videos están renderizados
      setTimeout(() => {
        injectOverlays();

        // Observar cambios en el DOM para videos que se monten después
        // (navegación SPA entre lecciones, lazy loading, etc.)
        observerRef.current = new MutationObserver(() => {
          injectOverlays();
        });
        observerRef.current.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }, 100);

      // Mostrar indicador REC en la esquina superior
      const indicator = createIndicatorElement();
      document.body.appendChild(indicator);
      indicatorRef.current = indicator;
    } catch (error) {
      console.error('[ScreenRecorder] Error al iniciar grabacion:', error);
      throw error;
    }
  }, [injectOverlays]);

  // ── Limpieza al desmontar ──
  useEffect(() => {
    return () => {
      const mr = mediaRecorderRef.current;
      const stream = streamRef.current;

      if (mr && mr.state !== 'inactive') {
        mr.onstop = null; // Prevenir descarga al desmontar
        mr.stop();
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (indicatorRef.current) {
        indicatorRef.current.remove();
      }

      document.body.classList.remove('recording-active');
      document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((el) => el.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isRecording, startRecording, stopRecording };
}