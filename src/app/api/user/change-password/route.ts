// ============================================================
// POST /api/user/change-password
// Cambia la contraseña del usuario via Firebase REST API.
// Auth: requiere idToken de Firebase en header Authorization.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAeMHlQZtUwZqbH5o7nsb4eoUYXLM2y0PU';

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    const firebaseUser = await verifyToken(idToken);
    if (!firebaseUser) {
      return NextResponse.json({ error: 'Token invalido.' }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Se requiere la nueva contraseña.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    // Use Firebase REST API to update password
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          password: newPassword,
          returnSecureToken: true,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('[ChangePassword] Firebase error:', data);
      const msg = data.error?.message || 'Error al cambiar contraseña.';
      // Map common Firebase errors to Spanish
      if (msg.includes('WEAK_PASSWORD')) {
        return NextResponse.json({ error: 'La contraseña es demasiado debil.' }, { status: 400 });
      }
      if (msg.includes('INVALID_ID_TOKEN') || msg.includes('USER_NOT_FOUND')) {
        return NextResponse.json({ error: 'Sesion expirada. Inicia sesion de nuevo.' }, { status: 401 });
      }
      if (msg.includes('RECENT_LOGIN_REQUIRED')) {
        return NextResponse.json({ error: 'Por seguridad, inicia sesion de nuevo antes de cambiar tu contraseña.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Error al cambiar contraseña.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('[ChangePassword] Error:', error);
    return NextResponse.json({ error: 'Error al cambiar contraseña.' }, { status: 500 });
  }
}