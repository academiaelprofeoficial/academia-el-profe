import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { TemarioPageClient } from './TemarioPageClient';
import { AntiPiracyShell } from '@/components/security/AntiPiracyShell';
import { fetchCMS } from '@/lib/fetchCMS';
import { COURSE_BY_SLUG_QUERY, ALL_COURSES_QUERY, SITE_SETTINGS_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse, SanitySiteSettings } from '@/lib/sanity.client';
import { DASHBOARD_COURSES } from '@/lib/data';
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

  // UTP slugs from DASHBOARD_COURSES + mapping
  const UTP_SLUGS = ['calculo-diferencial', 'calculo-integral', 'ecuaciones-diferenciales', 'calculo-vectorial', 'fisica-1', 'fisica-2', 'estatica', 'mecanica-estatica'];
  const isUTP = UTP_SLUGS.includes(slug);
  const backUrl = isUTP ? '/cursos/utp' : '/cursos#titulo-cursos';

  if (!sanityCourse) {
    // Fallback con datos de DASHBOARD_COURSES para cursos sin CMS
    const courseName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const fallbackCourse = DASHBOARD_COURSES.find((c) => c.id === slug || slug === 'mecanica-estatica' && c.id === 'estatica');
    const pricePEN = fallbackCourse?.price || 80;
    const priceUSD = fallbackCourse?.priceUSD || 22;
    const desc = fallbackCourse?.desc || 'Curso completo con clases grabadas y material descargable.';
    const formula = fallbackCourse?.formula || '📚';
    const whatsapp = siteSettings?.whatsapp || '51999999999';
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <LandingHeader />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-4 md:py-10">
            {/* Back link */}
            <Link href={backUrl} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Volver a {isUTP ? 'cursos UTP' : 'catálogo'}
            </Link>

            {/* Course header */}
            <div className="rounded-2xl p-6 lg:p-8 text-white bg-brand-primary mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-light text-white/90">{formula}</span>
                    <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-lg">Próximamente</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">{courseName}</h1>
                  <p className="text-white/80 text-sm">{desc}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
                    <span className="flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      Clases grabadas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                      Material en PDF
                    </span>
                  </div>
                </div>
                {/* Price card */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 text-center min-w-[200px]">
                  <p className="text-xs text-white/70 mb-1">Precio del curso</p>
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-white">{formatoSoles(pricePEN)}</span>
                    <span className="text-sm text-white/80 font-medium">{formatoUSD(priceUSD)}</span>
                  </div>
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre el curso de ' + courseName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full h-10 text-xs font-bold text-white rounded-lg mt-2 transition-colors"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Topics preview */}
            <div className="rounded-xl border border-border/40 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Contenido del Curso</h2>
              <p className="text-sm text-muted-foreground">
                Este curso estará disponible próximamente con todas las clases, materiales y contenido descargable.
                Mientras tanto, puedes consultar por WhatsApp para más información.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsapp = siteSettings?.whatsapp || '51999999999';
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