// ============================================================
// POST /api/progress
// Registra progreso de visualización de clase.
// Body: { userId, courseId, temaId, completed, watchTime, lastPos }
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, temaId, completed, watchTime, lastPos } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Faltan userId y courseId.' }, { status: 400 });
    }

    // Upsert por la unique constraint [userId, courseId, temaId]
    const temaKey = temaId || '__general__';

    // SQLite doesn't support the compound unique upsert well with nulls,
    // so we use a findFirst + create/update pattern
    const existing = await db.courseProgress.findFirst({
      where: { userId, courseId, temaId: temaId || null },
    });

    if (existing) {
      const progress = await db.courseProgress.update({
        where: { id: existing.id },
        data: {
          completed: completed !== undefined ? completed : existing.completed,
          watchTime: watchTime !== undefined ? watchTime : existing.watchTime,
          lastPos: lastPos !== undefined ? lastPos : existing.lastPos,
        },
      });
      return NextResponse.json({ success: true, progress });
    }

    const progress = await db.courseProgress.create({
      data: {
        userId,
        courseId,
        temaId: temaId || null,
        completed: completed ?? false,
        watchTime: watchTime ?? 0,
        lastPos: lastPos ?? null,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('[Progress] Error:', error);
    return NextResponse.json({ error: 'Error al guardar progreso.' }, { status: 500 });
  }
}

// GET /api/progress?userId=xxx&courseId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
    }

    const progressRecords = await db.courseProgress.findMany({
      where: { userId, courseId },
    });

    const total = progressRecords.length;
    const completedCount = progressRecords.filter((r) => r.completed).length;
    const totalWatchTime = progressRecords.reduce((sum, r) => sum + r.watchTime, 0);

    return NextResponse.json({
      records: progressRecords,
      summary: {
        totalTemas: total,
        completedTemas: completedCount,
        percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        totalWatchTime,
        totalWatchTimeFormatted: formatWatchTime(totalWatchTime),
      },
    });
  } catch (error) {
    console.error('[Progress] Error:', error);
    return NextResponse.json({ error: 'Error al obtener progreso.' }, { status: 500 });
  }
}

function formatWatchTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}