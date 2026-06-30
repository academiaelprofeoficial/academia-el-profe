import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { LeccionClient } from './LeccionClient';
import { fetchCMS } from '@/lib/fetchCMS';
import { COURSE_BY_SLUG_QUERY, ALL_COURSES_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';

// ============================================================
// Lesson Page — Server Component (100% CMS-driven)
// Shows a specific video lesson with its materials from CMS.
// Route: /cursos/[slug]/lecciones/[videoOrder]
// ============================================================

interface PageProps {
  readonly params: Promise<{ slug: string; videoOrder: string }>;
}

export async function generateStaticParams() {
  try {
    const { getClientForDraft } = await import('@/lib/sanity.client');
    const client = getClientForDraft(false);
    if (client) {
      const courses = await client.fetch<Array<{ slug: string }>>(ALL_COURSES_QUERY);
      const params: Array<{ slug: string; videoOrder: string }> = [];
      for (const course of courses) {
        const full = await client.fetch<SanityCourse | null>(
          `*[_type == "course" && slug.current == "${course.slug}"][0] { topics[] { classVideos[] { order } } }`
        );
        if (full?.topics) {
          for (const topic of full.topics) {
            if (topic.classVideos) {
              for (const v of topic.classVideos) {
                if (v.order !== undefined) {
                  params.push({ slug: course.slug, videoOrder: String(v.order) });
                }
              }
            }
          }
        }
      }
      return params;
    }
  } catch {}
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, videoOrder } = await params;
  const sanityCourse = await fetchCMS<SanityCourse>(COURSE_BY_SLUG_QUERY(slug));

  // Find video from nested topics
  const allVideos = (sanityCourse?.topics || []).flatMap((t) => t.classVideos || []);
  const video = allVideos.find((v) => String(v.order) === videoOrder);
  const title = video?.title || sanityCourse?.title || 'Clase';
  const courseTitle = sanityCourse?.title || 'Curso';

  return {
    title: `${title} — ${courseTitle} | Academia El Profe Oficial`,
    description: video?.description || `Clase: ${title} del curso ${courseTitle}. Academia El Profe Oficial.`,
    openGraph: {
      title: `${title} — ${courseTitle}`,
      description: video?.description || `Aula virtual — Academia El Profe Oficial`,
      type: 'article',
    },
    alternates: {
      canonical: `/cursos/${slug}/lecciones/${videoOrder}`,
    },
  };
}

export default async function LeccionPage({ params }: PageProps) {
  const { slug, videoOrder } = await params;
  const sanityCourse = await fetchCMS<SanityCourse>(COURSE_BY_SLUG_QUERY(slug));

  if (!sanityCourse) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LeccionClient course={sanityCourse} videoOrder={videoOrder} />
        </div>
      </main>
      <Footer />
    </div>
  );
}