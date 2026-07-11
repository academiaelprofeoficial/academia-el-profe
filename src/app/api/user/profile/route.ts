// ============================================================
// GET/PUT /api/user/profile
// Obtiene y actualiza el perfil del estudiante.
// Usa SQL puro para ser inmune a columnas faltantes en la DB.
// Auto-migración: crea columnas nuevas si no existen.
// Auth: requiere idToken de Firebase en header Authorization.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAeMHlQZtUwZqbH5o7nsb4eoUYXLM2y0PU';

// Auto-migration: ensure all profile columns exist
let _migrated = false;
async function ensureColumns() {
  if (_migrated) return;
  try {
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "age" INTEGER;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "birthDate" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "university" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "career" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "biography" TEXT;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;
    `);
    console.log('[Profile] Auto-migration completed.');
  } catch (err) {
    console.error('[Profile] Auto-migration error:', err);
  }
  _migrated = true;
}

// Verify Firebase token via REST API (no Admin SDK needed)
async function verifyToken(token: string): Promise<{ uid: string; email: string } | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const fbUser = data.users?.[0];
    if (!fbUser) return null;
    return { uid: fbUser.localId, email: fbUser.email };
  } catch {
    return null;
  }
}

// Helper: fetch counts for a user (simple, no complex JOINs)
async function fetchUserCounts(uid: string) {
  try {
    const countRows = await db.$queryRawUnsafe(
      `SELECT
        (SELECT COUNT(*)::int FROM "Purchase" WHERE "userId" = $1) AS purchases,
        (SELECT COUNT(*)::int FROM "CourseProgress" WHERE "userId" = $1) AS progress,
        (SELECT COUNT(*)::int FROM "Wishlist" WHERE "userId" = $1) AS wishlist,
        (SELECT COUNT(*)::int FROM "Comment" WHERE "userId" = $1) AS comments`,
      uid
    ) as any[];
    if (countRows?.[0]) return countRows[0];
  } catch (err) {
    console.warn('[Profile] Count query failed:', err);
  }
  return { purchases: 0, progress: 0, wishlist: 0, comments: 0 };
}

// ---- GET: obtener perfil (raw SQL — immune to schema mismatch) ----
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const firebaseUser = await verifyToken(authHeader.replace('Bearer ', ''));
    if (!firebaseUser) {
      return NextResponse.json({ error: 'Token invalido.' }, { status: 401 });
    }

    const uid = firebaseUser.uid;

    // Run auto-migration
    await ensureColumns();

    // Use raw SQL to fetch user — this works even if Prisma schema is out of sync
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (db.$queryRawUnsafe(
      `SELECT 
        u.id, u.email, u.name, u."photoURL", u.role,
        u.phone, u.address, u.age, u."birthDate", u.gender,
        u.university, u.career, u.biography, u."createdAt"
      FROM "User" u
      WHERE u.id = $1
      LIMIT 1`,
      uid
    ) as Promise<any[]>).catch(async (_err: any) => {
      console.warn('[Profile GET] Main query failed, trying fallback:', _err);
      // Fallback: ultra-minimal
      return (db.$queryRawUnsafe(
        `SELECT id, email, name, role, "createdAt" FROM "User" WHERE id = $1 LIMIT 1`,
        uid
      ) as Promise<any[]>);
    });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const u = rows[0];
    const counts = await fetchUserCounts(uid);

    const profile = {
      id: u.id,
      email: u.email,
      name: u.name ?? null,
      photoURL: u.photoURL ?? null,
      role: u.role ?? 'estudiante',
      phone: u.phone ?? null,
      address: u.address ?? null,
      age: u.age ?? null,
      birthDate: u.birthDate ?? null,
      gender: u.gender ?? null,
      university: u.university ?? null,
      career: u.career ?? null,
      biography: u.biography ?? null,
      createdAt: u.createdAt,
      _count: counts,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Profile GET] Error:', error);
    return NextResponse.json({ error: 'Error al obtener perfil.' }, { status: 500 });
  }
}

// ---- PUT: actualizar perfil (raw SQL con UPDATE ... RETURNING) ----
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const firebaseUser = await verifyToken(authHeader.replace('Bearer ', ''));
    if (!firebaseUser) {
      return NextResponse.json({ error: 'Token invalido.' }, { status: 401 });
    }

    console.log('[Profile PUT] Firebase user:', firebaseUser.uid, firebaseUser.email);

    await ensureColumns();

    const body = await request.json();
    console.log('[Profile PUT] Body recibido:', JSON.stringify(body, null, 2));

    const { name, phone, address, age, birthDate, gender, university, career, biography, photoURL } = body;

    // Validate
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 100)) {
      return NextResponse.json({ error: 'Nombre invalido (1-100 caracteres).' }, { status: 400 });
    }
    if (age !== undefined && age !== null) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
        return NextResponse.json({ error: 'Edad debe ser entre 10 y 120.' }, { status: 400 });
      }
    }
    if (birthDate !== undefined && birthDate !== null && typeof birthDate === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        return NextResponse.json({ error: 'Fecha de nacimiento invalida (YYYY-MM-DD).' }, { status: 400 });
      }
    }
    if (gender !== undefined && gender !== null) {
      if (!['masculino', 'femenino', 'otro'].includes(gender)) {
        return NextResponse.json({ error: 'Genero invalido.' }, { status: 400 });
      }
    }

    // Build SET clauses with parameterized queries
    const setClauses: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      params.push(name.trim());
    }
    if (photoURL !== undefined) {
      setClauses.push(`"photoURL" = $${idx++}`);
      params.push(photoURL);
    }
    if (phone !== undefined) {
      setClauses.push(`phone = $${idx++}`);
      params.push(phone === '' ? null : phone);
    }
    if (address !== undefined) {
      setClauses.push(`address = $${idx++}`);
      params.push(address === '' ? null : address);
    }
    if (age !== undefined) {
      setClauses.push(`age = $${idx++}`);
      params.push(age === null ? null : Number(age));
    }
    if (birthDate !== undefined) {
      setClauses.push(`"birthDate" = $${idx++}`);
      params.push(birthDate === '' ? null : birthDate);
    }
    if (gender !== undefined) {
      setClauses.push(`gender = $${idx++}`);
      params.push(gender === '' ? null : gender);
    }
    if (university !== undefined) {
      setClauses.push(`university = $${idx++}`);
      params.push(university === '' ? null : university);
    }
    if (career !== undefined) {
      setClauses.push(`career = $${idx++}`);
      params.push(career === '' ? null : career);
    }
    if (biography !== undefined) {
      setClauses.push(`biography = $${idx++}`);
      params.push(biography === '' ? null : biography);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar.' }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);

    // The UID parameter for WHERE clause
    const uidParamIdx = idx;
    params.push(firebaseUser.uid);

    const sql = `UPDATE "User" SET ${setClauses.join(', ')} WHERE id = $${uidParamIdx} RETURNING 
      id, email, name, "photoURL", role,
      phone, address, age, "birthDate", gender,
      university, career, biography, "createdAt"`;

    console.log('[Profile PUT] SQL:', sql);
    console.log('[Profile PUT] Params:', params.map((p, i) => `$${i + 1}=${typeof p === 'string' && p.length > 50 ? p.substring(0, 50) + '...' : p}`).join(', '));

    // Execute UPDATE ... RETURNING — atomic: update + get result in one query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedRows: any[] = await db.$queryRawUnsafe(sql, ...params) as any[];

    console.log('[Profile PUT] Rows returned:', updatedRows?.length);

    if (!updatedRows || updatedRows.length === 0) {
      console.error('[Profile PUT] UPDATE returned 0 rows! UID:', firebaseUser.uid);
      return NextResponse.json({ 
        error: 'No se pudo actualizar el perfil. Usuario no encontrado en la base de datos.',
        debug: { uid: firebaseUser.uid, clauses: setClauses.length }
      }, { status: 404 });
    }

    // VERIFY: read back from DB immediately to confirm persistence
    const verifyRows: any[] = await db.$queryRawUnsafe(
      `SELECT phone, address, age, "birthDate", gender, university, career, biography FROM "User" WHERE id = $1`,
      firebaseUser.uid
    ) as any[];
    console.log('[Profile PUT] VERIFY read-back:', JSON.stringify(verifyRows?.[0]));

    const u = updatedRows[0];
    console.log('[Profile PUT] Updated row:', JSON.stringify({
      id: u.id, name: u.name, phone: u.phone, address: u.address,
      age: u.age, birthDate: u.birthDate, gender: u.gender,
      university: u.university, career: u.career, biography: u.biography ? '...' + u.biography.slice(-20) : null,
    }));

    const counts = await fetchUserCounts(firebaseUser.uid);

    const profile = {
      id: u.id,
      email: u.email,
      name: u.name ?? null,
      photoURL: u.photoURL ?? null,
      role: u.role ?? 'estudiante',
      phone: u.phone ?? null,
      address: u.address ?? null,
      age: u.age ?? null,
      birthDate: u.birthDate ?? null,
      gender: u.gender ?? null,
      university: u.university ?? null,
      career: u.career ?? null,
      biography: u.biography ?? null,
      createdAt: u.createdAt,
      _count: counts,
    };

    console.log('[Profile PUT] Profile devuelto:', JSON.stringify({
      name: profile.name, phone: profile.phone, address: profile.address,
      age: profile.age, birthDate: profile.birthDate, gender: profile.gender,
    }));

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Profile PUT] Error:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil.' }, { status: 500 });
  }
}