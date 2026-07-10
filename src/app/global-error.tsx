'use client';

// ============================================================
// Global Error Boundary — Catch-all para errores del cliente
// Reemplaza la fea página "Application error" de Next.js
// con una pantalla elegante que permite recuperar la sesión.
// ============================================================

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log silencioso — NO mostrar nada al usuario
    console.error('[GlobalError]', error?.message || error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: '#f8fafb',
          color: '#1e293b',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          {/* Logo / Icono */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>

          {/* Título */}
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 8px',
              lineHeight: 1.3,
            }}
          >
            Academia El Profe
          </h1>

          {/* Mensaje */}
          <p
            style={{
              fontSize: '15px',
              color: '#64748b',
              margin: '0 0 32px',
              lineHeight: 1.5,
            }}
          >
            Hubo un problema al cargar la p&aacute;gina. Por favor, intenta de nuevo.
          </p>

          {/* Botón principal */}
          <button
            onClick={() => {
              // Limpiar cualquier estado corrupto y recargar
              try {
                window.location.href = '/';
              } catch {
                reset();
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background-color 0.15s ease',
            }}
          >
            Volver al inicio
          </button>

          {/* Texto secundario */}
          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '16px',
              marginBbottom: '0',
            }}
          >
            Si el problema persiste, cierra y vuelve a abrir la app del navegador.
          </p>
        </div>
      </body>
    </html>
  );
}