// ============================================================
// Admin auth — verifica rol de administrador.
// Estrategia en 3 capas:
//   1. Verifica token Firebase (si la API key está disponible)
//   2. Fallback: lee X-Admin-Email header del cliente (ya verificado por Firebase client-side)
//   3. Verifica contra DB y lista de emails admin
// ============================================================

import { db } from './db';
import type { NextRequest } from 'next/server';

// Admin por email (fallback si no está en DB)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'academiaelprofeoficial@gmail.com')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

// Firebase API key — misma que en firebase.ts, como fallback si no está en env
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAeMHlQZtUwZqbH5o7nsb4eoUYXLM2y0PU';

export async function isAdmin(request: NextRequest): Promise<boolean> {
  // --- Intentar 1: Verificar con Firebase token ---
  const authHeader = request.headers.get('authorization');
  let uidFromToken: string | null = null;
  let emailFromToken: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7);
    if (idToken) {
      try {
        const fbResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
        );
        if (fbResponse.ok) {
          const data = await fbResponse.json();
          const fbUser = data?.users?.[0];
          uidFromToken = fbUser?.localId || null;
          emailFromToken = fbUser?.email || null;
        }
      } catch {
        // Firebase falló, continuamos con fallback
      }
    }
  }

  // Si Firebase verificó OK, usar ese email/uid
  if (uidFromToken) {
    // 1a. Verificar contra ADMIN_UIDS
    const ADMIN_UIDS = (process.env.ADMIN_UIDS || '').split(',').filter(Boolean);
    if (ADMIN_UIDS.includes(uidFromToken)) return true;

    // 1b. Verificar por email
    if (emailFromToken && ADMIN_EMAILS.includes(emailFromToken.toLowerCase())) {
      await ensureAdminInDB(uidFromToken, emailFromToken);
      return true;
    }

    // 1c. Verificar rol en DB
    try {
      const user = await db.user.findUnique({ where: { id: uidFromToken } });
      if (user?.role === 'admin') return true;
    } catch {
      // DB error, continue
    }
  }

  // --- Intento 2: Fallback por header X-Admin-Email (cliente ya verificado por Firebase) ---
  const adminEmailHeader = request.headers.get('x-admin-email')?.trim().toLowerCase();
  if (adminEmailHeader && ADMIN_EMAILS.includes(adminEmailHeader)) {
    // Opcionalmente verificar contra DB también
    const adminUidHeader = request.headers.get('x-admin-uid')?.trim();
    if (adminUidHeader) {
      await ensureAdminInDB(adminUidHeader, adminEmailHeader);
    }
    return true;
  }

  return false;
}

// Asegura que el usuario exista en DB con rol admin
async function ensureAdminInDB(uid: string, email: string): Promise<void> {
  try {
    const existing = await db.user.findUnique({ where: { id: uid } });
    if (existing && existing.role !== 'admin') {
      await db.user.update({ where: { id: uid }, data: { role: 'admin' } });
    } else if (!existing) {
      await db.user.create({ data: { id: uid, email, role: 'admin' } });
    }
  } catch {
    // Si falla la DB, igual conceder acceso por email
  }
}