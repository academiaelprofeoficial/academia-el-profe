'use client';

// ============================================================
// ProtectedVideoPlayer — Reproductor universal con protección
// anti-grabación vía Canvas overlay.
//
// - Renderiza <video> normalmente con todos sus atributos
// - Superpone un <canvas> que dibuja los frames del video
// - Cuando se detecta grabación (getDisplayMedia o MediaRecorder),
//   el canvas dibuja NEGRO en lugar del frame del video
// - El audio del video sigue reproduciéndose durante la grabación
// - Canvas tiene pointer-events:none para que los controles nativos
//   funcionen a través de él
// - NO agrega iconos, textos ni elementos visuales nuevos
// - Soporta children: se renderizan encima del canvas (para
//   componentes con controles personalizados como VideoPlayer)
// ============================================================

import { useRef, useEffect, type VideoHTMLAttributes, type ReactNode, type RefObject } from 'react';
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
  const animRef = useRef<number>(0);
  const { isRecording } = useGlobalRecordingDetection();

  // Usar ref externa si se proporciona, sino la interna
  const videoRef = (externalVideoRef as React.RefObject<HTMLVideoElement | null>) || internalVideoRef;

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    // Ajustar tamaño del canvas al video
    const resize = () => {
      const w = video.videoWidth || video.clientWidth || 1280;
      const h = video.videoHeight || video.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    video.addEventListener('loadedmetadata', resize);

    // Observar cambios de tamaño
    const ro = new ResizeObserver(() => resize());
    ro.observe(video);

    // Bucle de renderizado
    const render = () => {
      if (!video.paused && !video.ended) {
        if (isRecording) {
          // Durante grabación: dibujar negro (se ve negro en la grabación)
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Normal: dibujar el frame actual del video
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
      animRef.current = requestAnimationFrame(render);
    };

    // Iniciar render al reproducir
    const onPlay = () => {
      animRef.current = requestAnimationFrame(render);
    };

    // Detener render en pausa (dibujar frame actual o negro)
    const onPause = () => {
      cancelAnimationFrame(animRef.current);
      if (isRecording) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    };

    const onSeeked = () => {
      if (video.paused) {
        if (isRecording) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      video.removeEventListener('loadedmetadata', resize);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [isRecording, videoRef]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: '#000', ...(style as React.CSSProperties) }}
    >
      {/* Video real: se reproduce con audio, visible debajo del canvas */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        playsInline
        {...videoProps}
      />

      {/* Canvas overlay: dibuja frames del video o negro si grabando */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5 }}
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
