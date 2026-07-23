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
  const containerRef = useRef<HTMLDivElement>(null);
  const { isRecording } = useGlobalRecordingDetection();

  // Usar ref externa si se proporciona, sino la interna
  const videoRef = (externalVideoRef as React.RefObject<HTMLVideoElement | null>) || internalVideoRef;



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



      {/* Children (controles personalizados, etc.) van encima del canvas */}
      {children && (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}
