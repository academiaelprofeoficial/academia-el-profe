// ============================================================
// GET /api/user/purchases
// Devuelve los cursos comprados (aprobados) del usuario actual.
// Query param: ?uid=firebaseUid
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPurchasedCourseIds, getUserPurchases } from '@/lib/purchase-service';

export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Se requiere uid.' }, { status: 400 });
    }

    // Devolver solo los IDs para verificación rápida de acceso
    const purchasedIds = await getPurchasedCourseIds(uid);

    // También incluir accesos manuales otorgados por admin (activos)
    const manualAccesses = await db.courseAccess.findMany({
      where: { userId: uid, isActive: true },
      select: { courseId: true },
    });
    const manualIds = manualAccesses.map(a => a.courseId);

    // Combinar y deduplicar
    const allAccessIds = [...new Set([...purchasedIds, ...manualIds])];

    // También devolver historial completo
    const history = await getUserPurchases(uid);

    return NextResponse.json({
      purchasedCourseIds: allAccessIds,
      purchases: history,
    });
  } catch (error) {
    console.error('[Purchases] Error:', error);
    return NextResponse.json({ error: 'Error al obtener compras.' }, { status: 500 });
  }
}