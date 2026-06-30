// ============================================================
// POST /api/user/sync
// Sincroniza el usuario de Firebase Auth con la base de datos.
// Se llama desde el cliente al iniciar sesión.
// Body: { idToken: string }
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAeMHlQZtUwZqbH5o7nsb4eoUYXLM2y0PU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "academia-el-profe.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "academia-el-profe",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const adminAuth = getAuth(app);

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Se requiere idToken.' }, { status: 400 });
    }

    // Verificar el token con Firebase (lado servidor)
    // Como no tenemos Admin SDK, usamos el endpoint de verificación REST
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    const data = await response.json();
    const firebaseUser = data.users?.[0];

    if (!firebaseUser) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // Importar dinámicamente para evitar problemas con client components
    const { syncUser } = await import('@/lib/purchase-service');

    const user = await syncUser(
      firebaseUser.localId,
      firebaseUser.email,
      firebaseUser.displayName || undefined,
      firebaseUser.photoUrl || undefined
    );

    return NextResponse.json({
      success: true,
      uid: firebaseUser.localId,
      email: firebaseUser.email,
      role: user.role,
    });
  } catch (error) {
    console.error('[User Sync] Error:', error);
    return NextResponse.json({ error: 'Error al sincronizar usuario.' }, { status: 500 });
  }
}