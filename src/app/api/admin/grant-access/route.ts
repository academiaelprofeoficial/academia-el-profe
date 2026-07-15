// ============================================================
// POST /api/admin/grant-access — Grant or revoke course access
// GET  /api/admin/grant-access?userEmail=xxx — List access for a user
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin-auth';

// POST — Grant or revoke course access
// Body: { action: 'grant' | 'revoke', userEmail: string, courseIds: string[], note?: string }
export async function POST(req: NextRequest) {
  try {
    // Verify admin
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Extract admin email from headers for grantedBy
    const adminEmail = req.headers.get('x-admin-email') || 'admin';

    const body = await req.json();
    const { action, userEmail, courseIds, note } = body;

    if (!action || !userEmail || !courseIds?.length) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (action !== 'grant' && action !== 'revoke') {
      return NextResponse.json({ error: 'Acción inválida. Usar grant o revoke.' }, { status: 400 });
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email: userEmail.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const results = [];
    for (const courseId of courseIds) {
      if (action === 'grant') {
        const access = await db.courseAccess.upsert({
          where: { userId_courseId: { userId: user.id, courseId } },
          create: { userId: user.id, courseId, grantedBy: adminEmail, note, isActive: true, revokedAt: null },
          update: { isActive: true, revokedAt: null, grantedBy: adminEmail, note },
        });
        results.push({ courseId, status: 'granted', accessId: access.id });
      } else if (action === 'revoke') {
        const access = await db.courseAccess.upsert({
          where: { userId_courseId: { userId: user.id, courseId } },
          create: { userId: user.id, courseId, grantedBy: adminEmail, isActive: false, revokedAt: new Date() },
          update: { isActive: false, revokedAt: new Date() },
        });
        results.push({ courseId, status: 'revoked', accessId: access.id });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('[GrantAccess]', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

// GET — List access for a user (admin protected)
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail requerido' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: userEmail.toLowerCase() },
      include: {
        courseAccesses: { orderBy: { grantedAt: 'desc' } },
        purchases: { where: { status: 'approved' } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      grantedAccess: user.courseAccesses.filter(a => a.isActive),
      allAccessRecords: user.courseAccesses,
      purchases: user.purchases,
    });
  } catch (error: any) {
    console.error('[GrantAccess GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}