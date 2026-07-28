import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Generar correlativo (ej: 2024-000001)
    const year = new Date().getFullYear().toString();
    const lastClaim = await prisma.claim.findFirst({
      where: { correlative: { startsWith: `${year}-` } },
      orderBy: { createdAt: 'desc' },
    });

    let nextNumber = 1;
    if (lastClaim && lastClaim.correlative) {
      const parts = lastClaim.correlative.split('-');
      if (parts.length === 2) {
        nextNumber = parseInt(parts[1], 10) + 1;
      }
    }

    const correlative = `${year}-${nextNumber.toString().padStart(6, '0')}`;

    // Validar datos mínimos
    if (!body.consumerName || !body.consumerId || !body.consumerEmail || !body.claimDetail || !body.consumerRequest) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Guardar en la BD
    const claim = await prisma.claim.create({
      data: {
        correlative,
        consumerName: body.consumerName,
        consumerIdType: body.consumerIdType || 'DNI',
        consumerId: body.consumerId,
        consumerPhone: body.consumerPhone || '',
        consumerEmail: body.consumerEmail,
        consumerAddress: body.consumerAddress || '',
        isMinor: !!body.isMinor,
        parentName: body.parentName || null,
        parentId: body.parentId || null,
        contractType: body.contractType || 'Producto',
        amount: parseFloat(body.amount) || 0,
        description: body.description || '',
        claimType: body.claimType || 'Reclamo',
        claimDetail: body.claimDetail,
        consumerRequest: body.consumerRequest,
      }
    });

    // Enviar alerta por correo
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'Reclamaciones <onboarding@resend.dev>', // Usar correo verificado si está en producción
          to: 'academiaelprofeoficial@gmail.com',
          subject: `Nuevo ${claim.claimType} Registrado - ${claim.correlative}`,
          html: `
            <h2>Nuevo Registro en Libro de Reclamaciones</h2>
            <p><strong>Correlativo:</strong> ${claim.correlative}</p>
            <p><strong>Tipo:</strong> ${claim.claimType}</p>
            <p><strong>Cliente:</strong> ${claim.consumerName} (${claim.consumerIdType} ${claim.consumerId})</p>
            <p><strong>Email Cliente:</strong> ${claim.consumerEmail}</p>
            <p><strong>Teléfono:</strong> ${claim.consumerPhone}</p>
            <hr />
            <h3>Detalle del Bien Contratado</h3>
            <p><strong>Descripción:</strong> ${claim.description}</p>
            <p><strong>Monto Reclamado:</strong> S/ ${claim.amount}</p>
            <hr />
            <h3>Detalle</h3>
            <p>${claim.claimDetail}</p>
            <h3>Pedido del Cliente</h3>
            <p>${claim.consumerRequest}</p>
            <br/>
            <p><small>Recuerda que tienes un plazo máximo de 15 días hábiles para responder.</small></p>
          `
        });
      } catch (emailError) {
        console.error('Error enviando email con Resend:', emailError);
        // No bloqueamos la respuesta al cliente si falla el correo
      }
    }

    return NextResponse.json({ success: true, correlative: claim.correlative });
  } catch (error) {
    console.error('Error procesando el reclamo:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
