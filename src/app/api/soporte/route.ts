// ============================================================
// POST /api/soporte
// Recibe consultas del formulario de soporte y las guarda en DB.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, asunto, mensaje, userId } = await request.json();

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ error: 'Faltan campos requeridos (nombre, email, mensaje).' }, { status: 400 });
    }

    // Guardar en la tabla SupportTicket
    const ticket = await db.supportTicket.create({
      data: {
        nombre: String(nombre).trim(),
        email: String(email).trim().toLowerCase(),
        asunto: asunto ? String(asunto).trim() : null,
        mensaje: String(mensaje).trim(),
        userId: userId || null,
      },
    });

    console.log('[Soporte] Ticket creado:', ticket.id, { nombre, email, asunto });

    // Enviar email de notificación al profe
    try {
      const { sendEmail, supportTicketEmail } = await import('@/lib/email-service');
      const emailData = supportTicketEmail({
        nombre: String(nombre),
        email: String(email),
        asunto: asunto ? String(asunto) : '',
        mensaje: String(mensaje),
        ticketId: ticket.id,
      });
      await sendEmail(emailData);
    } catch (emailErr) {
      console.error('[Soporte] Error al enviar email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: 'Tu consulta ha sido enviada. Te responderemos pronto.',
    });
  } catch (error) {
    console.error('[Soporte] Error:', error);
    return NextResponse.json({ error: 'Error al enviar la consulta.' }, { status: 500 });
  }
}