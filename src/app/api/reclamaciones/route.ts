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

    return NextResponse.json({ success: true, correlative: claim.correlative });
  } catch (error) {
    console.error('Error procesando el reclamo:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
