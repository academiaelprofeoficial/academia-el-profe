'use client';

// ============================================================
// VideoPlayer — Reproductor de video profesional
// Soporta: archivos subidos a Sanity (MP4/MOV/WebM),
//          YouTube y Vimeo (iframe).
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  readonly videoUrl?: string;
  readonly webmUrl?: string;
  readonly titulo?: string;
  readonly posterUrl?: string;
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayer({ videoUrl, webmUrl, titulo, posterUrl, onProgress, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const togglePlay = useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) { v.play().catch(() => {}); } else { v.pause(); }
    }, []);

    const toggleMuteHandler = useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = !v.muted;
      setIsMuted(!v.muted);
    }, []);

    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }, []);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const v = videoRef.current;
      if (!v || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      v.currentTime = x * duration;
    }, [duration]);

    const handleMouseMove = useCallback(() => {
      setShowControls(true);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      hideControlsTimer.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }, [isPlaying]);

    return (
      <div
        ref={containerRef}
        className="relative aspect-video bg-black rounded-xl overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            const v = videoRef.current;
            if (!v) return;
            setCurrentTime(v.currentTime);
            onProgress?.(v.currentTime, v.duration);
          }}
          onLoadedMetadata={() => {
            const v = videoRef.current;
            if (v) setDuration(v.duration);
          }}
          onProgress={() => {
            const v = videoRef.current;
            if (v && v.buffered.length > 0) {
              setBuffered(v.buffered.end(v.buffered.length - 1));
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            onComplete?.();
          }}
        >
          {webmUrl && <source src={webmUrl} type="video/webm" />}
          <source src={videoUrl} type={videoUrl?.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        </video>

        {/* Gran botón de play inicial (solo cuando está pausado y al inicio) */}
        {!isPlaying && currentTime === 0 && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 transition-opacity"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/90 hover:bg-emerald-500 flex items-center justify-center transition-colors shadow-2xl">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </button>
        )}

        {/* Overlay de controles */}
        <div
          className={`absolute inset-0 z-10 flex flex-col justify-end transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Botón de play/pause central cuando está pausado */}
          {!isPlaying && currentTime > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                <Play className="w-6 h-6 text-white ml-0.5" />
              </button>
            </div>
          )}

          {/* Barra de progreso */}
          <div
            className="group/progress w-full h-1.5 bg-white/20 cursor-pointer hover:h-2.5 transition-all relative"
            onClick={handleSeek}
          >
            {/* Buffer */}
            {duration > 0 && (
              <div
                className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                style={{ width: `${(buffered / duration) * 100}%` }}
              />
            )}
            {/* Progreso */}
            {duration > 0 && (
              <div
                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            )}
          </div>

          {/* Controles inferiores */}
          <div className="bg-gradient-to-t from-black/80 to-transparent px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
            <button
              className="text-white hover:text-emerald-400 transition-colors"
              onClick={togglePlay}
            >
              {isPlaying
                ? <Pause className="w-5 h-5" />
                : <Play className="w-5 h-5" />
              }
            </button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-white/80 text-xs font-mono select-none whitespace-nowrap">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                {duration > 0 && (
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-[width] duration-150"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                )}
              </div>
              <span className="text-white/50 text-xs font-mono select-none whitespace-nowrap">
                {formatTime(duration)}
              </span>
            </div>

            <button
              className="text-white/70 hover:text-white transition-colors hidden sm:block"
              onClick={toggleMuteHandler}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              className="text-white/70 hover:text-white transition-colors"
              onClick={toggleFullscreen}
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
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