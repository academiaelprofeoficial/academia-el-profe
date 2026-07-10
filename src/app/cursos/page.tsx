import type { Metadata } from 'next';
import { fetchCMS } from '@/lib/fetchCMS';
import { ALL_COURSES_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';
import { CursosPageClient } from './CursosPageClient';

export const metadata: Metadata = {
  title: 'Catálogo de Cursos',
  description: 'Explora todos los cursos de Academia El Profe Oficial: Cálculo Diferencial, Cálculo Integral, Ecuaciones Diferenciales, Física, Estática y más.',
  alternates: { canonical: '/cursos' },
};

export default async function PaginaCursos() {
  const sanityCourses = await fetchCMS<SanityCourse[]>(ALL_COURSES_QUERY);
  return <CursosPageClient sanityCourses={sanityCourses} />;
}