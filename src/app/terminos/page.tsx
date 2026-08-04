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
            <h2>Información general del comercio</h2>
            <ul>
              <li><strong>Razón Social:</strong> Academia El Profe Oficial</li>
              <li><strong>RUC:</strong> 10766497026</li>
              <li><strong>Dirección:</strong> Santa Rosa -Lima Perú</li>
              <li><strong>Teléfono:</strong> 922737951</li>
              <li><strong>Correo Electrónico:</strong> academiaelprofeoficial@gmail.com</li>
            </ul>

            <h2>Aceptación de Términos y Condiciones</h2>
            <p>
              El uso de esta plataforma implica la aceptación de los presentes Términos y Condiciones. Indica que tu comercio se reserva el derecho de actualizar estos términos en cualquier momento, notificando a los usuarios a través de los medios correspondientes.
            </p>

            <h2>Registro y Cuenta de usuario</h2>
            <ul>
              <li>Para realizar compras, el usuario debe registrarse proporcionando datos verídicos.</li>
              <li>Requisitos para el registro o uso de la web (ejm: ser mayor de edad).</li>
              <li>Es responsabilidad del usuario mantener la confidencialidad de su cuenta.</li>
              <li>Cualquier uso indebido de la cuenta será responsabilidad del usuario titular.</li>
            </ul>

            <h2>Productos y servicios</h2>
            <ul>
              <li>Describe de forma clara los productos y servicios ofrecidos.</li>
              <li>La disponibilidad de stock puede estar sujeta a cambios sin previo aviso.</li>
              <li>Se pueden aplicar restricciones de venta según las políticas del comercio (ejm: cantidades mínimas o máximas).</li>
              <li>En caso de periodo de prueba, detalla los plazos, la renovación automática (en caso aplique), las notificaciones al cliente, etc.</li>
            </ul>

            <h2>Precios y formas de pago</h2>
            <ul>
              <li>Los precios deben ser presentados en moneda local o extranjera.</li>
              <li>Incluye métodos de pago aceptados: tarjetas, transferencias, billeteras digitales, etc.</li>
              <li>Los precios incluyen o excluyen impuestos según corresponda.</li>
              <li>Seguridad de la plataforma de pagos y responsabilidad del cliente.</li>
            </ul>

            <h2>Proceso de compra</h2>
            <ul>
              <li>Detalla los pasos para realizar una compra en la plataforma.</li>
              <li>Incluye la confirmación y validación del pedido y posibles motivos de cancelación por parte de tu comercio.</li>
            </ul>

            <h2>Envíos y entrega</h2>
            <ul>
              <li>Incluye la cobertura de envíos y tiempos estimados de entrega.</li>
              <li>Detalla los costos de envío y condiciones aplicables, además de la política sobre retrasos y problemas en la entrega.</li>
            </ul>

            <h2>Protección de datos personales</h2>
            <ul>
              <li>Cumplimiento con la Ley N° 29733 de Protección de Datos Personales en Perú.</li>
              <li>Detalla el uso y finalidad de los datos recolectados.</li>
              <li>Incluye los derechos del usuario sobre su información y cómo ejercerlos.</li>
            </ul>

            <h2>Propiedad intelectual</h2>
            <ul>
              <li>Todo el contenido del sitio (logos, imágenes, textos) está protegido por derechos de autor.</li>
              <li>Incluye las restricciones en el uso de la información publicada en la plataforma.</li>
            </ul>

            <h2>Responsabilidad y limitaciones</h2>
            <ul>
              <li>El comercio no se hace responsable por fallos técnicos de la web.</li>
              <li>Uso adecuado de los productos o servicios adquiridos.</li>
              <li>Límites de responsabilidad en caso de inconvenientes ajenos al comercio.</li>
            </ul>

            <h2>Legislación aplicable y resolución de conflictos</h2>
            <ul>
              <li>Este documento se rige por la legislación peruana.</li>
              <li>Los conflictos serán resueltos mediante conciliación, Indecopi o instancias judiciales correspondientes.</li>
            </ul>

            <h2>Contacto y soporte</h2>
            <p>
              Para consultas o reclamos, puedes contactarnos al 922737951 o al correo academiaelprofeoficial@gmail.com en nuestro horario de atención: de lunes a viernes de 9:00 am a 6:00 pm.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
