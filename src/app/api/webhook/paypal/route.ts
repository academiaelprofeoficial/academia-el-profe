import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// POST /api/webhook/paypal
// IPN (Instant Payment Notification) de PayPal.
// Recibe notificaciones POST con los datos del pago.
// VERIFICA autenticidad con PayPal antes de procesar.
// ============================================================

/**
 * Verificación IPN de PayPal: re-envía el payload al endpoint de PayPal
 * con cmd=_notify-validate. Si PayPal responde "VERIFIED", la notificación es legítima.
 */
async function verifyIPN(rawBody: string): Promise<boolean> {
  const paypalDomain = process.env.NODE_ENV === 'production'
    ? 'https://ipnpb.paypal.com'
    : 'https://ipnpb.sandbox.paypal.com';

  const verifyBody = `cmd=_notify-validate&${rawBody}`;

  const response = await fetch(paypalDomain + '/cgi-bin/webscr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: verifyBody,
  });

  const responseBody = await response.text();
  return responseBody === 'VERIFIED';
}

export async function POST(request: NextRequest) {
  try {
    // PayPal IPN envía datos como form-urlencoded
    const rawBody = await request.text();
    const params = new URLSearchParams(rawBody);

    const txnId = params.get('txn_id') || '';
    const txnType = params.get('txn_type') || '';
    const paymentStatus = params.get('payment_status') || '';
    const custom = params.get('custom') || ''; // Nuestro purchaseId
    const itemNumber = params.get('item_number') || ''; // courseId
    const payerEmail = params.get('payer_email') || '';
    const receiverEmail = params.get('receiver_email') || '';
    const mcGross = params.get('mc_gross') || '';
    const mcCurrency = params.get('mc_currency') || 'USD';

    console.log('[Webhook PayPal] Notificación recibida:', {
      txnId, txnType, paymentStatus, custom, itemNumber, payerEmail, amount: mcGross,
    });

    // --- VERIFICACIÓN DE AUTENTICIDAD ---
    const isVerified = await verifyIPN(rawBody);
    if (!isVerified) {
      console.error('[Webhook PayPal] ❌ IPN NO verificado — posible falsificación. Ignorando.');
      return new Response('OK', { status: 200 });
    }
    console.log('[Webhook PayPal] ✅ IPN verificado como auténtico');

    // --- Verificar que el pago va a nuestra cuenta ---
    const expectedReceiver = process.env.PAYPAL_EMAIL || 'rrojase@unac.edu.pe';
    if (receiverEmail && receiverEmail.toLowerCase() !== expectedReceiver.toLowerCase()) {
      console.error(`[Webhook PayPal] ❌ Receiver mismatch: ${receiverEmail} ≠ ${expectedReceiver}`);
      return new Response('OK', { status: 200 });
    }

    // Solo procesar pagos completados
    if (paymentStatus !== 'Completed') {
      console.log(`[Webhook PayPal] Ignorando estado: ${paymentStatus}`);
      return new Response('OK', { status: 200 });
    }

    const { approvePurchase, createPendingPurchase, syncUser } = await import('@/lib/purchase-service');

    // Intentar aprobar la compra existente (por purchaseId en custom)
    const result = await approvePurchase({
      gatewayPaymentId: txnId,
      payerEmail,
    });

    if (result) {
      console.log(`[Webhook PayPal] ✅ Compra ${result.id} aprobada — curso: ${result.courseId}`);
    } else {
      // Fallback: crear la compra directamente
      console.warn('[Webhook PayPal] Compra no encontrada en DB, creando registro directo...');

      const courseId = itemNumber || 'unknown';
      const tempUserId = custom.includes(':') ? custom.split(':')[0] : `pp_${payerEmail}`;

      try {
        await syncUser(tempUserId, payerEmail);

        await createPendingPurchase({
          userId: tempUserId,
          courseId,
          courseTitle: params.get('item_name') || courseId,
          gateway: 'paypal',
          amount: parseFloat(mcGross),
          currency: mcCurrency as 'USD',
        });

        await approvePurchase({
          gatewayPaymentId: txnId,
          payerEmail,
        });

        console.log(`[Webhook PayPal] ✅ Compra de respaldo creada — curso: ${courseId}`);
      } catch (fallbackError) {
        console.error('[Webhook PayPal] Error en fallback:', fallbackError);
      }
    }

    // PayPal IPN espera 200 OK siempre
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[Webhook PayPal] Error:', error);
    return new Response('OK', { status: 200 });
  }
}

// GET para verificación
export async function GET() {
  return NextResponse.json({ status: 'webhook paypal active' });
}