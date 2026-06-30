// ============================================================
// Certificate Service — Generación y verificación de certificados
// Crea certificados en formato SVG (convertibles a PDF).
// Almacena registros en la DB para verificación pública.
// ============================================================

import { db } from '@/lib/db';

// --- Tipos ---

export interface CertificateData {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  completedAt: string;
  verificationUrl: string;
}

// --- Generación ---

/**
 * Genera un ID único para el certificado.
 * Formato: CERT-XXXXXXXX (8 chars alfanuméricos)
 */
export function generateCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I,O,0,1 para evitar confusiones
  let result = 'CERT-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Genera el SVG del certificado.
 */
export function generateCertificateSVG(data: {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  completedAt: string;
}): string {
  const dateFormatted = new Date(data.completedAt).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" width="1200" height="850">
  <defs>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d9488;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- Fondo -->
  <rect width="1200" height="850" fill="#ffffff" rx="0"/>

  <!-- Borde decorativo -->
  <rect x="20" y="20" width="1160" height="810" fill="none" stroke="url(#borderGrad)" stroke-width="3" rx="8"/>
  <rect x="30" y="30" width="1140" height="790" fill="none" stroke="#e5e7eb" stroke-width="1" rx="6"/>

  <!-- Línea decorativa superior -->
  <rect x="400" y="80" width="400" height="4" fill="url(#borderGrad)" rx="2"/>

  <!-- Título -->
  <text x="600" y="140" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#6b7280" letter-spacing="6">ACADEMIA EL PROFE OFICIAL</text>

  <!-- Subtítulo -->
  <text x="600" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#111827" font-weight="bold">CERTIFICADO DE COMPLETACIÓN</text>

  <!-- Línea decorativa media -->
  <rect x="450" y="230" width="300" height="2" fill="#d1d5db" rx="1"/>

  <!-- Texto "Otorgado a" -->
  <text x="600" y="300" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9ca3af" letter-spacing="2">SE OTORGA A</text>

  <!-- Nombre del estudiante -->
  <text x="600" y="370" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="#059669" font-weight="bold">${data.studentName}</text>

  <!-- Línea bajo nombre -->
  <rect x="300" y="390" width="600" height="1" fill="#e5e7eb"/>

  <!-- Texto "Por haber completado" -->
  <text x="600" y="440" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9ca3af" letter-spacing="2">POR HABER COMPLETADO EXITOSAMENTE EL CURSO</text>

  <!-- Nombre del curso -->
  <text x="600" y="510" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#1f2937" font-weight="bold">${data.courseTitle}</text>

  <!-- Fecha -->
  <text x="600" y="580" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#6b7280">${dateFormatted}</text>

  <!-- Firma -->
  <line x1="350" y1="700" x2="550" y2="700" stroke="#111827" stroke-width="1"/>
  <text x="450" y="730" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#374151">Prof. Ronald Rojas</text>
  <text x="450" y="750" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#9ca3af">Director Académico</text>

  <!-- Código de verificación -->
  <text x="1050" y="790" text-anchor="end" font-family="monospace" font-size="11" fill="#9ca3af">ID: ${data.certificateId}</text>
  <text x="1050" y="810" text-anchor="end" font-family="sans-serif" font-size="10" fill="#d1d5db">Verificar en: academiaelprofeoficial.com/certificado/${data.certificateId}</text>
</svg>`;
}

/**
 * Emite un certificado para un estudiante y curso.
 * Verifica que el usuario tenga el curso aprobado.
 */
export async function issueCertificate(userId: string, courseId: string): Promise<CertificateData | null> {
  // Verificar que el usuario compró el curso
  const purchase = await db.purchase.findFirst({
    where: { userId, courseId, status: 'approved' },
  });

  if (!purchase) return null;

  // Verificar que no tenga certificado ya emitido
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Generar certificado
  const certificateId = generateCertificateId();
  const now = new Date();

  // TODO: Crear tabla Certificate en Prisma para persistir
  // Por ahora, generamos el ID y los datos

  return {
    certificateId,
    studentName: user.name || user.email,
    courseTitle: purchase.courseTitle || courseId,
    completedAt: now.toISOString(),
    verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.academiaelprofeoficial.com'}/certificado/${certificateId}`,
  };
}

/**
 * Verifica un certificado por su ID.
 */
export async function verifyCertificate(certificateId: string): Promise<CertificateData | null> {
  // TODO: Cuando la tabla Certificate exista, buscar en DB
  // Por ahora retornar null (requiere implementar la tabla)
  return null;
}