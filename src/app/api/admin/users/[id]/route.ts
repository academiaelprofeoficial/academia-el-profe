// ============================================================
// GET    /api/admin/users/[id] — Detalle completo de un usuario
// PATCH  /api/admin/users/[id] — Cambiar rol, nombre, etc.
// DELETE /api/admin/users/[id] — Eliminar usuario (admin protegido)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        purchases: { orderBy: { id: 'desc' } },
        progress: { orderBy: { updatedAt: 'desc' } },
        wishlist: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      stats: {
        totalCompras: user.purchases.length,
        comprasAprobadas: user.purchases.filter((p) => p.status === 'approved').length,
        totalGastado: user.purchases
          .filter((p) => p.status === 'approved')
          .reduce((sum, p) => sum + p.amount, 0),
        clasesCompletadas: user.progress.filter((p) => p.completed).length,
        totalProgreso: user.progress.length,
        enWishlist: user.wishlist.length,
      },
      purchases: user.purchases.map((p) => ({
        id: p.id,
        courseId: p.courseId,
        courseTitle: p.courseTitle,
        gateway: p.gateway,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        payerEmail: p.payerEmail,
        approvedAt: p.approvedAt?.toISOString() || null,
      })),
      progress: user.progress.map((p) => ({
        id: p.id,
        courseId: p.courseId,
        temaId: p.temaId,
        completed: p.completed,
        watchTime: p.watchTime,
        lastPos: p.lastPos,
        updatedAt: p.updatedAt.toISOString(),
      })),
      wishlist: user.wishlist.map((w) => ({
        courseId: w.courseId,
        addedAt: w.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Admin User Detail] Error:', error);
    return NextResponse.json({ error: 'Error al obtener usuario.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, name } = body;

    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) {
      const validRoles = ['estudiante', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Rol inválido. Use "estudiante" o "admin".' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar.' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('[Admin User Update] Error:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const { id } = await params;

    // Verificar que no se elimine a sí mismo
    const adminEmail = request.headers.get('x-admin-email');
    const targetUser = await db.user.findUnique({ where: { id } });
    if (targetUser && adminEmail && targetUser.email.toLowerCase() === adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin User Delete] Error:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario.' }, { status: 500 });
  }
}