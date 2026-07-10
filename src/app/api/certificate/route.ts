// ============================================================
// GET /api/certificate/issue?userId=xxx&courseId=xxx
// Emite un certificado si el usuario completó el curso.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { issueCertificate } from '@/lib/certificate-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
    }

    const cert = await issueCertificate(userId, courseId);

    if (!cert) {
      return NextResponse.json(
        { error: 'No se pudo emitir el certificado. Verifica que hayas comprado el curso.' },
        { status: 403 }
      );
    }

    return NextResponse.json(cert);
  } catch (error) {
    console.error('[Certificate] Error:', error);
    return NextResponse.json({ error: 'Error al emitir certificado.' }, { status: 500 });
  }
}