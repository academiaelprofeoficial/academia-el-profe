'use client';

// ============================================================
// VideoPlayer — Reproductor de video nativo
// Usa controles nativos del navegador en TODOS los dispositivos
// (mismo estilo que iOS en Android, Windows, etc.)
// Soporta: archivos Sanity (MP4/MOV/WebM), YouTube y Vimeo.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useGlobalRecordingDetection } from '@/hooks/useGlobalRecordingDetection';

interface VideoPlayerProps {
  readonly videoUrl?: string;
  readonly webmUrl?: string;
  readonly titulo?: string;
  readonly posterUrl?: string;
  readonly isFree?: boolean;
  readonly onProgress?: (seconds: number, duration: number) => void;
  readonly onComplete?: () => void;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export default function VideoPlayer({
  videoUrl,
  webmUrl,
  titulo,
  posterUrl,
  isFree,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isRecording } = useGlobalRecordingDetection();

  // ── PiP state ──
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipEnabled, setPipEnabled] = useState(false);

  // Verificar soporte PiP al montar
  useEffect(() => {
    const checkPiPSupport = () => {
      const isSupported =
        typeof document !== 'undefined' &&
        document.pictureInPictureEnabled &&
        !videoRef.current?.disablePictureInPicture;
      setPipEnabled(isSupported);
    };
    checkPiPSupport();
  }, []);

  // PiP enter/leave events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnter = () => setIsPipActive(true);
    const onLeave = () => setIsPipActive(false);
    video.addEventListener('enterpictureinpicture', onEnter);
    video.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter);
      video.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, []);

  // Picture-in-Picture Automático al cambiar de pestaña/minimizar (solo videos free)
  useEffect(() => {
    if (!isFree || !pipEnabled) return;

    let pipTimeout: ReturnType<typeof setTimeout>;

    const handleVisibilityChange = async () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden && !isPipActive) {
        pipTimeout = setTimeout(async () => {
          try {
            if (video.readyState >= 2 && !video.paused && !isPipActive) {
              await video.requestPictureInPicture();
              setIsPipActive(true);
            }
          } catch {
            // PiP no disponible
          }
        }, 100);
      } else if (!document.hidden && isPipActive) {
        if (pipTimeout) clearTimeout(pipTimeout);
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
            setIsPipActive(false);
          }
        } catch {
          // Error saliendo de PiP
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pipTimeout) clearTimeout(pipTimeout);
    };
  }, [isFree, isPipActive, pipEnabled]);

  // ── Protección anti-descarga: prevenir menú contextual en el video ──
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // ── YouTube ──
  const youtubeId = videoUrl ? extractYouTubeId(videoUrl) : null;
  if (youtubeId) {
    return (
      <div ref={containerRef} className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={titulo || 'Video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // ── Vimeo ──
  const vimeoId = videoUrl ? extractVimeoId(videoUrl) : null;
  if (vimeoId) {
    return (
      <div ref={containerRef} className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
          title={titulo || 'Video'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // ── Archivo de video directo (Sanity upload: MP4, MOV, WebM) ──
  if (videoUrl) {
    return (
      <div
        ref={containerRef}
        className="video-player-container relative aspect-video bg-black rounded-xl overflow-hidden mx-auto max-w-4xl"
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          className="w-full h-full object-contain"
          playsInline
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disableRemotePlayback
          preload="metadata"
          onContextMenu={handleContextMenu}
          onTimeUpdate={() => {
            const v = videoRef.current;
            if (!v) return;
            onProgress?.(v.currentTime, v.duration);
          }}
          onEnded={() => {
            onComplete?.();
          }}
        >
          {webmUrl && <source src={webmUrl} type="video/webm" />}
          <source src={videoUrl} type={videoUrl?.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        </video>

        {/* Indicador de PiP Activo */}
        {isPipActive && (
          <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse z-30 pointer-events-none">
            PiP Activo
          </div>
        )}
      </div>
    );
  }

  // ── Placeholder (sin video disponible) ──
  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <Play className="w-8 h-8 text-white/80 ml-1" />
        </div>
        {titulo && (
          <p className="text-white/80 text-sm font-medium text-center px-4">{titulo}</p>
        )}
        <p className="text-white/40 text-xs text-center px-8 max-w-md">
          El video de esta clase estará disponible pronto.
        </p>
      </div>
    </div>
  );
}