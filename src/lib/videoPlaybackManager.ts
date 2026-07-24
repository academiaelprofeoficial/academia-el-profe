// src/lib/videoPlaybackManager.ts
// =====================================================================
// Global Video Playback Manager — iOS Hardware Decoder Fix
// =====================================================================
// iOS Safari limits concurrent hardware video decoders to ~3.
// If more than ~3 <video> elements are alive simultaneously (even paused),
// subsequent ones render as black frames.
//
// Strategy:
//   1. Every mounted VideoPlayer registers itself here.
//   2. When a video fires "play", ALL other registered videos are immediately
//      paused AND fully released (src removed + load()) so their hardware
//      decoder slots are freed before the new one claims one.
//   3. On unmount, the video is unregistered and its decoder is released.
// =====================================================================

type VideoEntry = {
  video: HTMLVideoElement;
  originalSrc: string;
  originalWebm?: string;
};

const registry = new Map<HTMLVideoElement, VideoEntry>();

/**
 * Call this in useEffect after the video element mounts.
 * @param video  The HTMLVideoElement
 * @param src    The primary video src (mp4 / mov)
 * @param webm   Optional webm src
 */
export function registerVideo(
  video: HTMLVideoElement,
  src: string,
  webm?: string,
) {
  if (!video || !src) return;

  // Store original src for potential restore
  registry.set(video, { video, originalSrc: src, originalWebm: webm });

  // Listen for play event — free all other decoders when this one plays
  const onPlay = () => {
    registry.forEach((entry, other) => {
      if (other === video) return;
      if (!other.paused) {
        other.pause();
      }
      // Release the hardware decoder completely
      _releaseDecoder(other);
    });
  };

  (video as any).__vpmOnPlay = onPlay;
  video.addEventListener('play', onPlay);
}

/**
 * Call this in the useEffect cleanup (component unmount).
 */
export function unregisterVideo(video: HTMLVideoElement) {
  if (!video) return;

  const listener = (video as any).__vpmOnPlay;
  if (listener) {
    video.removeEventListener('play', listener);
    delete (video as any).__vpmOnPlay;
  }

  // Release this video's decoder on unmount
  _releaseDecoder(video);
  registry.delete(video);
}

/**
 * Fully releases a video element's hardware decoder.
 * Safe to call multiple times.
 */
function _releaseDecoder(video: HTMLVideoElement) {
  try {
    if (!video.paused) {
      video.pause();
    }
    // Removing src + calling load() tells the browser to tear down the decoder
    video.removeAttribute('src');
    video.src = ''; // CRITICAL: Clear the property because we set it imperatively
    // Remove <source> children too
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    video.load();
  } catch {
    // Silently ignore — may already be detached from DOM
  }
}
