'use client';

// ============================================================
// VideoPlayer — Reproductor de video profesional
// Soporta: archivos subidos a Sanity (MP4/MOV/WebM),
//          YouTube y Vimeo (iframe).
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showAdditionalMenu, setShowAdditionalMenu] = useState(false);

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

  // Detectar fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

    // Click en el video - Play/Pause + Seek
    const handleVideoClick = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
      const video = videoRef.current;
      if (!video) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;

      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        if (Math.abs((video.currentTime / duration) - percentage) > 0.05) {
          video.currentTime = newTime;
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    }, [duration]);

    const handleVideoTouch = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
      e.preventDefault(); // Prevent double triggering with click
      const touch = e.changedTouches[0];
      const video = videoRef.current;
      if (!video) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;

      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        if (Math.abs((video.currentTime / duration) - percentage) > 0.05) {
          video.currentTime = newTime;
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    }, [duration]);

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
        onMouseMove={resetControlsTimer}
        onTouchStart={resetControlsTimer}
        onClick={resetControlsTimer}
        onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer"
          playsInline
          preload="metadata"
          onClick={handleVideoClick}
          onTouchEnd={handleVideoTouch}
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

        {/* Controles Estilo Netflix */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 z-40 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* ESQUINA SUPERIOR IZQUIERDA - Fullscreen */}
          <div className="absolute top-4 left-4 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* ESQUINA SUPERIOR DERECHA - Volumen */}
          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
            <div className="relative">
              <button
                onClick={toggleMuteHandler}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
              
              {/* Slider de volumen */}
              {showVolumeSlider && (
                <div 
                  className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-2"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* CENTRO - Controles principales */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
              {/* Seek -10s */}
              <button
                onClick={handleSeekBackward}
                className="w-14 h-14 sm:w-16 sm:h-16 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110"
              >
                <div className="relative flex items-center justify-center">
                  <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
                  <span className="absolute text-[10px] sm:text-xs font-bold mt-0.5">10</span>
                </div>
              </button>

              {/* Play/Pause */}
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(e); }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110 shadow-2xl"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" stroke="none" />
                ) : (
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 sm:ml-2" fill="currentColor" stroke="none" />
                )}
              </button>

              {/* Seek +10s */}
              <button
                onClick={handleSeekForward}
                className="w-14 h-14 sm:w-16 sm:h-16 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110"
              >
                <div className="relative flex items-center justify-center">
                  <RotateCw className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
                  <span className="absolute text-[10px] sm:text-xs font-bold mt-0.5">10</span>
                </div>
              </button>
            </div>
          </div>

          {/* BARRA INFERIOR - Progress + Controles adicionales */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 pointer-events-auto">
            {/* Barra de progreso */}
            <div className="mb-3">
              <div 
                className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer group/progress relative"
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
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full relative"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-300 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controles adicionales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
              </div>

              {/* ESQUINA INFERIOR DERECHA - PiP + Menú */}
              <div className="flex items-center gap-2">
                
                {/* Velocidad */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                    className="px-3 h-8 sm:h-9 bg-black/50 hover:bg-black/70 text-white text-xs sm:text-sm font-semibold rounded backdrop-blur-sm transition-all"
                  >
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 w-24">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={(e) => {
                            e.stopPropagation();
                            const v = videoRef.current;
                            if (v) {
                              v.playbackRate = rate;
                              setPlaybackRate(rate);
                            }
                            setShowSpeedMenu(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-700 ${
                            playbackRate === rate ? 'bg-emerald-500 text-white' : 'text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tamaño */}
                <div className="hidden sm:flex gap-1">
                  {(['S', 'M', 'L'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={(e) => { e.stopPropagation(); setVideoSize(size); }}
                      className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-semibold rounded backdrop-blur-sm transition-all ${
                        videoSize === size
                          ? 'bg-emerald-500 text-white'
                          : 'bg-black/50 text-gray-300 hover:bg-black/70'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {pipEnabled && (
                  <button
                    onClick={togglePictureInPicture}
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 h-8 sm:h-9 text-xs sm:text-sm rounded backdrop-blur-sm transition-all font-medium touch-manipulation ${
                      isPipActive 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                        : 'bg-blue-600/80 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span className="font-semibold">PiP</span>
                  </button>
                )}

                {/* Menú adicional (Opcional, lo pidió el cliente) */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAdditionalMenu(!showAdditionalMenu); }}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                  
                  {showAdditionalMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 w-40">
                      <button className="w-full px-4 py-2 text-left text-xs sm:text-sm text-white hover:bg-gray-700" onClick={(e) => e.stopPropagation()}>
                        Configuración
                      </button>
                      <button className="w-full px-4 py-2 text-left text-xs sm:text-sm text-white hover:bg-gray-700" onClick={(e) => e.stopPropagation()}>
                        Reportar problema
                      </button>
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
} 
 