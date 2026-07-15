'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Algo salió mal
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Ocurrió un error inesperado. Por favor, intenta recargar la página.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="h-10 px-6 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="h-10 px-6 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
        {error.digest && (
          <p className="text-xs text-slate-400 mt-2">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}