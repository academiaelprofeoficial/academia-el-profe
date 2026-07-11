import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tables = await db.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const columns = await db.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          table_name = 'User'
          OR table_name = 'users'
          OR table_name = 'perfiles'
        )
      ORDER BY table_name, ordinal_position;
    `);
    return NextResponse.json({ tables, columns });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}