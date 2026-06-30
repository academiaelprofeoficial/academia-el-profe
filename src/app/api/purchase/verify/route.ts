// ============================================================
// GET /api/purchase/verify?gateway=mercadopago&paymentId=xxx
// Verifica el estado real de un pago con la pasarela.
// Útil cuando el usuario regresa del pago para confirmar estado.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gateway = searchParams.get('gateway');
    const paymentId = searchParams.get('paymentId');

    if (!gateway || !paymentId) {
      return NextResponse.json({ error: 'Faltan parámetros gateway y paymentId.' }, { status: 400 });
    }

    if (gateway === 'mercadopago') {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken || accessToken.includes('XXXXXXXX')) {
        return NextResponse.json({ error: 'Credenciales MP no configuradas.' }, { status: 503 });
      }

      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!mpResponse.ok) {
        return NextResponse.json({ error: 'No se pudo verificar el pago con MP.' }, { status: 502 });
      }

      const payment = await mpResponse.json();
      return NextResponse.json({
        status: payment.status, // approved, pending, rejected
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        external_reference: payment.external_reference,
        date_approved: payment.date_approved,
      });
    }

    if (gateway === 'paypal') {
      // PayPal _xclick no tiene API server-side sin SDK.
      // La verificación se hace vía IPN webhook. Aquí verificamos en nuestra DB.
      const { verifyPurchaseByExternalRef } = await import('@/lib/purchase-service');
      const purchase = await verifyPurchaseByExternalRef(paymentId);

      if (purchase) {
        return NextResponse.json({
          status: purchase.status === 'approved' ? 'completed' : purchase.status,
          amount: purchase.amount,
          currency: purchase.currency,
          courseId: purchase.courseId,
        });
      }

      return NextResponse.json({ status: 'unknown', message: 'Compra no encontrada. El IPN puede llegar en unos minutos.' });
    }

    return NextResponse.json({ error: 'Gateway no soportado.' }, { status: 400 });
  } catch (error) {
    console.error('[Purchase Verify] Error:', error);
    return NextResponse.json({ error: 'Error al verificar el pago.' }, { status: 500 });
  }
}