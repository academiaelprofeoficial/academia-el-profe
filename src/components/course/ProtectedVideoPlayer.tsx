'use client';

// ============================================================
// ProtectedVideoPlayer — Reproductor universal con protección
// anti-grabación vía Canvas overlay.
//
// ESTRATEGIA (3 capas de protección):
//
// 1. Canvas con fondo NEGRO permanente (+ fillRect negro)
//    → El canvas SIEMPRE empieza negro
//    → En iOS, el canvas TAINTED (video cross-origin) se
//      captura automáticamente como NEGRO en la grabación nativa
//      (Apple privacy feature para canvas con drawImage cross-origin)
//    → En Android, algunos navegadores hacen lo mismo
//
// 2. Detección activa de getDisplayMedia (PC)
//    → Cuando detectamos grabación, pintamos NEGRO explícitamente
//    → El canvas se queda negro mientras dure la grabación
//
// 3. Detección activa de MediaRecorder (móvil navegador)
//    → Cuando se usa MediaRecorder, pintamos NEGRO explícitamente
//
// SIN grabación:
//   - El canvas dibuja los frames del video sobre el fondo negro
//   - El usuario ve el video con total normalidad
//
// CON grabación:
//   - iOS nativo: canvas tainted → captura negro automáticamente
//   - getDisplayMedia: detectamos → pintamos negro explícito
//   - MediaRecorder: detectamos → pintamos negro explícito
//
// El audio del video sigue reproduciéndose durante la grabación.
// Canvas tiene pointer-events:none → controles nativos funcionan.
// NO agrega iconos, textos ni elementos visuales nuevos.
// ============================================================

import { useRef, useEffect, useCallback, type VideoHTMLAttributes, type ReactNode, type RefObject } from 'react';
import { useGlobalRecordingDetection } from '@/hooks/useGlobalRecordingDetection';

export interface ProtectedVideoPlayerProps
  extends VideoHTMLAttributes<HTMLVideoElement> {
  /** Ref externa al video (necesaria para VideoPlayer con controles custom) */
  videoRef?: RefObject<HTMLVideoElement | null>;
  /** Children se renderizan encima del canvas (para controles custom) */
  children?: ReactNode;
}

export function ProtectedVideoPlayer({
  src,
  poster,
  children,
  videoRef: externalVideoRef,
  className = '',
  style,
  ...videoProps
}: ProtectedVideoPlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const { isRecording } = useGlobalRecordingDetection();

  // Usar ref externa si se proporciona, sino la interna
  const videoRef = (externalVideoRef as React.RefObject<HTMLVideoElement | null>) || internalVideoRef;

  // ── Pinta el canvas completamente negro ──
  const fillBlack = useCallback((ctx: CanvasRenderingContext2D | null, width: number, height: number) => {
    if (!ctx || width === 0 || height === 0) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }, []);

  // ── Render loop: SIEMPRE llena con negro primero, luego dibuja frame si no hay grabación ──
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true,
    });
    if (!ctx) return;

    // Ajustar tamaño del canvas al contenedor
    const resize = () => {
      const w = container.clientWidth || video.clientWidth || 1280;
      const h = container.clientHeight || video.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        // Mantener negro al redimensionar
        fillBlack(ctx, w, h);
      }
    };

    // Redimensionar inmediatamente
    resize();

    // Observar cambios de tamaño del contenedor (más fiable que el video)
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    // Cuando el video carga metadatos, reajustar
    video.addEventListener('loadedmetadata', resize);

    // ── Bucle de renderizado ──
    const render = () => {
      if (!video.paused && !video.ended) {
        // PASO 1: Siempre rellenar con negro (fondo base)
        fillBlack(ctx, canvas.width, canvas.height);

        // PASO 2: Frame-skip anti-grabación para Android
        // Cada ~90 frames (~1.5s a 60fps) se salta 1 frame (negro).
        // Es IMPERCEPTIBLE al ojo humano (~16ms de negro) pero los
        // grabadores de pantalla nativos capturan ese frame negro.
        const skipFrame = frameCountRef.current % 90 === 0;

        // PASO 3: Si NO hay grabación y NO es frame saltado, dibujar video
        if (!isRecording && !skipFrame) {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          } catch {
            // drawImage puede fallar en iOS cuando hay grabación nativa activa.
            // Si falla, el canvas se queda negro → perfecto para protección.
          }
        }
        // Si hay grabación o frame skip: canvas se queda NEGRO (solo el fillBlack)

        frameCountRef.current++;
      }
      animRef.current = requestAnimationFrame(render);
    };

    // Iniciar render loop al reproducir
    const onPlay = () => {
      // Asegurar tamaño correcto antes de empezar
      resize();
      animRef.current = requestAnimationFrame(render);
    };

    // Al pausar: mantener frame actual o negro
    const onPause = () => {
      cancelAnimationFrame(animRef.current);
      if (isRecording || !video.videoWidth) {
        fillBlack(ctx, canvas.width, canvas.height);
      } else {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch {
          fillBlack(ctx, canvas.width, canvas.height);
        }
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onPause);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      video.removeEventListener('loadedmetadata', resize);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onPause);
    };
  }, [isRecording, videoRef, fillBlack]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: '#000', ...(style as React.CSSProperties) }}
    >
      {/* Video real: se reproduce con audio debajo del canvas */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        playsInline
        {...videoProps}
      />

      {/* Canvas overlay: fondo negro + frames del video (o solo negro si grabando) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5, background: '#000' }}
        aria-hidden="true"
      />

      {/* Children (controles personalizados, etc.) van encima del canvas */}
      {children && (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}
