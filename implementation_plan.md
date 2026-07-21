# Solución de Bugs: Pasarela de Pagos y Acceso Admin

Tras analizar los problemas reportados, he encontrado que ambos están conectados por un fallo crítico en la lógica de sincronización de usuarios (syncUser) y restricciones de la base de datos (Prisma).

## Análisis de los Problemas

1. **Bug de la Pasarela de Pagos (MercadoPago/PayPal)**:
   - Cuando un usuario inicia el pago, el backend intenta sincronizarlo usando syncUser(userId, '', '') (enviando un email vacío).
   - Como la base de datos exige que el campo email sea **único**, si más de un usuario intenta comprar sin enviar su email, la base de datos arroja un error de restricción (Unique Constraint Violation).
   - Esto hace que no se registre la "compra pendiente" en el sistema. Cuando MercadoPago aprueba el pago, el Webhook no encuentra a quién asignarle el curso, y termina creando un usuario temporal (ej. mp_juan@gmail.com). El usuario real, a pesar de haber pagado, entra a su cuenta y no ve el curso.

2. **Bug de Acceso desde el Panel Super Admin**:
   - El panel intenta buscar al usuario por su email en la base de datos (Prisma). Si el usuario nunca ha iniciado sesión o no ha sido sincronizado, no existe. El sistema simplemente arroja "Usuario no encontrado" y no otorga el acceso.

3. **Bug oculto gravísimo (Bloqueo de cuentas)**:
   - Si el webhook de MercadoPago crea el usuario temporal mp_juan@gmail.com, cuando Juan intente iniciar sesión con Google más tarde, el sistema intentará crear su usuario real (con su ID de Firebase). Como el email juan@gmail.com ya está tomado por la cuenta temporal, el sistema fallará y Juan quedará bloqueado de la plataforma.

## Cambios Propuestos

### 1. Mejorar la sincronización de usuarios (syncUser) - [CRÍTICO]
Modificaremos la función syncUser en src/lib/purchase-service.ts para que sea capaz de detectar si existe una cuenta temporal (creada por un pago de invitado o por el admin). Si existe, **migrará automáticamente** todas las compras, accesos y progreso al ID real de Firebase del usuario y eliminará la cuenta temporal.

### 2. Permitir creación de cuentas desde el Panel Admin
En src/app/api/admin/grant-access/route.ts, si el usuario no existe, crearemos una cuenta temporal (ej. manual_correo@gmail.com). Gracias a la mejora del paso 1, cuando el alumno inicie sesión por primera vez con Google, heredará automáticamente los accesos que le diste como Admin.

### 3. Arreglar el Checkout API
En src/components/course/PurchaseOverlay.tsx (y similares) enviaremos el email real del usuario al backend. En src/app/api/checkout/route.ts, usaremos este email real en lugar de '' para evitar la colisión en la base de datos y garantizar que la compra pendiente se registre al usuario correcto.

## Plan de Verificación
- Simularemos el flujo de Checkout para garantizar que no hay errores de Base de Datos.
- Verificaremos el panel Admin otorgando acceso a un correo nuevo que no existe en el sistema.
- Revisaremos que el código compile localmente sin errores de TypeScript.
