import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin-auth';

// ============================================================
// API: /api/admin/nosotros
// GET  → Obtener contenido de página nosotros
// PUT  → Actualizar contenido de página nosotros
// ============================================================

export async function GET() {
  try {
    // Auto-crear tabla si no existe (idempotente)
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS pagina_nosotros (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        titulo_principal TEXT NOT NULL DEFAULT '',
        subtitulo_principal TEXT DEFAULT '',
        texto_historia TEXT DEFAULT '',
        prof_nombre TEXT NOT NULL DEFAULT '',
        prof_titulo TEXT DEFAULT '',
        prof_descripcion TEXT DEFAULT '',
        prof_foto_url TEXT DEFAULT '',
        caracteristicas JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Obtener la primera fila
    const rows = await db.$queryRawUnsafe<any[]>(`
      SELECT * FROM pagina_nosotros ORDER BY created_at ASC LIMIT 1
    `);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: null });
    }

    const row = rows[0];

    // Parsear JSONB
    let caracteristicas = row.caracteristicas;
    if (typeof caracteristicas === 'string') {
      try { caracteristicas = JSON.parse(caracteristicas); } catch { caracteristicas = []; }
    }

    return NextResponse.json({
      data: {
        id: row.id,
        titulo_principal: row.titulo_principal || '',
        subtitulo_principal: row.subtitulo_principal || '',
        texto_historia: row.texto_historia || '',
        prof_nombre: row.prof_nombre || '',
        prof_titulo: row.prof_titulo || '',
        prof_descripcion: row.prof_descripcion || '',
        prof_foto_url: row.prof_foto_url || '',
        caracteristicas: caracteristicas || [],
        updated_at: row.updated_at,
        created_at: row.created_at,
      },
    });
  } catch (error: any) {
    console.error('[API] Error GET /api/admin/nosotros:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, titulo_principal, subtitulo_principal, texto_historia, prof_nombre, prof_titulo, prof_descripcion, prof_foto_url, caracteristicas } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });
    }

    const caracteristicasJson = typeof caracteristicas === 'string'
      ? caracteristicas
      : JSON.stringify(caracteristicas || []);

    await db.$executeRawUnsafe(
      `UPDATE pagina_nosotros
       SET titulo_principal = $1, subtitulo_principal = $2, texto_historia = $3,
           prof_nombre = $4, prof_titulo = $5, prof_descripcion = $6,
           prof_foto_url = $7, caracteristicas = $8::jsonb,
           updated_at = NOW()
       WHERE id = $9::uuid`,
      titulo_principal || '',
      subtitulo_principal || '',
      texto_historia || '',
      prof_nombre || '',
      prof_titulo || '',
      prof_descripcion || '',
      prof_foto_url || '',
      caracteristicasJson,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] Error PUT /api/admin/nosotros:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
