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
//   - El usuario ve el video de forma nativa
//
// CON grabación:
//   - getDisplayMedia: detectamos → hook inyecta overlay
//   - MediaRecorder: detectamos → hook inyecta overlay
//
// El audio del video sigue reproduciéndose durante la grabación.
// NO agrega iconos, textos ni elementos visuales nuevos.
// ============================================================

import { useRef, useEffect, type VideoHTMLAttributes, type ReactNode, type RefObject } from 'react';
import { useGlobalRecordingDetection } from '@/hooks/useGlobalRecordingDetection';
import { registerVideo, unregisterVideo } from '@/lib/videoPlaybackManager';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { isRecording } = useGlobalRecordingDetection();

  // Usar ref externa si se proporciona, sino la interna
  const videoRef = (externalVideoRef as React.RefObject<HTMLVideoElement | null>) || internalVideoRef;

  // ── Register with global playback manager + cleanup on unmount ──
  // This handles the iOS hardware decoder limit:
  // when another video starts, this one's decoder is freed.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const srcStr = typeof src === 'string' ? src : '';
    registerVideo(video, srcStr);
    return () => {
      unregisterVideo(video);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Assign src imperatively — critical for iOS decoder management ──
  // Using video.src (not <source> children) + preload="none" means iOS
  // won't allocate a hardware decoder slot until the user presses play.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Explicitly TEARDOWN the previous decoder slot first
    if (!video.paused) {
      video.pause();
    }
    video.removeAttribute('src');
    video.src = '';
    video.load();

    const srcToUse = typeof src === 'string' ? src : '';
    if (!srcToUse) return;

    // 2. Wait a brief moment to let iOS AVFoundation GC the old stream before allocating a new one
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = srcToUse;
        videoRef.current.load(); // Tells browser to reset but not decode (preload=none)
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [src, videoRef]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: '#000', ...(style as React.CSSProperties) }}
    >
      {/* Video real: src asignado imperativemente via useEffect */}
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full"
        playsInline
        preload="none"
        {...videoProps}
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
