// ============================================================
// POST /api/user/upload-photo
// Sube una foto de perfil a Supabase Storage (bucket: fotos-perfil).
// Crea el bucket y políticas RLS automáticamente si no existen.
// Auth: requiere idToken de Firebase en header Authorization.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAeMHlQZtUwZqbH5o7nsb4eoUYXLM2y0PU';

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

// Ensure the bucket exists and has proper policies
let _bucketReady = false;
async function ensureBucket() {
  if (_bucketReady) return true;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[UploadPhoto] Missing SUPABASE_URL or SUPABASE_KEY env vars');
    return false;
  }

  try {
    // 1. Create bucket via SQL (works with existing DB connection)
    await db.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('fotos-perfil', 'fotos-perfil', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('[UploadPhoto] Bucket "fotos-perfil" ready.');

    // 2. Create RLS policies: anyone authenticated can read, user can upload to own folder
    // First, check if policies already exist to avoid errors
    const existingPolicies = await db.$queryRawUnsafe(`
      SELECT policyname FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage'
    `) as any[];

    const policyNames = (existingPolicies || []).map((p: any) => p.policyname);

    if (!policyNames.includes('Public read fotos-perfil')) {
      await db.$executeRawUnsafe(`
        CREATE POLICY "Public read fotos-perfil" ON storage.objects
        FOR SELECT USING (bucket_id = 'fotos-perfil');
      `);
    }

    if (!policyNames.includes('Authenticated upload own fotos-perfil')) {
      await db.$executeRawUnsafe(`
        CREATE POLICY "Authenticated upload own fotos-perfil" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'fotos-perfil' 
          AND (storage.foldername(name))[1] = auth.uid()
        );
      `);
    }

    if (!policyNames.includes('Authenticated update own fotos-perfil')) {
      await db.$executeRawUnsafe(`
        CREATE POLICY "Authenticated update own fotos-perfil" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'fotos-perfil' 
          AND (storage.foldername(name))[1] = auth.uid()
        );
      `);
    }

    if (!policyNames.includes('Authenticated delete own fotos-perfil')) {
      await db.$executeRawUnsafe(`
        CREATE POLICY "Authenticated delete own fotos-perfil" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'fotos-perfil' 
          AND (storage.foldername(name))[1] = auth.uid()
        );
      `);
    }

    console.log('[UploadPhoto] RLS policies ready.');
    _bucketReady = true;
    return true;
  } catch (err) {
    console.error('[UploadPhoto] Bucket/policy setup error:', err);
    _bucketReady = true; // Don't retry every request
    return false;
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

    // Ensure bucket + policies
    const bucketOk = await ensureBucket();
    if (!bucketOk) {
      return NextResponse.json({ error: 'Error de configuración de almacenamiento.' }, { status: 500 });
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

    // Get Supabase Storage URL
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Configuración de Supabase incompleta.' }, { status: 500 });
    }

    // Determine file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${uid}/avatar.${ext}`;

    // Upload to Supabase Storage via REST API
    // Using service role key for server-side upload (bypasses RLS)
    const uploadUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/fotos-perfil/${fileName}`;

    console.log('[UploadPhoto] Uploading to:', uploadUrl, 'Size:', file.size, 'Type:', file.type);

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': file.type,
        'x-upsert': 'true', // Overwrite existing avatar
      },
      body: file,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[UploadPhoto] Upload failed:', uploadRes.status, errText);
      return NextResponse.json({ error: 'Error al subir la imagen al almacenamiento.' }, { status: 500 });
    }

    // Get public URL
    const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/fotos-perfil/${fileName}`;

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
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try to delete from storage (best-effort)
    const exts = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of exts) {
      const fileName = `${uid}/avatar.${ext}`;
      const deleteUrl = `${supabaseUrl?.replace(/\/$/, '')}/storage/v1/object/fotos-perfil/${fileName}`;
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