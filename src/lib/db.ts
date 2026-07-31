import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function getCourseStudentCount(slug: string): Promise<number> {
  try {
    const count = await db.user.count({
      where: {
        OR: [
          { purchases: { some: { courseId: slug, status: 'approved' } } },
          { purchases: { some: { courseId: '__ALL_COURSES__', status: 'approved' } } },
          { courseAccesses: { some: { courseId: slug, isActive: true } } },
          { courseAccesses: { some: { courseId: '__ALL_COURSES__', isActive: true } } }
        ]
      }
    });
    // Return actual count + base number (1250) or just actual count?
    // The user said: "la cantidad de alumnos debe coincidir exactamente, con los alumnos inscritos en cada curso realmente"
    // This means we should just return the actual count, or maybe 1250 + actual count if 1250 is considered the base. Let's just return the exact count, but if it's 0, it might look bad. The user said "1250 estudiantes ya inscritos", maybe they want exactly the count of DB. Let's return actual count, if they want a base we can add it later. Wait, "exactamente, con los alumnos inscritos en cada curso realmente." means just return the count from DB.
    return count;
  } catch (error) {
    console.error(`Error fetching student count for ${slug}:`, error);
    return 0; // Fallback
  }
}