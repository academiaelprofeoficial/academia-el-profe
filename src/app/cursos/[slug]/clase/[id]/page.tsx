import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { fetchCMS } from '@/lib/fetchCMS';
import { COURSE_BY_SLUG_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';
import { LeccionClient } from '../../lecciones/[videoOrder]/LeccionClient';

// ============================================================
// Aula Virtual — Página de Clase (LEGACY ROUTE)
// Now redirects to CMS-driven lesson pages when possible.
// Falls back to a basic view for backward compat.
// ============================================================

interface PageProps {
  readonly params: Promise<{ slug: string; id: string }>;
}

export default async function PaginaAulaVirtual({ params }: PageProps) {
  const { slug, id } = await params;

  // Try to find the course in CMS
  const sanityCourse = await fetchCMS<SanityCourse>(COURSE_BY_SLUG_QUERY(slug));

  if (!sanityCourse) {
    notFound();
  }

  // Try to match the old id format (e.g., "pc1-1") to a CMS video
  // Old format: {evalId}-{temaNum} → find first video as fallback
  const firstVideo = sanityCourse.classVideos?.[0];

  if (firstVideo && firstVideo.order !== undefined) {
    // Redirect to new CMS-driven lesson page
    redirect(`/cursos/${slug}/lecciones/${firstVideo.order}`);
  }

  // If no videos in CMS, show a message
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{sanityCourse.title}</h1>
          <p className="text-muted-foreground mb-6">
            El contenido de esta clase esta siendo actualizado. Visita el temario para ver todo el contenido disponible.
          </p>
          <a
            href={`/cursos/${slug}/temario`}
            className="inline-flex items-center gap-2 text-brand-primary hover:underline font-medium"
          >
            Ver temario completo
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}