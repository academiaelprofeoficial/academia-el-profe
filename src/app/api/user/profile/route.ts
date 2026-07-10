// ============================================================
// GET/PUT /api/user/profile
// Obtiene y actualiza el perfil del estudiante.
// Auto-migración: asegura que las columnas existan en la DB.
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
    const isPg = process.env.DATABASE_URL?.startsWith('postgres');
    if (isPg) {
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
    }
  } catch (err) {
    console.error('[Profile] Auto-migration warning:', err);
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

// ---- GET: obtener perfil ----
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

    await ensureColumns();

    const user = await db.user.findUnique({
      where: { id: firebaseUser.uid },
      select: {
        id: true,
        email: true,
        name: true,
        photoURL: true,
        role: true,
        phone: true,
        address: true,
        age: true,
        birthDate: true,
        gender: true,
        university: true,
        career: true,
        biography: true,
        createdAt: true,
        _count: {
          select: { purchases: true, progress: true, wishlist: true, comments: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error('[Profile GET] Error:', error);
    return NextResponse.json({ error: 'Error al obtener perfil.' }, { status: 500 });
  }
}

// ---- PUT: actualizar perfil ----
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

    await ensureColumns();

    const body = await request.json();
    const { name, phone, address, age, birthDate, gender, university, career, biography, photoURL } = body;

    // Validate
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 100)) {
      return NextResponse.json({ error: 'Nombre invalido (1-100 caracteres).' }, { status: 400 });
    }
    if (phone !== undefined && phone !== null && typeof phone === 'string' && phone.length > 20) {
      return NextResponse.json({ error: 'Telefono muy largo (max 20).' }, { status: 400 });
    }
    if (address !== undefined && address !== null && typeof address === 'string' && address.length > 200) {
      return NextResponse.json({ error: 'Direccion muy larga (max 200).' }, { status: 400 });
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
    if (university !== undefined && university !== null && typeof university === 'string' && university.length > 100) {
      return NextResponse.json({ error: 'Universidad muy larga (max 100).' }, { status: 400 });
    }
    if (career !== undefined && career !== null && typeof career === 'string' && career.length > 150) {
      return NextResponse.json({ error: 'Carrera muy larga (max 150).' }, { status: 400 });
    }
    if (biography !== undefined && biography !== null && typeof biography === 'string' && biography.length > 500) {
      return NextResponse.json({ error: 'Biografia muy larga (max 500).' }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone === '' ? null : phone;
    if (address !== undefined) updateData.address = address === '' ? null : address;
    if (age !== undefined) updateData.age = age === null ? null : Number(age);
    if (birthDate !== undefined) updateData.birthDate = birthDate === '' ? null : birthDate;
    if (gender !== undefined) updateData.gender = gender === '' ? null : gender;
    if (university !== undefined) updateData.university = university === '' ? null : university;
    if (career !== undefined) updateData.career = career === '' ? null : career;
    if (biography !== undefined) updateData.biography = biography === '' ? null : biography;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const updated = await db.user.update({
      where: { id: firebaseUser.uid },
      data: updateData,
      select: {
        id: true, email: true, name: true, photoURL: true, role: true,
        phone: true, address: true, age: true, birthDate: true, gender: true,
        university: true, career: true, biography: true, createdAt: true,
        _count: { select: { purchases: true, progress: true, wishlist: true, comments: true } },
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('[Profile PUT] Error:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil.' }, { status: 500 });
  }
}