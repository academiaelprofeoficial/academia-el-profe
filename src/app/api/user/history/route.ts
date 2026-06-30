import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/user/history?uid=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'uid requerido' }, { status: 400 });

    const [purchases, accesses, progress] = await Promise.all([
      db.purchase.findMany({
        where: { userId: uid },
        orderBy: { approvedAt: 'desc' },
      }),
      db.courseAccess.findMany({
        where: { userId: uid, isActive: true },
        orderBy: { grantedAt: 'desc' },
      }),
      db.courseProgress.findMany({
        where: { userId: uid },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Build course map
    const courseMap = new Map<string, {
      courseId: string;
      courseTitle?: string;
      purchaseDate?: string;
      paymentStatus: string;
      accessType: 'purchase' | 'granted' | 'both' | 'progress_only';
      gateway?: string;
      amount?: number;
      currency?: string;
      progress: number;
      totalLessons: number;
      lastAccess?: string;
    }>();

    // Process purchases
    for (const p of purchases) {
      const existing = courseMap.get(p.courseId);
      if (existing) {
        existing.accessType = 'both';
        if (p.approvedAt && (!existing.purchaseDate || p.approvedAt > new Date(existing.purchaseDate))) {
          existing.purchaseDate = p.approvedAt.toISOString();
        }
      } else {
        courseMap.set(p.courseId, {
          courseId: p.courseId,
          courseTitle: p.courseTitle || undefined,
          purchaseDate: p.approvedAt?.toISOString(),
          paymentStatus: p.status,
          accessType: 'purchase',
          gateway: p.gateway,
          amount: p.amount,
          currency: p.currency,
          progress: 0,
          totalLessons: 0,
          lastAccess: undefined,
        });
      }
    }

    // Process granted accesses
    for (const a of accesses) {
      const existing = courseMap.get(a.courseId);
      if (existing) {
        if (existing.accessType !== 'both') existing.accessType = 'both';
        if (!existing.purchaseDate) existing.purchaseDate = a.grantedAt.toISOString();
      } else {
        courseMap.set(a.courseId, {
          courseId: a.courseId,
          purchaseDate: a.grantedAt.toISOString(),
          paymentStatus: 'granted',
          accessType: 'granted',
          progress: 0,
          totalLessons: 0,
          lastAccess: undefined,
        });
      }
    }

    // Process progress
    for (const p of progress) {
      const existing = courseMap.get(p.courseId);
      if (existing) {
        existing.totalLessons++;
        if (p.completed) existing.progress++;
        if (p.lastPos && p.lastPos > 0) {
          if (!existing.lastAccess || p.updatedAt > new Date(existing.lastAccess)) {
            existing.lastAccess = p.updatedAt.toISOString();
          }
        }
      } else {
        courseMap.set(p.courseId, {
          courseId: p.courseId,
          purchaseDate: undefined,
          paymentStatus: 'active',
          accessType: 'progress_only' as const,
          progress: p.completed ? 1 : 0,
          totalLessons: 1,
          lastAccess: p.updatedAt.toISOString(),
        });
      }
    }

    const courses = Array.from(courseMap.values());
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress > 0 && c.progress >= c.totalLessons && c.totalLessons > 0).length;

    return NextResponse.json({ courses, totalCourses, completedCourses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}