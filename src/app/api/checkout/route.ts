import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// POST /api/checkout
// Crea una preferencia de pago en Mercado Pago (Checkout Pro)
// y devuelve la URL de redirección hacia la pasarela.
//
// Body: { cursoId, titulo, precio, userId }
// ============================================================

interface CheckoutRequestBody {
  cursoId: string;
  titulo: string;
  precio: number;
  userId?: string; // Firebase UID
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { cursoId, titulo, precio, userId } = body;

    if (!cursoId || !titulo || !precio || precio <= 0) {
      return NextResponse.json(
        { error: 'Faltan datos del curso (cursoId, titulo, precio).' },
        { status: 400 }
      );
    }

    // Validar credenciales de Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken || accessToken.includes('XXXXXXXX')) {
      return NextResponse.json(
        { error: 'Las credenciales de Mercado Pago no están configuradas.' },
        { status: 503 }
      );
    }

    // Crear registro de compra pendiente en la DB
    let purchaseId = '';
    if (userId) {
      try {
        const { syncUser, createPendingPurchase } = await import('@/lib/purchase-service');
        await syncUser(userId, '', ''); // sync básico sin email (no lo tenemos aquí)
        const purchase = await createPendingPurchase({
          userId,
          courseId: cursoId,
          courseTitle: titulo,
          gateway: 'mercadopago',
          amount: precio,
          currency: 'PEN',
        });
        purchaseId = purchase.id;
      } catch (dbError) {
        console.error('[Checkout MP] Error al crear compra pendiente:', dbError);
        // No bloquear el checkout si la DB falla
      }
    }

    // Construir URLs de retorno dinámicamente
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.academiaelprofeoficial.com';

    // external_reference incluye purchaseId para que el webhook lo encuentre
    const externalRef = purchaseId || `${userId || 'anon'}:${cursoId}`;

    // Crear preferencia con la API REST de Mercado Pago
    const preferencePayload = {
      items: [
        {
          id: cursoId,
          title: titulo,
          quantity: 1,
          unit_price: Number(precio),
          currency_id: 'PEN',
          category_id: 'education',
        },
      ],
      back_urls: {
        success: `${origin}/dashboard/cursos?status=success&gateway=mercadopago`,
        failure: `${origin}/dashboard/cursos?status=error&gateway=mercadopago`,
        pending: `${origin}/dashboard/cursos?status=pending&gateway=mercadopago`,
      },
      auto_return: 'approved',
      notification_url: `${origin}/api/webhook/mercadopago`,
      external_reference: externalRef,
      statement_descriptor: 'ACADEMIA EL PROFE',
    };

    const mpResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Idempotency-Key': `${cursoId}-${Date.now()}`,
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('[MercadoPago] Error al crear preferencia:', mpResponse.status, errorData);
      return NextResponse.json(
        { error: 'Error al crear la preferencia de pago. Intenta nuevamente.' },
        { status: 502 }
      );
    }

    const data = await mpResponse.json();

    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error('[Checkout] Error interno:', error);
    return NextResponse.json(
      { error: 'Error al inicializar el pago.' },
      { status: 500 }
    );
  }
}