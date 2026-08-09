import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const deleted = await db.wishlist.deleteMany({
      where: {
        courseId: {
          in: ['calculo-multivariable', 'fisica-2', 'CÁLCULO MULTIVARIABLE', 'FÍSICA 2', 'calculo-multivariable-1', 'fisica-2-1']
        }
      }
    });
    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
