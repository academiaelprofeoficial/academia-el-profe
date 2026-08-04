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
            <h2>Introducción</h2>
            <ul>
              <li>Esta política establece las condiciones para cambios y devoluciones de productos.</li>
              <li>Aplica a los productos y servicios adquiridos a través de nuestra tienda online.</li>
            </ul>

            <h2>Condiciones para cambios y devoluciones</h2>
            <ul>
              <li>Plazo para solicitar un cambio o devolución: [ej. 7, 15, 30 días] después de la compra.</li>
              <li>El producto debe estar sin uso, en su empaque original, con etiquetas y sin daños.</li>
              <li>No son elegibles para cambios o devoluciones: productos personalizados, ropa interior, alimentos, entre otros.</li>
            </ul>

            <h2>Proceso para solicitar un cambio o devolución</h2>
            <ul>
              <li>Contactar al servicio de atención al cliente a través de [email/teléfono].</li>
              <li>Completar el formulario de solicitud de devolución/cambio.</li>
              <li>Enviar el producto con la documentación requerida: número de pedido, fotos del producto, comprobante de compra.</li>
            </ul>

            <h2>Opciones de reembolso y cambios</h2>
            <ul>
              <li>Modalidades de reembolso: devolución de dinero, saldo a favor, tarjeta de regalo.</li>
              <li>Tiempo estimado para procesar el reembolso: [ej. 5-10 días hábiles].</li>
              <li>Opciones de cambio: reemplazo por el mismo producto, otro artículo de igual valor, reembolso parcial.</li>
            </ul>

            <h2>Costos y responsabilidad del envío</h2>
            <ul>
              <li>Los costos de envío en cambios o devoluciones son responsabilidad del cliente, salvo error de la tienda.</li>
              <li>En caso de productos defectuosos o errores en el pedido, el envío será gratuito para el cliente.</li>
            </ul>

            <h2>Excepciones y garantías</h2>
            <ul>
              <li>En casos de productos dañados, defectuosos o errores en el pedido, se aplicará una política especial.</li>
              <li>Algunos productos pueden contar con garantías del fabricante, las cuales deben ser gestionadas directamente con el proveedor.</li>
            </ul>

            <h2>Contacto y Atención al cliente</h2>
            <p>
              Incluir número de contacto y horario de atención, en caso de consulta o reclamo.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
