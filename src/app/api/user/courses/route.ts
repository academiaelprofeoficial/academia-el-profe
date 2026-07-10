// ============================================================
// GET /api/user/courses?uid=firebaseUid
// Devuelve los cursos COMPRADOS del usuario con detalles completos
// desde Sanity CMS + progreso de cada curso.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPurchasedCourseIds } from '@/lib/purchase-service';
import { sanityClient } from '@/lib/sanity.client';
import { ALL_COURSES_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';

export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Se requiere uid.' }, { status: 400 });
    }

    // 1. Obtener IDs de cursos comprados + accesos manuales
    let purchasedIds: string[] = [];
    try {
      purchasedIds = await getPurchasedCourseIds(uid);
    } catch {}

    let manualIds: string[] = [];
    try {
      const manualAccesses = await db.courseAccess.findMany({
        where: { userId: uid, isActive: true },
        select: { courseId: true },
      });
      manualIds = manualAccesses.map((a) => a.courseId);
    } catch {}

    const allAccessIds = [...new Set([...purchasedIds, ...manualIds])];

    // Si es owner con acceso total, no filtramos por IDs
    const isAllAccess = allAccessIds.includes('__ALL_COURSES__');

    // 2. Obtener TODOS los cursos de Sanity
    const allCourses: SanityCourse[] = await sanityClient.fetch(ALL_COURSES_QUERY);

    // 3. Filtrar solo los comprados (o todos si es owner)
    const userCourses = isAllAccess
      ? allCourses
      : allCourses.filter((c) => allAccessIds.includes(c.slug));

    // 4. Obtener progreso para cada curso comprado
    const coursesWithProgress = await Promise.all(
      userCourses.map(async (course) => {
        let progressSummary: {
          totalTemas: number;
          completedTemas: number;
          percentage: number;
          totalWatchTime: number;
          totalWatchTimeFormatted: string;
        } | null = null;

        try {
          const progressRecords = await db.courseProgress.findMany({
            where: { userId: uid, courseId: course.slug },
          });
          const total = progressRecords.length;
          const completedCount = progressRecords.filter((r) => r.completed).length;
          const totalWatchTime = progressRecords.reduce((sum, r) => sum + r.watchTime, 0);

          progressSummary = {
            totalTemas: total,
            completedTemas: completedCount,
            percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
            totalWatchTime,
            totalWatchTimeFormatted: formatWatchTime(totalWatchTime),
          };
        } catch {}

        return {
          _id: course._id,
          title: course.title,
          slug: course.slug,
          coverImage: course.coverImage,
          description: course.description,
          professor: course.professor,
          topics: course.topics,
          pricePEN: course.pricePEN,
          priceUSD: course.priceUSD,
          totalClasses: course.totalClasses,
          totalHours: course.totalHours,
          level: course.level,
          courseType: course.courseType,
          progress: progressSummary,
        };
      })
    );

    return NextResponse.json({
      courses: coursesWithProgress,
      purchasedCourseIds: allAccessIds,
      totalCourses: coursesWithProgress.length,
    });
  } catch (error) {
    console.error('[UserCourses] Error:', error);
    return NextResponse.json({ error: 'Error al obtener cursos.' }, { status: 500 });
  }
}

function formatWatchTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}