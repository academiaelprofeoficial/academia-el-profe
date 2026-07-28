import type { Metadata } from 'next';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { LibroReclamacionesClient } from './LibroReclamacionesClient';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones Virtual | Academia El Profe Oficial',
  description: 'Libro de Reclamaciones Virtual conforme a las disposiciones del INDECOPI.',
};

export default function LibroReclamacionesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20 mt-16">
        <div className="space-y-4 mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Libro de Reclamaciones Virtual
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conforme a las disposiciones del INDECOPI, ponemos a tu disposición este formulario para registrar cualquier queja o reclamo sobre nuestros servicios.
          </p>
        </div>

        <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-6 md:p-10">
          <LibroReclamacionesClient />
        </div>
      </main>

      <Footer />
    </div>
  );
}
