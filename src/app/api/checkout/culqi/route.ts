import { NextRequest, NextResponse } from 'next/server';
import { syncUser, createPendingPurchase, markPurchaseSuccess } from '@/lib/purchase-service';

interface CulqiChargeRequest {
  tokenId: string;
  cursoId: string;
  titulo: string;
  precio: number; // in PEN
  userId?: string;
  userEmail?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CulqiChargeRequest = await request.json();
    let { tokenId, cursoId, titulo, precio, userId, userEmail } = body;

    // Sanitizar título
    titulo = titulo.replace(/[\u200B-\u200D\uFEFF\u2060-\u2064\u00AD]/g, '').trim().substring(0, 127);

    if (!tokenId || !cursoId || !titulo || !precio || precio <= 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (tokenId, cursoId, titulo, precio).' },
        { status: 400 }
      );
    }

    const secretKey = process.env.CULQI_SECRET_KEY;
    if (!secretKey) {
      console.error('[Culqi] CULQI_SECRET_KEY no está configurada.');
      return NextResponse.json(
        { error: 'El servicio de pagos no está configurado correctamente.' },
        { status: 503 }
      );
    }

    // 1. Crear cargo en Culqi
    const chargePayload = {
      amount: Math.round(precio * 100), // Culqi usa céntimos
      currency_code: 'PEN',
      email: userEmail || 'invitado@academiaelprofeoficial.com',
      source_id: tokenId,
      description: `Compra: ${titulo}`,
      antifraud_details: {
        first_name: userId || 'Usuario',
        last_name: 'Registrado',
        email: userEmail || 'invitado@academiaelprofeoficial.com',
        phone_number: '000000000',
      }
    };

    const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(chargePayload),
    });

    const culqiData = await culqiRes.json();

    if (!culqiRes.ok || culqiData.object === 'error') {
      console.error('[Culqi] Error al crear cargo:', culqiData);
      return NextResponse.json(
        { error: culqiData.user_message || 'Hubo un problema al procesar la tarjeta con Culqi.' },
        { status: 400 }
      );
    }

    // El cargo fue exitoso si el objeto retornado es un 'charge'
    if (culqiData.object === 'charge') {
      // 2. Registrar compra en base de datos
      if (userId) {
        try {
          if (userEmail) {
            await syncUser(userId, userEmail, ''); // sync básico
          }
          const purchase = await createPendingPurchase({
            userId,
            courseId: cursoId,
            courseTitle: titulo,
            gateway: 'culqi',
            amount: precio,
            currency: 'PEN',
          });

          // Aprobar la compra inmediatamente (cargo exitoso)
          await markPurchaseSuccess(purchase.id, culqiData.id); // Guardar culqiData.id como external reference
        } catch (dbError) {
          console.error('[Culqi] Error al registrar compra en DB:', dbError);
          // OJO: El cargo ya se hizo. No podemos fallar aquí. Devolvemos éxito de todas formas.
          // En un sistema robusto, se reintentaría o se guardaría en una cola.
        }
      }

      return NextResponse.json({ success: true, chargeId: culqiData.id });
    }

    // Fallo desconocido
    return NextResponse.json(
      { error: 'Respuesta inesperada del proveedor de pagos.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[Checkout Culqi] Error interno:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el pago.' },
      { status: 500 }
    );
  }
}
