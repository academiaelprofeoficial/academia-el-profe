import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// POST /api/webhook/mercadopago
// Webhook que recibe notificaciones de pago de Mercado Pago.
// Al recibir un pago aprobado, activa el acceso al curso en la DB.
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Solo procesar notificaciones de tipo "payment"
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken || accessToken.includes('XXXXXXXX')) {
      console.error('[Webhook MP] Credenciales no configuradas.');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Consultar el estado real del pago a MP
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!paymentResponse.ok) {
      console.error('[Webhook MP] No se pudo consultar el pago:', paymentId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payment = await paymentResponse.json();

    console.log('[Webhook MP] Pago recibido:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      payer_email: payment.payer?.email,
    });

    // --- Activar curso si el pago fue aprobado ---
    if (payment.status === 'approved') {
      const { approvePurchase } = await import('@/lib/purchase-service');

      const externalRef = payment.external_reference || '';

      // Intentar encontrar la compra por external_reference (es el purchaseId)
      const result = await approvePurchase({
        gatewayPaymentId: String(payment.id),
        payerEmail: payment.payer?.email,
      });

      if (result) {
        console.log(`[Webhook MP] ✅ Compra ${result.id} aprobada — curso: ${result.courseId}`);

        // Enviar email de confirmación
        if (result.payerEmail || payment.payer?.email) {
          try {
            const { sendEmail, purchaseConfirmationEmail } = await import('@/lib/email-service');
            const emailData = purchaseConfirmationEmail({
              nombre: payment.payer?.first_name || result.payerEmail || 'Estudiante',
              email: result.payerEmail || payment.payer?.email || '',
              courseTitle: result.courseTitle || result.courseId,
              gateway: 'mercadopago',
              amount: payment.transaction_amount || result.amount,
              currency: payment.currency_id || result.currency,
            });
            await sendEmail(emailData);
          } catch (emailErr) {
            console.error('[Webhook MP] Error al enviar email:', emailErr);
          }
        }
      } else {
        // No se encontró la compra en la DB — crearla directamente (fallback)
        console.warn('[Webhook MP] Compra no encontrada en DB, creando registro directo...');

        // Extraer info del pago
        const courseId = payment.additional_info?.items?.[0]?.id || payment.description || '';
        const { createPendingPurchase, approvePurchase: approve } = await import('@/lib/purchase-service');

        // No tenemos userId aquí, usar email como identificador temporal
        const payerEmail = payment.payer?.email || 'unknown';
        const tempUserId = `mp_${payerEmail}`;

        try {
          // Sync usuario temporal
          const { syncUser } = await import('@/lib/purchase-service');
          await syncUser(tempUserId, payerEmail, payment.payer?.first_name);

          const pending = await createPendingPurchase({
            userId: tempUserId,
            courseId,
            courseTitle: payment.description || courseId,
            gateway: 'mercadopago',
            amount: payment.transaction_amount,
            currency: payment.currency_id,
          });

          await approve({
            gatewayPaymentId: String(payment.id),
            payerEmail,
          });

          console.log(`[Webhook MP] ✅ Compra de respaldo creada y aprobada — curso: ${courseId}`);
        } catch (fallbackError) {
          console.error('[Webhook MP] Error en fallback:', fallbackError);
        }
      }
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      const { rejectPurchase } = await import('@/lib/purchase-service');
      await rejectPurchase(String(payment.id));
      console.log(`[Webhook MP] ❌ Pago ${payment.id} rechazado/cancelado`);
    }

    // Mercado Pago espera 200 OK siempre
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Webhook MP] Error:', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// GET para verificación de que el webhook está activo
export async function GET() {
  return NextResponse.json({ status: 'webhook mercadopago active' });
}