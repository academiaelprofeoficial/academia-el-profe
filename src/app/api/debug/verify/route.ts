import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/debug/verify?uid=xxx
// Devuelve el row crudo de la DB para verificar persistencia
export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid');
    if (!uid) {
      return NextResponse.json({ error: 'Falta param ?uid=xxx' }, { status: 400 });
    }

    // Raw row from User table
    const userRows: any[] = await db.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE id = $1`, uid
    ) as any[];

    // Raw row from perfiles table (by email)
    let perfilRow = null;
    if (userRows?.[0]?.email) {
      const perfilRows: any[] = await db.$queryRawUnsafe(
        `SELECT * FROM perfiles WHERE email = $1`, userRows[0].email
      ) as any[];
      perfilRow = perfilRows?.[0] || null;
    }

    return NextResponse.json({
      User_table: userRows?.[0] || null,
      perfiles_table: perfilRow,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}