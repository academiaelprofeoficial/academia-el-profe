import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// POST /api/checkout/paypal
// Genera una URL de pago directo de PayPal (Botón de Pago)
// usando el endpoint clásico _xclick de PayPal.
// Redirige al estudiante a la pasarela de PayPal en USD.
//
// Body: { cursoId, titulo, precioUSD, userId }
// ============================================================

interface PayPalCheckoutBody {
  cursoId: string;
  titulo: string;
  precioUSD: number;
  userId?: string; // Firebase UID
}

export async function POST(request: NextRequest) {
  try {
    const body: PayPalCheckoutBody = await request.json();
    let { cursoId, titulo, precioUSD, userId } = body;

    // Sanitizar título: eliminar caracteres de ancho cero que inflan la URL
    titulo = titulo.replace(/[\u200B-\u200D\uFEFF\u2060-\u2064\u00AD]/g, '').trim().substring(0, 127);

    if (!cursoId || !titulo || !precioUSD || precioUSD <= 0) {
      return NextResponse.json(
        { error: 'Faltan datos del curso (cursoId, titulo, precioUSD).' },
        { status: 400 }
      );
    }

    // Crear registro de compra pendiente en la DB
    let purchaseId = '';
    if (userId) {
      try {
        const { createPendingPurchase } = await import('@/lib/purchase-service');
        const purchase = await createPendingPurchase({
          userId,
          courseId: cursoId,
          courseTitle: titulo,
          gateway: 'paypal',
          amount: precioUSD,
          currency: 'USD',
        });
        purchaseId = purchase.id;
      } catch (dbError) {
        console.error('[Checkout PayPal] Error al crear compra pendiente:', dbError);
      }
    }

    const paypalEmail = process.env.PAYPAL_EMAIL || 'rrojase@unac.edu.pe';
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.academiaelprofeoficial.com';

    // custom incluye purchaseId para que el IPN lo asocie
    const custom = purchaseId || `${userId || 'anon'}:${cursoId}`;

    const params = new URLSearchParams({
      cmd: '_xclick',
      business: paypalEmail,
      item_name: titulo,
      item_number: cursoId,
      amount: precioUSD.toFixed(2),
      currency_code: 'USD',
      no_shipping: '1',
      no_note: '0',
      lc: 'US',
      rm: '2',
      custom: custom,
      return: `${origin}/dashboard/cursos?status=success&gateway=paypal`,
      cancel_return: `${origin}/dashboard/cursos?status=error&gateway=paypal`,
      notify_url: `${origin}/api/webhook/paypal`,
    });

    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;

    return NextResponse.json({ url: paypalUrl });
  } catch (error) {
    console.error('[PayPal Checkout] Error interno:', error);
    return NextResponse.json(
      { error: 'Error al inicializar el pago con PayPal.' },
      { status: 500 }
    );
  }
}