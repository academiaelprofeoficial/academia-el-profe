import { ImageResponse } from 'next/og';
import type { MetadataRoute } from 'next';

// ============================================================
// Apple Touch Icon — Next.js 15 ImageResponse API
// ============================================================
export const runtime = 'edge';
export const alt = 'Academia El Profe Oficial';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function appleIcon(): ImageResponse {
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
          borderRadius: '22%',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
    ),
    {
      width: 180,
      height: 180,
    }
  );
}