// ============================================================
// GET /api/admin/metrics
// Métricas completas para el panel de administración.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const [
      totalUsers,
      totalPurchases,
      approvedPurchases,
      pendingPurchases,
      rejectedPurchases,
      totalTickets,
      newTickets,
      wishlistCount,
      progressRecords,
    ] = await Promise.all([
      db.user.count(),
      db.purchase.count(),
      db.purchase.count({ where: { status: 'approved' } }),
      db.purchase.count({ where: { status: 'pending' } }),
      db.purchase.count({ where: { status: 'rejected' } }),
      db.supportTicket.count(),
      db.supportTicket.count({ where: { estado: 'nuevo' } }),
      db.wishlist.count(),
      db.courseProgress.count({ where: { completed: true } }),
    ]);

    // Ingresos
    const revenueData = await db.purchase.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true },
    });
    const totalRevenuePEN = revenueData._sum.amount || 0;

    // Ingresos por gateway
    const revenueMP = await db.purchase.aggregate({
      where: { status: 'approved', gateway: 'mercadopago' },
      _sum: { amount: true },
      _count: true,
    });
    const revenuePP = await db.purchase.aggregate({
      where: { status: 'approved', gateway: 'paypal' },
      _sum: { amount: true },
      _count: true,
    });

    // Últimas 20 compras
    const recentPurchases = await db.purchase.findMany({
      orderBy: { id: 'desc' },
      take: 20,
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    // Últimos 5 usuarios registrados
    const recentUsers = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, name: true, photoURL: true, role: true, createdAt: true },
    });

    // Tickets recientes
    const recentTickets = await db.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      // KPIs principales
      totalUsers,
      totalStudents: totalUsers,
      totalPurchases: approvedPurchases,
      pendingPurchases,
      rejectedPurchases,
      totalRevenuePEN,
      totalRevenueUSD: +(totalRevenuePEN * 0.27).toFixed(2),
      ticketPromedio: approvedPurchases > 0 ? +(totalRevenuePEN / approvedPurchases).toFixed(2) : 0,

      // Por gateway
      mercadopago: {
        ventas: revenueMP._count,
        ingresos: revenueMP._sum.amount || 0,
      },
      paypal: {
        ventas: revenuePP._count,
        ingresos: revenuePP._sum.amount || 0,
      },

      // Actividad
      wishlistCount,
      clasesCompletadas: progressRecords,
      totalTickets,
      newTickets,

      // Datos recientes
      recentPurchases: recentPurchases.map((p) => ({
        id: p.id,
        courseId: p.courseId,
        courseTitle: p.courseTitle,
        gateway: p.gateway,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        payerEmail: p.payerEmail,
        approvedAt: p.approvedAt?.toISOString() || null,
        userEmail: p.user?.email || null,
        userName: p.user?.name || null,
      })),
      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      recentTickets: recentTickets.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Admin Metrics] Error:', error);
    return NextResponse.json({ error: 'Error al obtener métricas.' }, { status: 500 });
  }
}