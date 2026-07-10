// ============================================================
// Purchase Service — Academia El Profe Oficial
// Lógica de negocio para compras, verificación y acceso a cursos.
// Usa Prisma (compatible SQLite dev / PostgreSQL producción).
// ============================================================

import { db } from '@/lib/db';

// --- Tipos ---

export interface PurchaseRecord {
  id: string;
  courseId: string;
  courseTitle: string | null;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  approvedAt: string | null;
  createdAt: string; // purchase ID (used as fallback timestamp)
}

// --- Funciones de negocio ---

/**
 * Sincroniza un usuario de Firebase Auth a la base de datos local.
 * Se llama cada vez que el usuario inicia sesión.
 */
export async function syncUser(firebaseUid: string, email: string, name?: string, photoURL?: string) {
  return db.user.upsert({
    where: { id: firebaseUid },
    update: { email, name, photoURL },
    create: { id: firebaseUid, email, name, photoURL },
  });
}

/**
 * Registra una nueva compra (estado pending).
 * Se llama antes de redirigir a la pasarela de pago.
 */
export async function createPendingPurchase(data: {
  userId: string;
  courseId: string;
  courseTitle: string;
  gateway: 'mercadopago' | 'paypal';
  amount: number;
  currency: 'PEN' | 'USD';
}) {
  return db.purchase.create({
    data: {
      userId: data.userId,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      gateway: data.gateway,
      amount: data.amount,
      currency: data.currency,
      status: 'pending',
    },
  });
}

/**
 * Aprueba una compra existente (llamado por webhooks).
 */
export async function approvePurchase(params: {
  gatewayPaymentId: string;
  courseId?: string;
  userId?: string;
  payerEmail?: string;
}) {
  // Buscar la compra pendiente por gatewayPaymentId
  const existing = await db.purchase.findFirst({
    where: { gatewayPaymentId: params.gatewayPaymentId },
  });

  if (existing) {
    return db.purchase.update({
      where: { id: existing.id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        payerEmail: params.payerEmail ?? existing.payerEmail,
      },
    });
  }

  // Fallback: buscar por userId + courseId si no se encontró por gatewayPaymentId
  if (params.userId && params.courseId) {
    const byUserCourse = await db.purchase.findFirst({
      where: {
        userId: params.userId,
        courseId: params.courseId,
        status: 'pending',
      },
      orderBy: { id: 'desc' },
    });

    if (byUserCourse) {
      return db.purchase.update({
        where: { id: byUserCourse.id },
        data: {
          status: 'approved',
          gatewayPaymentId: params.gatewayPaymentId,
          approvedAt: new Date(),
          payerEmail: params.payerEmail,
        },
      });
    }
  }

  return null;
}

/**
 * Rechaza una compra.
 */
export async function rejectPurchase(gatewayPaymentId: string) {
  const existing = await db.purchase.findFirst({
    where: { gatewayPaymentId },
  });

  if (existing) {
    return db.purchase.update({
      where: { id: existing.id },
      data: { status: 'rejected' },
    });
  }

  return null;
}

/**
 * Obtiene los slugs de cursos comprados (aprobados) para un usuario.
 */
export async function getPurchasedCourseIds(userId: string): Promise<string[]> {
  const purchases = await db.purchase.findMany({
    where: {
      userId,
      status: 'approved',
    },
    select: { courseId: true },
  });

  return purchases.map((p) => p.courseId);
}

/**
 * Verifica si un usuario tiene acceso a un curso específico.
 * Incluye compras aprobadas y accesos manuales otorgados por admin.
 */
export async function hasCourseAccess(userId: string, courseId: string): Promise<boolean> {
  const [purchase, manualAccess] = await Promise.all([
    db.purchase.findFirst({
      where: { userId, courseId, status: 'approved' },
    }),
    db.courseAccess.findFirst({
      where: { userId, courseId, isActive: true },
    }),
  ]);

  return !!purchase || !!manualAccess;
}

/**
 * Obtiene el historial de compras de un usuario.
 */
export async function getUserPurchases(userId: string): Promise<PurchaseRecord[]> {
  const purchases = await db.purchase.findMany({
    where: { userId },
    orderBy: { id: 'desc' },
  });

  return purchases.map((p) => ({
    id: p.id,
    courseId: p.courseId,
    courseTitle: p.courseTitle,
    gateway: p.gateway,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    approvedAt: p.approvedAt?.toISOString() ?? null,
    createdAt: p.id,
  }));
}

/**
 * Verifica el estado de un pago por su external_reference.
 * Formato del external_reference: "purchaseId" o "userId:cursoId:purchaseId"
 */
export async function verifyPurchaseByExternalRef(externalRef: string) {
  // Intentar encontrar por ID de compra directo
  let purchase = await db.purchase.findUnique({
    where: { id: externalRef },
  });

  if (!purchase && externalRef.includes(':')) {
    // Formato: userId:cursoId:purchaseId
    const parts = externalRef.split(':');
    const purchaseId = parts[parts.length - 1];
    purchase = await db.purchase.findUnique({
      where: { id: purchaseId },
    });
  }

  return purchase;
}

/**
 * Agrega un curso a la lista de deseos.
 */
export async function addToWishlist(userId: string, courseId: string) {
  return db.wishlist.create({
    data: { userId, courseId },
  }).catch(() => null); // Ignorar duplicados
}

/**
 * Elimina un curso de la lista de deseos.
 */
export async function removeFromWishlist(userId: string, courseId: string) {
  try {
    await db.wishlist.deleteMany({ where: { userId, courseId } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene los courseIds de la lista de deseos.
 */
export async function getWishlistCourseIds(userId: string): Promise<string[]> {
  const items = await db.wishlist.findMany({
    where: { userId },
    select: { courseId: true },
  });

  return items.map((w) => w.courseId);
}

// --- Métricas para Admin ---

export interface AdminMetrics {
  totalStudents: number;
  totalRevenue: number;
  totalPurchases: number;
  recentPurchases: PurchaseRecord[];
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [totalStudents, purchases] = await Promise.all([
    db.user.count(),
    db.purchase.findMany({
      where: { status: 'approved' },
      orderBy: { approvedAt: 'desc' },
      take: 20,
    }),
  ]);

  const approvedPurchases = purchases;
  const totalRevenue = approvedPurchases.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalStudents,
    totalRevenue,
    totalPurchases: approvedPurchases.length,
    recentPurchases: approvedPurchases.map((p) => ({
      id: p.id,
      courseId: p.courseId,
      courseTitle: p.courseTitle,
      gateway: p.gateway,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      approvedAt: p.approvedAt?.toISOString() ?? null,
      createdAt: p.id,
    })),
  };
}