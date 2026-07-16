'use client';

// ============================================================
// VideoPlayer — Reproductor de video profesional
// Soporta: archivos subidos a Sanity (MP4/MOV/WebM),
//          YouTube y Vimeo (iframe).
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayer({ videoUrl, webmUrl, titulo, posterUrl, isFree = false, onProgress, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const { isRecording } = useGlobalRecordingDetection();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [videoSize, setVideoSize] = useState<'S' | 'M' | 'L'>('M');
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipEnabled, setPipEnabled] = useState(false);

  // Verificar soporte PiP al montar
  useEffect(() => {
    const checkPiPSupport = () => {
      const isSupported = typeof document !== 'undefined' && 
                          document.pictureInPictureEnabled && 
                          !videoRef.current?.disablePictureInPicture;
      setPipEnabled(isSupported);
    };
    
    checkPiPSupport();
  }, []);

  const togglePictureInPicture = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) {
      console.error('Error PiP:', err);
    }
  }, []);

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

  // Close speed menu when clicking outside
  useEffect(() => {
    if (!showSpeedMenu) return;
    const handleOutsideClick = () => setShowSpeedMenu(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showSpeedMenu]);

  // Picture-in-Picture Automático al cambiar de pestaña/minimizar
  useEffect(() => {
    if (!isFree || !pipEnabled) return;

    const handleVisibilityChange = async () => {
      const video = videoRef.current;
      if (!video || !isPlaying) return;

      if (document.hidden && !isPipActive) {
        // Usuario cambió de pestaña o minimizó - Activar PiP automáticamente
        try {
          if (document.pictureInPictureEnabled && video.readyState >= 2) {
            await video.requestPictureInPicture();
            setIsPipActive(true);
          }
        } catch (error) {
          console.log('PiP automático no disponible:', error);
        }
      } else if (!document.hidden && isPipActive) {
        // Usuario regresó a la pestaña - Salir de PiP
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
            setIsPipActive(false);
          }
        } catch (error) {
          console.log('Error saliendo de PiP:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFree, isPlaying, isPipActive]);

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
    const togglePlay = useCallback((e?: React.MouseEvent) => {
      if (e && e.stopPropagation) e.stopPropagation();
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

    // Seek forward (+10 segundos)
    const handleSeekForward = useCallback((e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const video = videoRef.current;
      if (video) {
        video.currentTime = Math.min(video.currentTime + 10, duration);
      }
    }, [duration]);

    // Seek backward (-10 segundos)
    const handleSeekBackward = useCallback((e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const video = videoRef.current;
      if (video) {
        video.currentTime = Math.max(video.currentTime - 10, 0);
      }
    }, []);

    // ── Canvas overlay anti-grabación ──
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

      const fillBlack = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      const resize = () => {
        const w = container.clientWidth || video.clientWidth || 1280;
        const h = container.clientHeight || video.clientHeight || 720;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          fillBlack();
        }
      };

      resize();
      const ro = new ResizeObserver(() => resize());
      ro.observe(container);
      video.addEventListener('loadedmetadata', resize);

      const render = () => {
        if (!video.paused && !video.ended) {
          if (!isRecording) {
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            } catch {
              // drawImage falla en iOS con grabación nativa → canvas se queda negro
              fillBlack();
            }
          } else {
            fillBlack();
          }
        }
        animRef.current = requestAnimationFrame(render);
      };

      const onPlay = () => {
        resize();
        animRef.current = requestAnimationFrame(render);
      };

      const onPause = () => {
        cancelAnimationFrame(animRef.current);
        if (isRecording || !video.videoWidth) {
          fillBlack();
        } else {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          } catch {
            fillBlack();
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
    }, [isRecording]);

    return (
      <div
        ref={containerRef}
        className={`video-player-container relative aspect-video bg-black rounded-xl overflow-hidden group mx-auto transition-all duration-300 ${
          videoSize === 'S' ? 'max-w-2xl' : videoSize === 'L' ? 'max-w-6xl' : 'max-w-4xl'
        }`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          preload="metadata"
          onClick={togglePlay}
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

        {/* Canvas overlay anti-grabación: dibuja frames del video o negro si grabando */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5, background: '#000' }}
          aria-hidden="true"
        />

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
          {/* Área clickable invisible para pausar/reproducir cuando los controles están visibles */}
          <div className="absolute inset-0 z-0 cursor-pointer" onClick={togglePlay} />

          {/* Botón de play/pause central cuando está pausado */}
          {!isPlaying && currentTime > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors pointer-events-auto">
                <Play className="w-6 h-6 text-white ml-0.5" />
              </button>
            </div>
          )}

          {/* Barra de progreso */}
          <div
            className="group/progress w-full h-1.5 bg-white/20 cursor-pointer hover:h-2.5 transition-all relative z-10"
            onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
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
          <div 
            className="bg-gradient-to-t from-black/80 to-transparent px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Seek backward (-10s) */}
            <button
              onClick={handleSeekBackward}
              className="text-white/85 hover:text-emerald-400 transition-colors p-1"
              title="Retroceder 10 segundos"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>

            <button
              className="text-white hover:text-emerald-400 transition-colors p-1"
              onClick={togglePlay}
            >
              {isPlaying
                ? <Pause className="w-5 h-5" />
                : <Play className="w-5 h-5" />
              }
            </button>

            {/* Seek forward (+10s) */}
            <button
              onClick={handleSeekForward}
              className="text-white/85 hover:text-emerald-400 transition-colors p-1"
              title="Adelantar 10 segundos"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
              </svg>
            </button>

            <div className="flex-1 flex items-center justify-end sm:justify-start gap-2">
              <div className="text-white/80 text-xs font-mono select-none whitespace-nowrap">
                {formatTime(currentTime)} <span className="text-white/40">/</span> <span className="text-white/50">{formatTime(duration)}</span>
              </div>
              <div className="hidden sm:block flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                {duration > 0 && (
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-[width] duration-150"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Sizing controls */}
            <div className="hidden sm:flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-xs" onClick={(e) => e.stopPropagation()}>
              {(['S', 'M', 'L'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setVideoSize(size)}
                  className={`px-2 py-0.5 rounded transition-all font-medium ${
                    videoSize === size ? 'bg-emerald-500 text-white shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                  title={`Tamaño ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Speed control */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded transition-colors"
                title="Velocidad de reproducción"
              >
                <span>{playbackRate}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[80px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.playbackRate = rate;
                          setPlaybackRate(rate);
                        }
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-center text-xs hover:bg-white/10 transition-colors font-medium ${
                        playbackRate === rate ? 'text-emerald-400 bg-white/5' : 'text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mute button */}
            <button
              className="text-white/70 hover:text-white transition-colors hidden sm:block"
              onClick={toggleMuteHandler}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* PiP button */}
            {pipEnabled && (
              <button
                onClick={togglePictureInPicture}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all font-medium ${
                  isPipActive 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isPipActive ? 'Salir de PiP' : 'Ver en segundo plano (PiP)'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline">{isPipActive ? 'PiP Activo' : 'PiP'}</span>
              </button>
            )}

            {/* Fullscreen button */}
            <button
              className="text-white/70 hover:text-white transition-colors"
              onClick={toggleFullscreen}
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
          
          {/* Indicador de PiP Activo */}
          {isPipActive && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse z-50">
              🎬 PiP Activo
            </div>
          )}
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