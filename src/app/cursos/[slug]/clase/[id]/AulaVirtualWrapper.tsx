'use client';

// ============================================================
// AulaVirtualWrapper — Envuelve AulaVirtualClient con CourseAccessGuard
// Verifica que el usuario haya comprado el curso.
// ============================================================

import { CourseAccessGuard } from '@/components/course/CourseAccessGuard';
import { AulaVirtualClient } from './AulaVirtualClient';

interface AulaVirtualWrapperProps {
  readonly slug: string;
  readonly id: string;
  readonly courseTitle: string;
}

export function AulaVirtualWrapper({ slug, id, courseTitle }: AulaVirtualWrapperProps) {
  return (
    <CourseAccessGuard courseId={slug} courseTitle={courseTitle}>
      <AulaVirtualClient slug={slug} id={id} />
    </CourseAccessGuard>
  );
}