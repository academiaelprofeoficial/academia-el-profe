import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { TemarioPageClient } from './TemarioPageClient';
import { fetchCMS } from '@/lib/fetchCMS';
import { COURSE_BY_SLUG_QUERY, ALL_COURSES_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse, SanitySiteSettings } from '@/lib/sanity.client';
import { SITE_SETTINGS_QUERY } from '@/lib/sanity.queries';

// ============================================================
// Temario del Curso — Server Component (100% CMS-driven)
// Fetches course data from Sanity only. No mock fallbacks.
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
    title: `Temario — ${title} | Academia El Profe Oficial`,
    description: desc || `Consulta el temario completo de ${title}. Videos, materiales y contenido descargable.`,
    openGraph: {
      title: `Temario — ${title} | Academia El Profe Oficial`,
      description: desc,
      type: 'article',
    },
    alternates: {
      canonical: `/cursos/${slug}/temario`,
    },
  };
}

export default async function TemarioPage({ params }: PageProps) {
  const { slug } = await params;
  const [sanityCourse, siteSettings] = await Promise.all([
    fetchCMS<SanityCourse>(COURSE_BY_SLUG_QUERY(slug)),
    fetchCMS<SanitySiteSettings>(SITE_SETTINGS_QUERY),
  ]);

  if (!sanityCourse) {
    notFound();
  }

  const whatsapp = siteSettings?.whatsapp || '51999999999';
  const whatsappMsg = siteSettings?.whatsappMessage || 'Hola, quiero información sobre el curso.';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-4 md:py-10">
          <TemarioPageClient course={sanityCourse} whatsapp={whatsapp} whatsappMessage={whatsappMsg} />
        </div>
      </main>
      <Footer />
    </div>
  );
}