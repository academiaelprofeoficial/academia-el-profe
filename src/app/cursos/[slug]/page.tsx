import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { DetalleCursoClient } from './DetalleCursoClient';
import { fetchCMS } from '@/lib/fetchCMS';
import { ALL_COURSES_QUERY, COURSE_BY_SLUG_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';

// ============================================================
// Course Detail Page — Server Component (100% CMS-driven)
// No mock data. Fetches everything from Sanity.
// ============================================================

interface PageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { getClientForDraft } = await import('@/lib/sanity.client');
    const client = getClientForDraft(false);
    if (client) {
      const courses = await client.fetch<Array<{ slug: string }>>(ALL_COURSES_QUERY);
      if (courses?.length) return courses.map((c) => ({ slug: c.slug }));
    }
  } catch {}
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sanityCourse = await fetchCMS<SanityCourse>(COURSE_BY_SLUG_QUERY(slug));

  const title = sanityCourse?.title || 'Curso no encontrado';
  const desc = sanityCourse?.description
    ? sanityCourse.description.map(b => b._type === 'block' && b.children ? b.children.map(c => c.text).join('') : '').join(' ').slice(0, 160)
    : '';

  return {
    title,
    description: desc || `Curso de ${title} en Academia El Profe Oficial.`,
    openGraph: { title: `${title} | Academia El Profe Oficial`, description: desc, type: 'article' },
    alternates: { canonical: `/cursos/${slug}` },
  };
}

export default async function PaginaDetalleCurso({ params }: PageProps) {
  const { slug } = await params;
  const sanityCourse = await fetchCMS<SanityCourse>(COURSE_BY_SLUG_QUERY(slug));

  if (!sanityCourse) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
          <DetalleCursoClient course={sanityCourse} />
        </div>
      </main>
      <Footer />
    </div>
  );
}