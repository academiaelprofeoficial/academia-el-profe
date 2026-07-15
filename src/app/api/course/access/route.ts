// ============================================================
// GET /api/course/access?userId=xxx&courseId=xxx
// Verifica si un usuario tiene acceso a un curso específico.
// Usado por el Aula Virtual para proteger el contenido.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { hasCourseAccess } from '@/lib/purchase-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
    }

    const hasAccess = await hasCourseAccess(userId, courseId);

    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('[Course Access] Error:', error);
    return NextResponse.json({ hasAccess: false }, { status: 200 });
  }
}