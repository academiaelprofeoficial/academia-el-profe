// ============================================================
// GET/PUT /api/user/profile
// Obtiene y actualiza el perfil del estudiante.
// Auto-migración: asegura que las columnas existan en la DB.
// Fallback: si las columnas nuevas no existen, usa query básico.
// Auth: requiere idToken de Firebase en header Authorization.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

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

    // Step 1: Try full query with all columns
    await ensureColumns();

    let user: any = null;
    try {
      user = await db.user.findUnique({
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
    } catch (queryErr) {
      // Columns might not exist yet — run migration again and retry once
      console.warn('[Profile] Full query failed, re-running migration:', queryErr);
      _migrated = false;
      await ensureColumns();
      try {
        user = await db.user.findUnique({
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
      } catch (retryErr) {
        // Final fallback: query only the original columns that definitely exist
        console.warn('[Profile] Retry failed, using fallback query:', retryErr);
        try {
          user = await db.user.findUnique({
            where: { id: firebaseUser.uid },
            select: {
              id: true,
              email: true,
              name: true,
              photoURL: true,
              role: true,
              age: true,
              university: true,
              career: true,
              createdAt: true,
              _count: {
                select: { purchases: true, progress: true, wishlist: true, comments: true },
              },
            },
          });
        } catch (finalErr) {
          console.error('[Profile] All queries failed:', finalErr);
          return NextResponse.json({ error: 'Error al consultar la base de datos.' }, { status: 500 });
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // Ensure all fields exist (fill defaults for missing ones from fallback)
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      photoURL: user.photoURL ?? null,
      role: user.role ?? 'estudiante',
      phone: user.phone ?? null,
      address: user.address ?? null,
      age: user.age ?? null,
      birthDate: user.birthDate ?? null,
      gender: user.gender ?? null,
      university: user.university ?? null,
      career: user.career ?? null,
      biography: user.biography ?? null,
      createdAt: user.createdAt,
      _count: user._count ?? { purchases: 0, progress: 0, wishlist: 0, comments: 0 },
    };

    return NextResponse.json({ profile });
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

    // Build update data — use $executeRaw for new columns to avoid Prisma schema mismatch
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    // Safe fields that exist in both old and new schema
    const safeUpdate: Record<string, any> = {};
    if (age !== undefined) safeUpdate.age = age === null ? null : Number(age);
    if (university !== undefined) safeUpdate.university = university === '' ? null : university;
    if (career !== undefined) safeUpdate.career = career === '' ? null : career;

    // New fields — try raw SQL first, fall back to Prisma
    const newFields: Record<string, any> = {};
    if (phone !== undefined) newFields.phone = phone === '' ? null : phone;
    if (address !== undefined) newFields.address = address === '' ? null : address;
    if (birthDate !== undefined) newFields.birthDate = birthDate === '' ? null : birthDate;
    if (gender !== undefined) newFields.gender = gender === '' ? null : gender;
    if (biography !== undefined) newFields.biography = biography === '' ? null : biography;

    // Try Prisma update with all fields first
    let updated: any;
    try {
      const allData = { ...updateData, ...safeUpdate, ...newFields };
      updated = await db.user.update({
        where: { id: firebaseUser.uid },
        data: allData,
        select: {
          id: true, email: true, name: true, photoURL: true, role: true,
          phone: true, address: true, age: true, birthDate: true, gender: true,
          university: true, career: true, biography: true, createdAt: true,
          _count: { select: { purchases: true, progress: true, wishlist: true, comments: true } },
        },
      });
    } catch (prismaErr) {
      // If new columns don't exist in DB, update only safe fields via Prisma
      console.warn('[Profile PUT] Full update failed, using safe fields only:', prismaErr);
      
      // Update safe fields via Prisma
      updated = await db.user.update({
        where: { id: firebaseUser.uid },
        data: { ...updateData, ...safeUpdate },
        select: {
          id: true, email: true, name: true, photoURL: true, role: true,
          age: true, university: true, career: true, createdAt: true,
          _count: { select: { purchases: true, progress: true, wishlist: true, comments: true } },
        },
      });

      // Try updating new fields via raw SQL
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (phone !== undefined) {
        setClauses.push(`"phone" = $${paramIndex++}`);
        params.push(phone === '' ? null : phone);
      }
      if (address !== undefined) {
        setClauses.push(`"address" = $${paramIndex++}`);
        params.push(address === '' ? null : address);
      }
      if (birthDate !== undefined) {
        setClauses.push(`"birthDate" = $${paramIndex++}`);
        params.push(birthDate === '' ? null : birthDate);
      }
      if (gender !== undefined) {
        setClauses.push(`"gender" = $${paramIndex++}`);
        params.push(gender === '' ? null : gender);
      }
      if (biography !== undefined) {
        setClauses.push(`"biography" = $${paramIndex++}`);
        params.push(biography === '' ? null : biography);
      }

      if (setClauses.length > 0) {
        try {
          await db.$executeRawUnsafe(
            `UPDATE "User" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE id = $${paramIndex}`,
            ...params,
            firebaseUser.uid
          );
        } catch (sqlErr) {
          console.warn('[Profile PUT] Raw SQL update also failed (columns may not exist):', sqlErr);
        }
      }

      // Re-fetch with full query to get all fields
      try {
        updated = await db.user.findUnique({
          where: { id: firebaseUser.uid },
          select: {
            id: true, email: true, name: true, photoURL: true, role: true,
            phone: true, address: true, age: true, birthDate: true, gender: true,
            university: true, career: true, biography: true, createdAt: true,
            _count: { select: { purchases: true, progress: true, wishlist: true, comments: true } },
          },
        });
      } catch {
        // Return the safe update result
      }
    }

    // Normalize response
    const profile = {
      id: updated.id,
      email: updated.email,
      name: updated.name ?? null,
      photoURL: updated.photoURL ?? null,
      role: updated.role ?? 'estudiante',
      phone: updated.phone ?? null,
      address: updated.address ?? null,
      age: updated.age ?? null,
      birthDate: updated.birthDate ?? null,
      gender: updated.gender ?? null,
      university: updated.university ?? null,
      career: updated.career ?? null,
      biography: updated.biography ?? null,
      createdAt: updated.createdAt,
      _count: updated._count ?? { purchases: 0, progress: 0, wishlist: 0, comments: 0 },
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Profile PUT] Error:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil.' }, { status: 500 });
  }
}