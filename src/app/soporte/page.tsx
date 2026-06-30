import type { Metadata } from 'next';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { fetchCMS } from '@/lib/fetchCMS';
import { PAGE_CONTENT_QUERY } from '@/lib/sanity.queries';
import type { SanityPageContent } from '@/lib/sanity.client';
import { SoporteClient } from './SoporteClient';

// Revalidation handled by on-demand Sanity webhook

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchCMS<SanityPageContent>(PAGE_CONTENT_QUERY('soporte'));
  return {
    title: cms?.seoTitle || cms?.pageTitle || 'Soporte y Ayuda',
    description: cms?.seoDescription || '¿Necesitas ayuda con tu cuenta, un curso o un pago? Contacta al equipo de soporte de Academia El Profe Oficial.',
    alternates: { canonical: '/soporte' },
  };
}

export default async function PaginaSoporte() {
  const pageContent = await fetchCMS<SanityPageContent>(PAGE_CONTENT_QUERY('soporte'));

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
          <SoporteClient pageContent={pageContent} />
        </div>
      </main>
      <Footer />
    </div>
  );
}