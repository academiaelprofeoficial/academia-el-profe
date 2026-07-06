import type { MetadataRoute } from 'next';

// ============================================================
// Web Manifest PWA — Academia El Profe Oficial
// ============================================================
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Academia El Profe Oficial',
    short_name: 'El Profe',
    description:
      'Plataforma educativa de refuerzo académico para estudiantes de ingeniería de la UTP.',
    start_url: '/',
    display: 'standalone',
    background_color: '#003300',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/pwa-icon-192.webp',
        sizes: '192x192',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-512.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}