'use client';

// ============================================================
// useGlobalRecordingDetection — Hook GLOBAL de detección de
// grabación de pantalla.
//
// SINGLETON: una sola instancia para toda la app.
// Detecta:
//   - getDisplayMedia (PC: Chrome, Edge, Firefox)
//   - MediaRecorder (móvil Android/iOS y PC)
//
// Cuando se detecta grabación:
//   - isRecording = true
//   - El video se renderiza NEGRO en el canvas
//   - El audio del video sigue reproduciéndose
//   - NO se agregan iconos, textos ni elementos visuales
// ============================================================

import { useState, useEffect, useCallback } from 'react';

// --- Estado singleton (module-level, compartido entre todos los componentes) ---
let globalIsRecording = false;
const listeners = new Set<(state: boolean) => void>();

function notifyAll() {
  listeners.forEach((fn) => fn(globalIsRecording));
}

let interceptorInstalled = false;

export function useGlobalRecordingDetection(): { isRecording: boolean } {
  const [isRecording, setIsRecording] = useState(globalIsRecording);

  useEffect(() => {
    const listener = (state: boolean) => setIsRecording(state);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const setRecordingState = useCallback((state: boolean) => {
    globalIsRecording = state;
    document.body.classList.toggle('screen-recording-active', state);
    notifyAll();
  }, []);

  useEffect(() => {
    if (interceptorInstalled) return;
    interceptorInstalled = true;

    // 1. Interceptar getDisplayMedia (PC — Chrome, Edge, Firefox)
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;
    if (originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async function (constraints) {
        try {
          const stream = await originalGetDisplayMedia.call(this, constraints);
          setRecordingState(true);

          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            const handleEnded = () => setRecordingState(false);
            videoTrack.addEventListener('ended', handleEnded);
          }

          return stream;
        } catch {
          // Usuario canceló la selección de pantalla
          throw new Error('User cancelled');
        }
      };
    }

    // 2. Parchar MediaRecorder (móvil Android/iOS y PC)
    const OriginalMediaRecorder = window.MediaRecorder;
    if (OriginalMediaRecorder && !(OriginalMediaRecorder as any).__patched) {
      const PatchedMediaRecorder = function (
        stream: MediaStream,
        options?: MediaRecorderOptions
      ) {
        setRecordingState(true);

        const recorder = new OriginalMediaRecorder(stream, options);

        const originalStop = recorder.stop.bind(recorder);
        recorder.stop = () => {
          setRecordingState(false);
          return originalStop();
        };

        // También detectar cuando todas las tracks terminan
        stream.getTracks().forEach((track) => {
          const originalStopTrack = track.stop.bind(track);
          track.stop = () => {
            originalStopTrack();
            // Verificar si quedan tracks activas
            if (stream.getTracks().every((t) => t.readyState === 'ended')) {
              setRecordingState(false);
            }
          };
        });

        return recorder;
      } as unknown as typeof OriginalMediaRecorder;

      (PatchedMediaRecorder as any).__patched = true;
      (PatchedMediaRecorder as any).isTypeSupported =
        OriginalMediaRecorder.isTypeSupported?.bind(OriginalMediaRecorder);

      window.MediaRecorder = PatchedMediaRecorder;
    }

    return () => {
      // No removemos los interceptores al desmontar (son globales)
    };
  }, [setRecordingState]);

  return { isRecording };
}
