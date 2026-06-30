import type { Metadata } from 'next';
import { fetchCMS } from '@/lib/fetchCMS';
import { ALL_COURSES_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';
import { CursosUTPPageClient } from './CursosUTPPageClient';

export const metadata: Metadata = {
  title: 'Cursos UTP — Academia El Profe Oficial',
  description: 'Cursos exclusivos para estudiantes de la Universidad Tecnológica del Perú (UTP). Cálculo, Física, Estática y más.',
  alternates: { canonical: '/cursos/utp' },
};

export default async function CursosUTPPage() {
  const sanityCourses = await fetchCMS<SanityCourse[]>(ALL_COURSES_QUERY);
  return <CursosUTPPageClient sanityCourses={sanityCourses} />;
}
