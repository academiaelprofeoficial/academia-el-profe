import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { TemarioPageClient } from './TemarioPageClient';
import { AntiPiracyShell } from '@/components/security/AntiPiracyShell';
import { fetchCMS } from '@/lib/fetchCMS';
import { COURSE_BY_SLUG_QUERY, ALL_COURSES_QUERY, SITE_SETTINGS_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse, SanitySiteSettings } from '@/lib/sanity.client';

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
    // Fallback friendly para cursos no creados en CMS (CÁLCULO VECTORIAL, FÍSICA 1, FÍSICA 2)
    const courseName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const whatsapp = siteSettings?.whatsapp || '51999999999';
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <LandingHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{courseName}</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Este curso está en preparación. Pronto estará disponible con todas las clases, materiales y contenido descargable.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre el curso de ' + courseName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20bd5a] transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Consultar por WhatsApp
              </a>
              <Link href="/cursos" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border/40 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Volver al catálogo
              </Link>
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
          <TemarioPageClient course={sanityCourse} whatsapp={whatsapp} whatsappMessage={whatsappMsg} />
        </div>
      </main>
      <Footer />
    </div>
  );
}