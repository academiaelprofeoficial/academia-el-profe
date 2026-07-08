'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface SecureVideoProps {
  src: string;
  poster?: string;
  title?: string;
  onTimeUpdate?: () => void;
  progressKey?: string;
}

export function SecureVideo({ src, poster, title, onTimeUpdate, progressKey }: SecureVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBlackedOut, setIsBlackedOut] = useState(false);

  // Restore progress
  useEffect(() => {
    if (!videoRef.current || !progressKey) return;
    const saved = localStorage.getItem(`vid_progress_${progressKey}`);
    if (saved) {
      videoRef.current.currentTime = parseFloat(saved);
    }
  }, [progressKey]);

  // Save progress
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && progressKey) {
      localStorage.setItem(`vid_progress_${progressKey}`, String(videoRef.current.currentTime));
    }
    onTimeUpdate?.();
  }, [progressKey, onTimeUpdate]);

  // Anti-recording: detect screen capture via visibility + blur
  useEffect(() => {
    let blurTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleVisibility = () => {
      if (document.hidden) {
        blurTimeout = setTimeout(() => setIsBlackedOut(true), 200);
      } else {
        if (blurTimeout) clearTimeout(blurTimeout);
        setTimeout(() => setIsBlackedOut(false), 100);
      }
    };

    const handleBlur = () => {
      blurTimeout = setTimeout(() => setIsBlackedOut(true), 300);
    };

    const handleFocus = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      setTimeout(() => setIsBlackedOut(false), 100);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        setIsBlackedOut(true);
        setTimeout(() => setIsBlackedOut(false), 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, []);

  const handlePlay = () => {
    videoRef.current?.play().catch(() => {});
  };

  return (
    <div
      className="relative bg-black aspect-video rounded-lg overflow-hidden cursor-pointer"
      onContextMenu={(e) => e.preventDefault()}
      onClick={handlePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        preload="metadata"
        playsInline
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onClick={(e) => e.stopPropagation()}
        style={{ display: isBlackedOut ? 'none' : 'block' }}
      />

      {/* Black overlay when recording detected */}
      {isBlackedOut && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
          <div className="text-center px-6">
            <svg className="w-10 h-10 mx-auto mb-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-white/70 text-sm font-medium">Contenido protegido</p>
            <p className="text-white/40 text-xs mt-1">No está permitida la captura de pantalla</p>
          </div>
        </div>
      )}

      {/* Title overlay at bottom */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 z-10 pointer-events-none">
          <p className="text-white text-xs font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  );
}
