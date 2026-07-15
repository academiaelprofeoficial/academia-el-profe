'use client';

import { usePathname } from 'next/navigation';
import { Video, Square } from 'lucide-react';
import { useScreenRecorder } from '@/hooks/useScreenRecorder';

// ============================================================
// ScreenRecordButton — Botón flotante de grabación de pantalla
//
// - Solo se renderiza en páginas de curso (/cursos/[slug]/...)
// - Verde (listo) → Rojo pulsante (grabando)
// - Fijo en la esquina inferior derecha
// - Al iniciar: protege videos con overlay negro
// - Al detener: descarga automáticamente el archivo .webm
// ============================================================

export function ScreenRecordButton() {
  const pathname = usePathname();
  const { isRecording, startRecording, stopRecording } = useScreenRecorder();

  // Solo mostrar en sub-páginas de curso (no en el catálogo /cursos)
  const isCoursePage = pathname.startsWith('/cursos/');

  const handleToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
      } catch {
        alert(
          'No se pudo iniciar la grabacion. Asegurate de seleccionar la pestana actual y dar permisos al navegador.'
        );
      }
    }
  };

  if (!isCoursePage) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className={
        `fixed bottom-20 right-5 z-[10002] w-14 h-14 rounded-full ` +
        `shadow-2xl transition-all duration-200 flex items-center justify-center ` +
        `outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black ` +
        `${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40'
            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
        }`
      }
      title={
        isRecording
          ? 'Detener grabacion de pantalla'
          : 'Iniciar grabacion de pantalla'
      }
      aria-label={
        isRecording
          ? 'Detener grabacion de pantalla'
          : 'Iniciar grabacion de pantalla'
      }
    >
      {isRecording ? (
        <div className="relative flex items-center justify-center">
          <Square className="w-5 h-5 text-white fill-white" />
          {/* Anillo pulsante rojo */}
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
        </div>
      ) : (
        <Video className="w-6 h-6 text-white" />
      )}
    </button>
  );
}

export default ScreenRecordButton;