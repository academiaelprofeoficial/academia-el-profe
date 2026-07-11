// ============================================================
// POST /api/user/upload-photo
// Sube una foto de perfil a Supabase Storage (bucket: fotos-perfil).
// Auth: requiere idToken de Firebase en header Authorization.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAeMHlQZtUwZqbH5o7nsb4eoUYXLM2y0PU';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return { url: url.replace(/\/$/, ''), key, hasConfig: !!(url && key) };
}

// Verify Firebase token
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

// Try to create bucket via Storage REST API (needs service role key)
let _bucketAttempted = false;
async function tryCreateBucket() {
  if (_bucketAttempted) return;
  _bucketAttempted = true;

  const { url, key } = getSupabaseConfig();
  if (!url || !key) return;

  try {
    const res = await fetch(`${url}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'fotos-perfil',
        name: 'fotos-perfil',
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }),
    });

    if (res.ok || res.status === 409) {
      // 409 = bucket already exists, that's fine
      console.log('[UploadPhoto] Bucket "fotos-perfil" is ready.');
    } else {
      const errText = await res.text();
      console.warn('[UploadPhoto] Could not create bucket (may already exist):', res.status, errText);
    }
  } catch (err) {
    console.warn('[UploadPhoto] Bucket creation error (non-critical):', err);
  }
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    // Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const firebaseUser = await verifyToken(authHeader.replace('Bearer ', ''));
    if (!firebaseUser) {
      return NextResponse.json({ error: 'Token invalido.' }, { status: 401 });
    }

    const uid = firebaseUser.uid;
    console.log('[UploadPhoto] User:', uid);

    const { url: supabaseUrl, key: supabaseKey, hasConfig } = getSupabaseConfig();
    if (!hasConfig) {
      console.error('[UploadPhoto] Missing SUPABASE_URL or key env vars');
      return NextResponse.json({ 
        error: 'Configuración de Supabase incompleta. Agrega SUPABASE_URL y SUPABASE_ANON_KEY en Vercel.' 
      }, { status: 500 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG o WEBP.' }, { status: 400 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen no debe superar los 5MB.' }, { status: 400 });
    }

    // Try creating bucket (non-blocking, best-effort)
    await tryCreateBucket();

    // Determine file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${uid}/avatar.${ext}`;

    // Upload to Supabase Storage via REST API
    const uploadUrl = `${supabaseUrl}/storage/v1/object/fotos-perfil/${fileName}`;

    console.log('[UploadPhoto] Uploading to:', uploadUrl, 'Size:', file.size, 'Type:', file.type);

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: file,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[UploadPhoto] Upload failed:', uploadRes.status, errText);

      // If bucket doesn't exist, give clear instructions
      if (errText.includes('Bucket not found') || errText.includes('not found') || uploadRes.status === 404) {
        return NextResponse.json({ 
          error: 'El bucket "fotos-perfil" no existe. Ve a Supabase Dashboard → Storage → New Bucket → nombre: fotos-perfil → Public: ON. Luego intenta de nuevo.',
          code: 'BUCKET_NOT_FOUND'
        }, { status: 500 });
      }

      return NextResponse.json({ error: 'Error al subir la imagen al almacenamiento.' }, { status: 500 });
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/fotos-perfil/${fileName}`;

    console.log('[UploadPhoto] Uploaded successfully. Public URL:', publicUrl);

    // Update photoURL in User table
    await db.$executeRawUnsafe(
      `UPDATE "User" SET "photoURL" = $1, "updatedAt" = NOW() WHERE id = $2`,
      publicUrl, uid
    );

    console.log('[UploadPhoto] Database updated.');

    return NextResponse.json({ 
      success: true, 
      photoURL: publicUrl,
      message: 'Foto actualizada correctamente.'
    });
  } catch (error) {
    console.error('[UploadPhoto] Error:', error);
    return NextResponse.json({ error: 'Error al subir la foto.' }, { status: 500 });
  }
}

// DELETE: remove photo
export async function DELETE(request: NextRequest) {
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
    const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

    // Try to delete from storage (best-effort)
    const exts = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of exts) {
      const fileName = `${uid}/avatar.${ext}`;
      const deleteUrl = `${supabaseUrl}/storage/v1/object/fotos-perfil/${fileName}`;
      try {
        await fetch(deleteUrl, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        });
      } catch {
        // File might not exist, continue
      }
    }

    // Clear photoURL in database
    await db.$executeRawUnsafe(
      `UPDATE "User" SET "photoURL" = NULL, "updatedAt" = NOW() WHERE id = $1`,
      uid
    );

    console.log('[UploadPhoto] Photo deleted for user:', uid);

    return NextResponse.json({ success: true, photoURL: null });
  } catch (error) {
    console.error('[UploadPhoto] Delete error:', error);
    return NextResponse.json({ error: 'Error al eliminar la foto.' }, { status: 500 });
  }
}