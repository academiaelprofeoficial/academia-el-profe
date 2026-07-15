import type { Metadata } from 'next';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { fetchCMS } from '@/lib/fetchCMS';
import { PAGE_CONTENT_QUERY, ALL_TEAM_QUERY } from '@/lib/sanity.queries';
import type { SanityPageContent, SanityTeamMember } from '@/lib/sanity.client';
import { NosotrosClient } from './NosotrosClient';

// Revalidation handled by on-demand Sanity webhook

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchCMS<SanityPageContent>(PAGE_CONTENT_QUERY('nosotros'));
  return {
    title: cms?.seoTitle || cms?.pageTitle || 'Sobre Nosotros',
    description: cms?.seoDescription || 'Conoce la misión de Academia El Profe Oficial, el equipo detrás de la plataforma educativa para estudiantes de ingeniería en Perú.',
    alternates: { canonical: '/nosotros' },
  };
}

export default async function PaginaNosotros() {
  const [pageContent, teamMembers] = await Promise.all([
    fetchCMS<SanityPageContent>(PAGE_CONTENT_QUERY('nosotros')),
    fetchCMS<SanityTeamMember[]>(ALL_TEAM_QUERY),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
          <NosotrosClient pageContent={pageContent} teamMembers={teamMembers} />
        </div>
      </main>
      <Footer />
    </div>
  );
}