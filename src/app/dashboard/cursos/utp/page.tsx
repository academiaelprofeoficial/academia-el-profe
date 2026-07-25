import type { Metadata } from 'next';
import { fetchCMS } from '@/lib/fetchCMS';
import { ALL_COURSES_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';
import { DashboardUTPPageClient } from './CursosUTPDashboardClient';

export const metadata: Metadata = {
  title: 'Cursos UTP — Dashboard',
  description: 'Panel de cursos UTP',
};

export default async function DashboardUTPPage() {
  const sanityCourses = await fetchCMS<SanityCourse[]>(ALL_COURSES_QUERY);
  return <DashboardUTPPageClient sanityCourses={sanityCourses} />;
}
