import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const allItems = await db.wishlist.findMany();
    return NextResponse.json({ success: true, allItems });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
