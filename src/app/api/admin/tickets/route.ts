// ============================================================
// GET /api/admin/tickets?estado=&page=1&limit=20
// Lista de tickets de soporte (admin protegido).
// PATCH /api/admin/tickets?id=xxx&estado=resuelto
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
    const estado = searchParams.get('estado') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where = estado ? { estado } : {};

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[Admin Tickets] Error:', error);
    return NextResponse.json({ error: 'Error al obtener tickets.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const { id, estado } = await request.json();
    if (!id || !estado) {
      return NextResponse.json({ error: 'Faltan id y estado.' }, { status: 400 });
    }

    const validEstados = ['nuevo', 'en_proceso', 'resuelto', 'cerrado'];
    if (!validEstados.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }

    const ticket = await db.supportTicket.update({
      where: { id },
      data: { estado },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('[Admin Tickets] Error:', error);
    return NextResponse.json({ error: 'Error al actualizar ticket.' }, { status: 500 });
  }
}