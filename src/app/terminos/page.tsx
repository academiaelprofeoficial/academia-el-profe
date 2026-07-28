import type { Metadata } from 'next';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Academia El Profe Oficial',
  description: 'Términos y condiciones de uso de la plataforma de cursos de Academia El Profe Oficial.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20 mt-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Términos y Condiciones
            </h1>
            <p className="text-muted-foreground text-lg">
              Última actualización: {new Date().toLocaleDateString('es-PE')}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-primary">
            <h2>1. Introducción</h2>
            <p>
              Bienvenido a Academia El Profe Oficial. Estos términos y condiciones ("Términos") rigen tu uso de nuestro sitio web y los servicios de aprendizaje en línea que ofrecemos. Al acceder o utilizar nuestra plataforma, aceptas estar sujeto a estos Términos en su totalidad.
            </p>

            <h2>2. Servicios Ofrecidos</h2>
            <p>
              Academia El Profe Oficial ofrece cursos digitales pregrabados, materiales de estudio en PDF y soporte académico relacionado con ciencias de la ingeniería. Todo el contenido es propiedad intelectual de la academia y sus profesores.
            </p>

            <h2>3. Cuentas de Usuario</h2>
            <p>
              Para acceder a los cursos adquiridos, debes registrarte y crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Nos reservamos el derecho de suspender o cancelar cuentas que compartan credenciales de acceso con terceros (piratería).
            </p>

            <h2>4. Propiedad Intelectual</h2>
            <p>
              Todo el contenido disponible en la plataforma (videos, textos, gráficos, logotipos, materiales descargables) es propiedad exclusiva de Academia El Profe Oficial y está protegido por las leyes de propiedad intelectual de la República del Perú. Queda estrictamente prohibida la reproducción, distribución, transmisión o venta no autorizada de cualquier contenido.
            </p>

            <h2>5. Pagos y Precios</h2>
            <p>
              Todos los precios están indicados en Soles Peruanos (PEN) y Dólares Estadounidenses (USD). Nos reservamos el derecho de modificar los precios en cualquier momento. Los pagos se procesan a través de pasarelas de pago seguras (MercadoPago, PayPal, Culqi).
            </p>

            <h2>6. Licencia de Uso</h2>
            <p>
              Al adquirir un curso, te otorgamos una licencia limitada, no exclusiva y no transferible para acceder y ver el contenido del curso únicamente para tu uso personal y educativo. Esta licencia no te otorga ningún derecho de propiedad sobre el contenido.
            </p>

            <h2>7. Modificaciones de los Términos</h2>
            <p>
              Nos reservamos el derecho de actualizar o modificar estos Términos en cualquier momento sin previo aviso. Tu uso continuo de la plataforma después de cualquier cambio constituye tu aceptación de los nuevos Términos.
            </p>

            <h2>8. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos Términos se rigen y se interpretan de acuerdo con las leyes de la República del Perú. Cualquier disputa que surja en relación con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de la ciudad de Lima.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
