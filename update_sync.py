import re

with open('src/lib/purchase-service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_syncUser = '''export async function syncUser(firebaseUid: string, email: string, name?: string, photoURL?: string) {
  if (!email) return null; // Prevenir error de base de datos con email vacío

  // 1. Verificar si el email ya existe bajo otro ID (e.g. cuenta temporal de Admin o Webhook MP)
  const existingByEmail = await db.user.findUnique({
    where: { email },
  });

  if (existingByEmail && existingByEmail.id !== firebaseUid) {
    const oldId = existingByEmail.id;
    
    // A. Crear o actualizar la cuenta con el UID real
    await db.user.upsert({
      where: { id: firebaseUid },
      update: { email, name, photoURL: photoURL || undefined },
      create: { id: firebaseUid, email, name, photoURL },
    });

    // B. Migrar todas las relaciones, ignorando colisiones únicas (si el usuario ya tenía ese curso/progreso)
    try { await db.purchase.updateMany({ where: { userId: oldId }, data: { userId: firebaseUid } }); } catch(e) { console.error(e) }
    try { await db.courseAccess.updateMany({ where: { userId: oldId }, data: { userId: firebaseUid } }); } catch(e) { console.error(e) }
    try { await db.courseProgress.updateMany({ where: { userId: oldId }, data: { userId: firebaseUid } }); } catch(e) { console.error(e) }
    try { await db.wishlist.updateMany({ where: { userId: oldId }, data: { userId: firebaseUid } }); } catch(e) { console.error(e) }
    try { await db.comment.updateMany({ where: { userId: oldId }, data: { userId: firebaseUid } }); } catch(e) { console.error(e) }
    try { await db.supportTicket.updateMany({ where: { userId: oldId }, data: { userId: firebaseUid } }); } catch(e) { console.error(e) }

    // C. Eliminar la cuenta temporal
    try { await db.user.delete({ where: { id: oldId } }); } catch(e) { console.error(e) }
    
    return db.user.findUnique({ where: { id: firebaseUid } });
  }

  // 2. Flujo normal
  const existing = await db.user.findUnique({
    where: { id: firebaseUid },
    select: { photoURL: true },
  }).catch(() => null);

  const hasCustomPhoto = existing?.photoURL?.includes('supabase.co/storage');

  return db.user.upsert({
    where: { id: firebaseUid },
    update: {
      email,
      name,
      ...(hasCustomPhoto ? {} : { photoURL }),
    },
    create: { id: firebaseUid, email, name, photoURL },
  });
}'''

# Extract everything before syncUser
match = re.search(r'export async function syncUser.*?\}\n', content, re.DOTALL)
if match:
    content = content.replace(match.group(0), new_syncUser + '\n')

with open('src/lib/purchase-service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("syncUser updated")
