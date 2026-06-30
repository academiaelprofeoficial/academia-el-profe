// ============================================================
// Email Service — Academia El Profe Oficial
// Usa Resend para enviar notificaciones por email.
// Si no hay RESEND_API_KEY configurada, loguea y no envía.
// ============================================================

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envía un email usando Resend (o fallback a console.log).
 * Regístrate en https://resend.com para obtener una API key.
 */
export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[Email] SKIPPED (no RESEND_API_KEY): To=${to}, Subject=${subject}`);
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Academia El Profe <noreply@academiaelprofeoficial.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Error de Resend:', response.status, error);
      return false;
    }

    console.log(`[Email] ✅ Enviado a ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Error:', error);
    return false;
  }
}

// --- Templates ---

export function purchaseConfirmationEmail(data: {
  nombre: string;
  email: string;
  courseTitle: string;
  gateway: string;
  amount: number;
  currency: string;
}): EmailPayload {
  const moneda = data.currency === 'PEN'
    ? `S/ ${data.amount.toFixed(2)}`
    : `$${data.amount.toFixed(2)}`;

  return {
    to: data.email,
    subject: `Curso activado: ${data.courseTitle} — Academia El Profe Oficial`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #059669; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Academia El Profe Oficial</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; margin-top: 0;">Hola, ${data.nombre}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Tu compra ha sido confirmada exitosamente. Ya tienes acceso completo al curso:
          </p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="font-weight: bold; color: #111827; margin: 0 0 8px 0; font-size: 18px;">${data.courseTitle}</p>
            <p style="color: #059669; font-weight: bold; font-size: 20px; margin: 0;">${moneda}</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
              Pago via ${data.gateway === 'mercadopago' ? 'Mercado Pago' : 'PayPal'}
            </p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            Accede a tus clases desde tu dashboard:
          </p>
          <a href="https://www.academiaelprofeoficial.com/dashboard/cursos"
             style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            IR A MIS CURSOS
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Tienes acceso de por vida. Si tienes alguna duda, responde a este email.
          </p>
        </div>
      </div>
    `,
  };
}

export function supportTicketEmail(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  ticketId: string;
}): EmailPayload {
  return {
    to: 'rrojase@unac.edu.pe', // Email del profe
    subject: `[Soporte] ${data.asunto || 'Nueva consulta'} — ${data.nombre}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111827;">Nueva consulta de soporte</h2>
        <p style="color: #4b5563;">Ticket ID: <strong>${data.ticketId}</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Nombre</td><td style="padding: 8px; font-weight: bold;">${data.nombre}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Email</td><td style="padding: 8px; font-weight: bold;">${data.email}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Asunto</td><td style="padding: 8px; font-weight: bold;">${data.asunto || '—'}</td></tr>
        </table>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #059669;">
          <p style="color: #111827; margin: 0; white-space: pre-wrap;">${data.mensaje}</p>
        </div>
      </div>
    `,
  };
}