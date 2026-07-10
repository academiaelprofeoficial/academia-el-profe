-- ============================================================
-- SQL de creación de tablas — Academia El Profe Oficial
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/mjpilrpohpmyugtxfpil/sql
-- ============================================================

-- Usuarios sincronizados desde Firebase Auth
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "photoURL" TEXT,
    "role" TEXT NOT NULL DEFAULT 'estudiante',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Compras / Transacciones
CREATE TABLE IF NOT EXISTS "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseTitle" TEXT,
    "gateway" TEXT NOT NULL,
    "gatewayPaymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payerEmail" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX IF NOT EXISTS "Purchase_userId_courseId_idx" ON "Purchase"("userId", "courseId");
CREATE INDEX IF NOT EXISTS "Purchase_gatewayPaymentId_idx" ON "Purchase"("gatewayPaymentId");
CREATE INDEX IF NOT EXISTS "Purchase_status_idx" ON "Purchase"("status");

-- Progreso de clases por alumno
CREATE TABLE IF NOT EXISTS "CourseProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "temaId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "watchTime" INTEGER NOT NULL DEFAULT 0,
    "lastPos" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CourseProgress_userId_idx" ON "CourseProgress"("userId");
CREATE INDEX IF NOT EXISTS "CourseProgress_userId_courseId_idx" ON "CourseProgress"("userId", "courseId");
CREATE UNIQUE INDEX IF NOT EXISTS "CourseProgress_userId_courseId_temaId_key" ON "CourseProgress"("userId", "courseId", "temaId");

-- Lista de deseos
CREATE TABLE IF NOT EXISTS "Wishlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_userId_courseId_key" ON "Wishlist"("userId", "courseId");

-- Tickets de Soporte
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "asunto" TEXT,
    "mensaje" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'nuevo',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SupportTicket_estado_idx" ON "SupportTicket"("estado");
CREATE INDEX IF NOT EXISTS "SupportTicket_email_idx" ON "SupportTicket"("email");

-- ============================================================
-- _prisma_migrations (requerido por Prisma para tracks)
-- ============================================================
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Confirmación
SELECT 'Tablas creadas exitosamente en Supabase!' AS resultado;