'use client';

// ============================================================
// VideoPlayer — Reproductor de video profesional
// Soporta: archivos subidos a Sanity (MP4/MOV/WebM),
//          YouTube y Vimeo (iframe).
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, RotateCcw, RotateCw, PictureInPicture2 } from 'lucide-react';
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

function formatRemainingTime(current: number, total: number): string {
  const remaining = Math.max(0, total - current);
  const m = Math.floor(remaining / 60);
  const s = Math.floor(remaining % 60);
  return `-${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
  const isSeekingTouch = useRef(false);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const lastTouchTimeRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showAdditionalMenu, setShowAdditionalMenu] = useState(false);

  // ── iOS Detection (before any early returns) ──
  const isIOS = typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

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

  // Close menus when clicking outside
  useEffect(() => {
    if (!showSpeedMenu && !showAdditionalMenu) return;
    const handleOutsideClick = () => {
      setShowSpeedMenu(false);
      setShowAdditionalMenu(false);
    };
    // Delay to avoid closing immediately on the same click that opened the menu
    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showSpeedMenu, showAdditionalMenu]);

  // Picture-in-Picture Automático al cambiar de pestaña/minimizar
  useEffect(() => {
    if (!isFree || !pipEnabled || !isPlaying) return;

    let pipTimeout: ReturnType<typeof setTimeout>;

    const handleVisibilityChange = async () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden && !isPipActive) {
        // Usuario cambió de pestaña o minimizó - Activar PiP automáticamente
        pipTimeout = setTimeout(async () => {
          try {
            if (video.readyState >= 2 && !video.paused && !isPipActive) {
              await video.requestPictureInPicture();
              setIsPipActive(true);
            }
          } catch (error) {
            console.log('PiP automático no disponible:', error);
          }
        }, 100);
      } else if (!document.hidden && isPipActive) {
        // Usuario regresó a la pestaña - Salir de PiP
        if (pipTimeout) clearTimeout(pipTimeout);
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
      if (pipTimeout) clearTimeout(pipTimeout);
    };
  }, [isFree, isPlaying, isPipActive, pipEnabled]);

  // Detectar fullscreen (standard + iOS webkit)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleWebkitFullscreenChange = () => {
      const video = videoRef.current as any;
      setIsFullscreen(!!(video && video.webkitDisplayingFullscreen));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleWebkitFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleWebkitFullscreenChange);
    };
  }, []);

  // ── Pinch-to-zoom → fullscreen landscape (like YouTube mobile) ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let initialPinchDistance = 0;
    let pinchActive = false;

    const getDistance = (t1: React.Touch, t2: React.Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
        pinchActive = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pinchActive || e.touches.length < 2) return;
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      // If pinching out (zoom in) beyond 30px threshold → go fullscreen
      if (currentDistance - initialPinchDistance > 30 && !document.fullscreenElement) {
        pinchActive = false;
        const video = container.querySelector('video');
        // iOS: use native video fullscreen
        if (video && /iPad|iPhone|iPod/.test(navigator.userAgent) && (video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
          video.play().catch(() => {});
        } else if (container.requestFullscreen) {
          container.requestFullscreen().then(async () => {
            try { await (screen.orientation as any).lock('landscape'); } catch {}
          }).catch(() => {});
        }
      }
    };

    const onTouchEnd = () => { pinchActive = false; };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
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
    const togglePlay = useCallback((e?: React.MouseEvent) => {
      if (e && e.stopPropagation) e.stopPropagation();
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) { v.play().catch(() => {}); } else { v.pause(); }
    }, []);

    const toggleMuteHandler = useCallback((e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const v = videoRef.current;
      if (!v) return;
      v.muted = !v.muted;
      setIsMuted(v.muted);
      if (!v.muted && volume === 0) {
        setVolume(1);
        v.volume = 1;
      }
    }, [volume]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      const v = videoRef.current;
      if (v) {
        v.volume = newVolume;
        v.muted = newVolume === 0;
        setIsMuted(newVolume === 0);
      }
    }, []);

    const toggleFullscreen = useCallback(async () => {
      const video = videoRef.current;
      if (!video) return;

      // iOS: use native video fullscreen (webkitEnterFullscreen) — auto landscape
      if (isIOS && (video as any).webkitEnterFullscreen) {
        try {
          (video as any).webkitEnterFullscreen();
          video.play().catch(() => {});
        } catch {}
        return;
      }

      // Android / Desktop: use container fullscreen + orientation lock
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        try {
          await containerRef.current.requestFullscreen();
          try {
            await (screen.orientation as any).lock('landscape');
          } catch {}
        } catch {}
      } else {
        try { await (screen.orientation as any).unlock(); } catch {}
        try { await document.exitFullscreen(); } catch {}
      }
    }, [isIOS]);

    // ── Seek helpers (shared by mouse + touch) ──
    const seekToPosition = useCallback((clientX: number, element: HTMLElement) => {
      const v = videoRef.current;
      if (!v || !duration) return;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      v.currentTime = x * duration;
    }, [duration]);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      seekToPosition(e.clientX, e.currentTarget);
    }, [seekToPosition]);

    const handleSeekTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      isSeekingTouch.current = true;
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      const touch = e.touches[0];
      seekToPosition(touch.clientX, e.currentTarget);
    }, [seekToPosition]);

    const handleSeekTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      if (!isSeekingTouch.current) return;
      e.stopPropagation();
      const touch = e.touches[0];
      if (seekBarRef.current) {
        seekToPosition(touch.clientX, seekBarRef.current);
      }
    }, [seekToPosition]);

    const handleSeekTouchEnd = useCallback(() => {
      isSeekingTouch.current = false;
    }, []);

    const resetControlsTimer = useCallback(() => {
      setShowControls(true);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      hideControlsTimer.current = setTimeout(() => {
        if (isPlaying && !document.pictureInPictureElement) {
          setShowControls(false);
          setShowVolumeSlider(false);
          setShowAdditionalMenu(false);
          setShowSpeedMenu(false);
        }
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

    // Control de tamaño con forzado de DOM
    const handleSizeChange = useCallback((size: 'S' | 'M' | 'L') => {
      setVideoSize(size);
      if (containerRef.current) {
        containerRef.current.classList.remove('max-w-2xl', 'max-w-4xl', 'max-w-6xl');
        containerRef.current.classList.add(size === 'S' ? 'max-w-2xl' : size === 'L' ? 'max-w-6xl' : 'max-w-4xl');
      }
    }, []);

            // Click en el video - Desktop: Play/Pause, Mobile: skip (handled by touch)
            const handleVideoClick = useCallback(() => {
              if (Date.now() - lastTouchTimeRef.current < 500) return;
              const video = videoRef.current;
              if (!video) return;
              if (video.paused) {
                video.play().catch(() => {});
                setIsPlaying(true);
              } else {
                video.pause();
                setIsPlaying(false);
              }
              resetControlsTimer();
            }, [resetControlsTimer]);

            // Doble clic en el video - Fullscreen
            const handleVideoDoubleClick = useCallback(() => {
              const video = videoRef.current;
              if (!video) return;

              // iOS: use native video fullscreen
              if (/iPad|iPhone|iPod/.test(navigator.userAgent) && (video as any).webkitEnterFullscreen) {
                (video as any).webkitEnterFullscreen();
                video.play().catch(() => {});
                return;
              }

              if (!containerRef.current) return;
              if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }, []);

            const handleVideoTouch = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
              e.preventDefault();
              lastTouchTimeRef.current = Date.now();
              setShowControls(prev => !prev);
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

      const drawVideoFrame = () => {
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

      const resize = () => {
        const w = container.clientWidth || video.clientWidth || 1280;
        const h = container.clientHeight || video.clientHeight || 720;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const bufferW = Math.round(w * dpr);
        const bufferH = Math.round(h * dpr);
        if (canvas.width !== bufferW || canvas.height !== bufferH) {
          canvas.width = bufferW;
          canvas.height = bufferH;
          drawVideoFrame();
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
        drawVideoFrame();
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
        onMouseMove={resetControlsTimer}
        onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer"
          playsInline
          controlsList="nodownload"
          disableRemotePlayback
          preload="metadata"
          onClick={handleVideoClick}
          onDoubleClick={handleVideoDoubleClick}
          onTouchEnd={handleVideoTouch}
          onContextMenu={(e) => e.preventDefault()}
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

        {/* Gran botón de play inicial (solo cuando está pausado y al inicio) — Netflix rounded rectangle */}
        {!isPlaying && currentTime === 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 transition-opacity"
          >
            <div className="w-20 h-14 rounded-2xl bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-2xl">
              <Play className="w-8 h-8 text-black ml-1" fill="currentColor" stroke="none" />
            </div>
          </button>
        )}

        {/* ===== CONTROLES MOBILE (< 1024px) — NETFLIX STYLE ===== */}
        <div
          className={`lg:hidden absolute inset-0 transition-opacity duration-300 z-40 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowControls(prev => !prev)}
        >
          {/* Centro: Skip -10s | Play/Pause | Skip +10s */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex items-center gap-5 pointer-events-auto">
              {/* -10s */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSeekBackward(e); }}
                className="flex items-center justify-center p-1 transition-all active:scale-90"
                aria-label="Retroceder 10 segundos"
              >
                <div className="relative flex flex-col items-center">
                  <RotateCcw className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={1.5} />
                  <span className="text-[9px] font-bold text-white drop-shadow-lg -mt-0.5">10</span>
                </div>
              </button>
              {/* Play/Pause — rounded rectangle Netflix style */}
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(e); }}
                className="w-14 h-10 bg-white/90 hover:bg-white text-black rounded-lg flex items-center justify-center backdrop-blur-sm transition-all shadow-2xl"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" fill="currentColor" stroke="none" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" fill="currentColor" stroke="none" />
                )}
              </button>
              {/* +10s */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSeekForward(e); }}
                className="flex items-center justify-center p-1 transition-all active:scale-90"
                aria-label="Adelantar 10 segundos"
              >
                <div className="relative flex flex-col items-center">
                  <RotateCw className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={1.5} />
                  <span className="text-[9px] font-bold text-white drop-shadow-lg -mt-0.5">10</span>
                </div>
              </button>
            </div>
          </div>

          {/* Esquina superior izquierda — Fullscreen */}
          <div className="absolute top-3 left-3 pointer-events-auto z-20">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="p-1.5 transition-all active:scale-90"
              aria-label="Pantalla completa"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 text-white drop-shadow-lg" /> : <Maximize className="w-5 h-5 text-white drop-shadow-lg" />}
            </button>
          </div>

          {/* Esquina superior derecha — Volumen + PiP */}
          <div className="absolute top-3 right-3 flex items-center gap-3 pointer-events-auto z-20">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); toggleMuteHandler(e); }}
                className="p-1.5 transition-all active:scale-90"
                aria-label="Volumen"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white drop-shadow-lg" /> : <Volume2 className="w-5 h-5 text-white drop-shadow-lg" />}
              </button>
              {showVolumeSlider && (
                <div
                  className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-sm rounded-xl p-2.5 min-w-[150px] shadow-xl border border-white/10"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <button onClick={toggleMuteHandler} className="text-white/70 hover:text-white flex-shrink-0">
                      {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-1 bg-gray-600/50 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                        [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
                      style={{ background: `linear-gradient(to right, #10B981 ${isMuted ? 0 : volume * 100}%, #4B5563 ${isMuted ? 0 : volume * 100}%)` }}
                    />
                    <span className="text-white/80 text-[10px] font-mono min-w-[28px] text-right">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* PiP button — sin círculo */}
            {pipEnabled && (
              <button
                onClick={(e) => { e.stopPropagation(); togglePictureInPicture(e); }}
                className={`p-1.5 transition-all active:scale-90 ${isPipActive ? 'text-emerald-400' : 'text-white'}`}
                aria-label="Picture in Picture"
              >
                <PictureInPicture2 className="w-5 h-5 drop-shadow-lg" />
              </button>
            )}
          </div>

          {/* Barra inferior — Netflix style: progress + time */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pt-6 pb-3 pointer-events-auto z-20">
            {/* Progress bar — mobile: big touch target + drag seek */}
            <div className="mb-1.5">
              <div
                ref={seekBarRef}
                className="w-full h-[3px] bg-white/20 rounded-full cursor-pointer group/progress relative"
                onClick={handleSeek}
                onTouchStart={handleSeekTouchStart}
                onTouchMove={handleSeekTouchMove}
                onTouchEnd={handleSeekTouchEnd}
                style={{ paddingBottom: '16px', marginBottom: '-16px' }}
              >
                {duration > 0 && (
                  <div className="absolute top-0 left-0 h-[3px] bg-white/30 rounded-full" style={{ width: `${(buffered / duration) * 100}%` }} />
                )}
                <div className="absolute top-0 left-0 h-[3px] bg-emerald-500 rounded-full" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}>
                  {/* Scrubber dot — always visible on mobile, hover on desktop */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.6)] lg:opacity-0 lg:group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            {/* Time row */}
            <div className="flex justify-between text-[11px] text-gray-300 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatRemainingTime(currentTime, duration)}</span>
            </div>
          </div>
        </div>

        {/* ===== CONTROLES DESKTOP (>= 1024px) - SIN CAMBIOS ===== */}
        <div
          className={`hidden lg:block absolute inset-0 transition-opacity duration-300 z-40 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowControls(prev => !prev)}
        >
          {/* ESQUINA SUPERIOR IZQUIERDA - Fullscreen */}
          <div className="absolute top-4 left-4 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>

          {/* ESQUINA SUPERIOR DERECHA - Volumen */}
          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
            <div className="relative">
              <button
                onClick={toggleMuteHandler}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              {showVolumeSlider && (
                <div 
                  className="absolute top-full right-0 mt-3 bg-black/80 backdrop-blur-sm rounded-xl p-3 min-w-[200px] shadow-xl border border-white/10"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <div className="flex items-center gap-3">
                    <button onClick={toggleMuteHandler} className="text-white/70 hover:text-white flex-shrink-0">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-1.5 bg-gray-600/50 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                        [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
                      style={{ background: `linear-gradient(to right, #10B981 ${isMuted ? 0 : volume * 100}%, #4B5563 ${isMuted ? 0 : volume * 100}%)` }}
                    />
                    <span className="text-white/80 text-xs font-mono min-w-[32px] text-right">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTRO - Play/Pause + Seek — Netflix rounded rectangle style */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex items-center gap-6 pointer-events-auto">
              <button onClick={handleSeekBackward} className="w-16 h-16 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110">
                <div className="relative flex items-center justify-center">
                  <RotateCcw className="w-7 h-7" strokeWidth={1.5} />
                  <span className="absolute text-xs font-bold mt-0.5">10</span>
                </div>
              </button>
              <button onClick={(e) => { e.stopPropagation(); togglePlay(e); }} className="w-24 h-16 bg-white/90 hover:bg-white text-black rounded-2xl flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-105 shadow-2xl">
                {isPlaying ? <Pause className="w-10 h-10" fill="currentColor" stroke="none" /> : <Play className="w-10 h-10 ml-1" fill="currentColor" stroke="none" />}
              </button>
              <button onClick={handleSeekForward} className="w-16 h-16 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110">
                <div className="relative flex items-center justify-center">
                  <RotateCw className="w-7 h-7" strokeWidth={1.5} />
                  <span className="absolute text-xs font-bold mt-0.5">10</span>
                </div>
              </button>
            </div>
          </div>

          {/* BARRA INFERIOR */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pointer-events-auto">
            <div className="mb-3">
              <div className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer group/progress relative" onClick={handleSeek}>
                {duration > 0 && <div className="absolute top-0 left-0 h-full bg-white/30 rounded-full" style={{ width: `${(buffered / duration) * 100}%` }} />}
                <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full relative" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-300 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatRemainingTime(currentTime, duration)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }} className="px-3 h-9 bg-black/50 hover:bg-black/70 text-white text-sm font-semibold rounded backdrop-blur-sm transition-all">
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-black/90 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 w-24">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (videoRef.current) { videoRef.current.playbackRate = rate; setPlaybackRate(rate); }
                            setShowSpeedMenu(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 ${playbackRate === rate ? 'bg-emerald-500 text-white' : 'text-white'}`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {(['S', 'M', 'L'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={(e) => { e.stopPropagation(); setVideoSize(size); }}
                      className={`w-9 h-9 text-sm font-semibold rounded backdrop-blur-sm transition-all ${videoSize === size ? 'bg-emerald-500 text-white' : 'bg-black/50 text-gray-300 hover:bg-black/70'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pipEnabled && (
                  <button
                    onClick={togglePictureInPicture}
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 h-9 text-sm rounded backdrop-blur-sm transition-all font-medium ${isPipActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-blue-600/80 hover:bg-blue-700 text-white'}`}
                  >
                    <span className="font-semibold">PiP</span>
                  </button>
                )}
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setShowAdditionalMenu(!showAdditionalMenu); }} className="w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 1 1-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                  {showAdditionalMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 w-40">
                      <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700" onClick={(e) => e.stopPropagation()}>Configuración</button>
                      <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700" onClick={(e) => e.stopPropagation()}>Reportar problema</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de PiP */}
          {isPipActive && (
            <div className="absolute top-20 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse z-30 pointer-events-none">
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