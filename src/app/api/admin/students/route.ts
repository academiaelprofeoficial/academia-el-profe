// ============================================================
// GET /api/admin/students?search=&page=1&limit=20
// Lista de estudiantes con datos completos (admin protegido).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              purchases: { where: { status: 'approved' } },
              progress: true,
              wishlist: true,
            },
          },
          purchases: {
            where: { status: 'approved' },
            select: { id: true, courseId: true, courseTitle: true, amount: true, currency: true, approvedAt: true, status: true },
          },
          progress: {
            select: { completed: true },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        email: s.email,
        name: s.name || 'Sin nombre',
        photoURL: s.photoURL,
        role: s.role,
        createdAt: s.createdAt.toISOString(),
        lastActive: s.updatedAt.toISOString(),
        stats: {
          cursosComprados: s._count.purchases,
          totalCompras: s.purchases.length,
          clasesVistas: s.progress.filter((p) => p.completed).length,
          totalProgreso: s._count.progress,
          enWishlist: s._count.wishlist,
        },
        compras: s.purchases.map((p) => ({
          courseId: p.courseId,
          curso: p.courseTitle || p.courseId,
          monto: p.amount,
          moneda: p.currency,
          fecha: p.approvedAt?.toISOString() || null,
        })),
        totalGastado: s.purchases.reduce((sum, p) => sum + p.amount, 0),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[Admin Students] Error:', error);
    return NextResponse.json({ error: 'Error al obtener estudiantes.' }, { status: 500 });
  }
}