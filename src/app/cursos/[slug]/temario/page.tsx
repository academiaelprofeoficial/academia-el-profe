import type { Metadata } from 'next';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { TemarioPageClient } from './TemarioPageClient';
import { AntiPiracyShell } from '@/components/security/AntiPiracyShell';
import { fetchCMS } from '@/lib/fetchCMS';
import { COURSE_BY_SLUG_QUERY, ALL_COURSES_QUERY, SITE_SETTINGS_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse, SanitySiteSettings } from '@/lib/sanity.client';
import { DASHBOARD_COURSES, UTP_COURSES } from '@/lib/data';
import { formatoSoles, formatoUSD } from '@/lib/formato';

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

  // Back link: UTP courses go to /cursos/utp, general to /cursos#titulo-cursos
  const isUTP = slug.includes('utp');
  const backUrl = isUTP ? '/cursos/utp' : '/cursos#titulo-cursos';

  if (!sanityCourse) {
    // Synthetic course from UTP_COURSES or DASHBOARD_COURSES for full temario UI
    const courseName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const fallbackCourse = DASHBOARD_COURSES.find((c) => c.id === slug) || UTP_COURSES.find((c) => c.id === slug);
    const syntheticCourse: SanityCourse = {
      _id: slug,
      title: fallbackCourse?.title || courseName,
      slug,
      description: fallbackCourse?.desc ? [{ _type: 'block', _key: 'desc1', children: [{ _type: 'span', _key: 'desc1s', text: fallbackCourse.desc }], style: 'normal' }] : undefined,
      pricePEN: fallbackCourse?.price || 80,
      priceUSD: fallbackCourse?.priceUSD || 22,
      totalClasses: 0,
      totalHours: '0',
      courseType: 'paid',
      topics: [],
    };
    const whatsapp = siteSettings?.whatsapp || '51922737951';
    const whatsappMsg = siteSettings?.whatsappMessage || 'Hola, quiero información sobre el curso.';
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <AntiPiracyShell />
        <LandingHeader />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-4 md:py-10">
            <TemarioPageClient course={syntheticCourse} whatsapp={whatsapp} whatsappMessage={whatsappMsg} backUrl={backUrl} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsapp = siteSettings?.whatsapp || '51922737951';
  const whatsappMsg = siteSettings?.whatsappMessage || 'Hola, quiero información sobre el curso.';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <AntiPiracyShell />
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-4 md:py-10">
          <TemarioPageClient course={sanityCourse} whatsapp={whatsapp} whatsappMessage={whatsappMsg} backUrl={backUrl} />
        </div>
      </main>
      <Footer />
    </div>
  );
}