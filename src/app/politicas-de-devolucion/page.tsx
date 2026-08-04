import type { Metadata } from 'next';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Políticas de Devolución | Academia El Profe Oficial',
  description: 'Políticas de cambios y devoluciones para los cursos de Academia El Profe Oficial.',
};

export default function PoliticasDevolucionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20 mt-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Políticas de Cambios y Devoluciones
            </h1>
            <p className="text-muted-foreground text-lg">
              Última actualización: {new Date().toLocaleDateString('es-PE')}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-primary">
            <h2>1. Introducción</h2>
            <p>
              En Academia El Profe Oficial nos comprometemos a brindar un servicio de calidad a nuestros estudiantes. La presente Política de Cambios y Devoluciones establece las condiciones aplicables a la compra de nuestros cursos virtuales, clases grabadas y material educativo digital ofrecidos a través de nuestra plataforma.
            </p>
            <p>
              Al realizar una compra en nuestra página web, el cliente declara haber leído y aceptado esta política.
            </p>

            <hr />

            <h2>2. Alcance</h2>
            <p>
              Esta política aplica a todos los cursos virtuales, clases grabadas, material en PDF y demás contenidos digitales adquiridos mediante la plataforma de Academia El Profe Oficial.
            </p>

            <hr />

            <h2>3. Condiciones para cambios y devoluciones</h2>
            <p>
              Debido a que los productos comercializados corresponden a contenido digital de acceso inmediato, una vez confirmado el pago y habilitado el acceso al curso, no se aceptan cambios ni devoluciones, salvo en los siguientes casos:
            </p>
            <ul>
              <li>Cobro duplicado.</li>
              <li>Error comprobable en el procesamiento del pago.</li>
              <li>Imposibilidad técnica atribuible a Academia El Profe que impida el acceso al curso y no pueda ser solucionada en un plazo razonable.</li>
              <li>Entrega de un curso distinto al adquirido.</li>
            </ul>
            <p>
              Las solicitudes deberán presentarse dentro de los 7 días calendario posteriores a la compra.
            </p>

            <hr />

            <h2>4. Procedimiento para solicitar un cambio o devolución</h2>
            <p>
              El cliente deberá comunicarse con nuestro equipo de atención proporcionando:
            </p>
            <ul>
              <li>Nombre completo.</li>
              <li>Correo electrónico registrado.</li>
              <li>Número de pedido o comprobante de pago.</li>
              <li>Descripción detallada del inconveniente.</li>
              <li>Capturas de pantalla u otra evidencia, de ser necesaria.</li>
            </ul>
            <p>
              La solicitud podrá enviarse mediante:
            </p>
            <ul>
              <li><strong>Correo electrónico:</strong> contacto@academiaelprofeoficial.com</li>
              <li><strong>WhatsApp:</strong> +51 922 737 951</li>
            </ul>

            <hr />

            <h2>5. Evaluación de la solicitud</h2>
            <p>
              Cada solicitud será evaluada de manera individual.
            </p>
            <p>
              En caso corresponda una devolución, el reembolso se realizará utilizando el mismo medio de pago empleado por el cliente, dentro de un plazo aproximado de 5 a 10 días hábiles, dependiendo de la entidad financiera.
            </p>
            <p>
              Cuando corresponda un cambio, Academia El Profe podrá:
            </p>
            <ul>
              <li>Restablecer el acceso al curso.</li>
              <li>Otorgar acceso al curso correcto adquirido.</li>
              <li>Reembolsar el importe pagado cuando sea procedente.</li>
            </ul>

            <hr />

            <h2>6. Excepciones</h2>
            <p>
              No procederán cambios ni devoluciones cuando:
            </p>
            <ul>
              <li>El estudiante haya accedido al contenido digital y este funcione correctamente.</li>
              <li>La compra haya sido realizada por error del cliente respecto al curso seleccionado.</li>
              <li>El cliente manifieste simplemente un cambio de opinión luego de recibir acceso al contenido.</li>
            </ul>

            <hr />

            <h2>7. Garantías</h2>
            <p>
              Academia El Profe garantiza que los cursos estarán disponibles para su acceso conforme a las condiciones ofrecidas en la plataforma.
            </p>
            <p>
              Si existiera un inconveniente técnico atribuible a la plataforma, realizaremos las acciones necesarias para restablecer el servicio en el menor tiempo posible.
            </p>

            <hr />

            <h2>8. Atención al Cliente</h2>
            <p>
              Para cualquier consulta relacionada con esta política puede comunicarse mediante:
            </p>
            <ul>
              <li><strong>WhatsApp:</strong> +51 922 737 951</li>
              <li><strong>Correo electrónico:</strong> contacto@academiaelprofeoficial.com</li>
            </ul>
            <p>
              <strong>Horario de atención:</strong><br />
              Lunes a sábado de 9:00 a.m. a 8:00 p.m.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
