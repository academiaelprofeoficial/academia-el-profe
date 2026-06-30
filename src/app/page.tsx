import type { Metadata } from 'next';
import { HomepageClient } from './HomepageClient';
import { fetchCMS } from '@/lib/fetchCMS';
import {
  ALL_HERO_SLIDES_QUERY,
  ALL_STATS_QUERY,
  ALL_PARTNERS_QUERY,
  ALL_TESTIMONIALS_QUERY,
  SITE_SETTINGS_QUERY,
} from '@/lib/sanity.queries';
import type { SanityHeroSlide, SanityStat, SanityPartner, SanityTestimonial, SanitySiteSettings } from '@/lib/sanity.client';

// ============================================================
// Metadatos SEO — Página de Inicio (Landing)
// ============================================================
export const metadata: Metadata = {
  title: 'Cursos Exclusivos para Estudiantes de Ingeniería',
  description:
    'Descubre nuestro catálogo de cursos de Cálculo, Mecánica Clásica, Fluidos, Termodinámica, Estadística y más. Diseñados para estudiantes de la UTP y universidades de ingeniería en Perú.',
  alternates: {
    canonical: '/',
  },
};

// Revalidation handled by on-demand Sanity webhook (no timed revalidation)

async function getSanityData() {
  try {
    const [heroSlides, stats, partners, testimonials, siteSettings] = await Promise.all([
      fetchCMS<SanityHeroSlide[]>(ALL_HERO_SLIDES_QUERY),
      fetchCMS<SanityStat[]>(ALL_STATS_QUERY),
      fetchCMS<SanityPartner[]>(ALL_PARTNERS_QUERY),
      fetchCMS<SanityTestimonial[]>(ALL_TESTIMONIALS_QUERY),
      fetchCMS<SanitySiteSettings>(SITE_SETTINGS_QUERY),
    ]);
    return { heroSlides, stats, partners, testimonials, siteSettings };
  } catch {
    return { heroSlides: null, stats: null, partners: null, testimonials: null, siteSettings: null };
  }
}

export default async function PaginaInicio() {
  const sanityData = await getSanityData();
  return <HomepageClient sanityData={sanityData} />;
}