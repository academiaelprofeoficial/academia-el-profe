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
    background_color: '#ffffff',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}