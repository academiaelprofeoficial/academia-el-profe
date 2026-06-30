import { ImageResponse } from 'next/og';
import type { MetadataRoute } from 'next';

// ============================================================
// Favicon dinámico — Next.js 15 ImageResponse API
// Genera el favicon en tiempo de build. Sin archivos externos.
// ============================================================
export const runtime = 'edge';
export const alt = 'Academia El Profe Oficial';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#10b981',
          borderRadius: '20%',
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  );
}