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
            <h2>1. Información General</h2>
            <p>
              Bienvenido a Academia El Profe Oficial, plataforma dedicada a la comercialización de cursos virtuales, clases grabadas y material educativo digital.
            </p>
            <ul>
              <li><strong>Razón Social:</strong> Academia El Profe Oficial</li>
              <li><strong>Dirección:</strong> Santa Rosa, Lima, Perú.</li>
              <li><strong>Teléfono:</strong> +51 922 737 951</li>
              <li><strong>Correo electrónico:</strong> academiaelprofeoficial@gmail.com</li>
            </ul>

            <hr />

            <h2>2. Aceptación de los Términos y Condiciones</h2>
            <p>
              El acceso y uso de este sitio web implica que el usuario ha leído, comprendido y aceptado los presentes Términos y Condiciones.
            </p>
            <p>
              Academia El Profe Oficial podrá modificar este documento en cualquier momento para adecuarlo a cambios legales o mejoras del servicio. Las modificaciones serán publicadas en esta misma página y entrarán en vigencia desde su publicación.
            </p>

            <hr />

            <h2>3. Registro y Cuenta de Usuario</h2>
            <p>
              Para adquirir un curso es necesario iniciar sesión mediante una cuenta de Google (Gmail) o crear una cuenta en la plataforma cuando esta opción se encuentre disponible.
            </p>
            <p>
              El usuario declara que la información proporcionada es verdadera y actualizada.
            </p>
            <p>
              El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas desde su cuenta.
            </p>
            <p>
              El uso no autorizado de una cuenta será responsabilidad del titular de la misma.
            </p>
            <p>
              Los servicios están dirigidos a personas mayores de edad o menores que cuenten con autorización de sus padres o representantes legales.
            </p>

            <hr />

            <h2>4. Productos y Servicios</h2>
            <p>
              Academia El Profe Oficial ofrece:
            </p>
            <ul>
              <li>Cursos virtuales grabados.</li>
              <li>Material de apoyo en formato PDF.</li>
              <li>Clases particulares.</li>
              <li>Asesorías académicas.</li>
              <li>Material complementario relacionado con los cursos ofrecidos.</li>
            </ul>
            <p>
              Todos los cursos son digitales y el acceso será habilitado una vez confirmado el pago.
            </p>
            <p>
              La disponibilidad de cursos podrá modificarse sin previo aviso.
            </p>

            <hr />

            <h2>5. Precios y Formas de Pago</h2>
            <p>
              Todos los precios publicados se encuentran expresados en Soles (PEN).
            </p>
            <p>
              Los pagos podrán realizarse mediante los métodos habilitados en la plataforma, tales como:
            </p>
            <ul>
              <li>Tarjetas de crédito y débito.</li>
              <li>Culqi.</li>
              <li>Transferencias bancarias (cuando corresponda).</li>
            </ul>
            <p>
              Los precios incluyen los impuestos aplicables conforme a la legislación peruana.
            </p>
            <p>
              Toda transacción es procesada mediante plataformas de pago seguras que utilizan mecanismos de protección para resguardar la información financiera del cliente.
            </p>

            <hr />

            <h2>6. Proceso de Compra</h2>
            <p>
              El proceso de compra comprende las siguientes etapas:
            </p>
            <ol>
              <li>Seleccionar el curso deseado.</li>
              <li>Iniciar sesión en la plataforma.</li>
              <li>Agregar el curso al carrito de compras.</li>
              <li>Confirmar el pedido.</li>
              <li>Realizar el pago mediante uno de los medios disponibles.</li>
              <li>Una vez confirmado el pago, se habilitará el acceso al curso adquirido.</li>
            </ol>
            <p>
              Academia El Profe Oficial podrá cancelar una compra cuando existan indicios de fraude, errores en el procesamiento del pago o cualquier situación que comprometa la seguridad de la transacción.
            </p>

            <hr />

            <h2>7. Acceso a los Cursos</h2>
            <p>
              Una vez confirmado el pago, el usuario recibirá acceso al contenido digital adquirido.
            </p>
            <p>
              El acceso es personal e intransferible.
            </p>
            <p>
              Está prohibido compartir, vender, copiar, distribuir, grabar o reproducir el contenido de los cursos sin autorización expresa de Academia El Profe Oficial.
            </p>

            <hr />

            <h2>8. Entrega del Servicio</h2>
            <p>
              Al tratarse de productos digitales, la entrega consiste en la habilitación del acceso al curso dentro de la plataforma.
            </p>
            <p>
              En caso de presentarse inconvenientes técnicos que impidan el acceso, el usuario podrá comunicarse con nuestro equipo de soporte para recibir asistencia.
            </p>

            <hr />

            <h2>9. Protección de Datos Personales</h2>
            <p>
              Academia El Profe Oficial trata los datos personales de sus usuarios conforme a la Ley N.° 29733 – Ley de Protección de Datos Personales del Perú.
            </p>
            <p>
              Los datos recopilados serán utilizados únicamente para:
            </p>
            <ul>
              <li>Gestionar las compras.</li>
              <li>Brindar acceso a los cursos.</li>
              <li>Emitir comprobantes de pago cuando corresponda.</li>
              <li>Atender consultas y solicitudes.</li>
              <li>Mejorar nuestros servicios.</li>
            </ul>
            <p>
              El usuario podrá ejercer sus derechos de acceso, rectificación, cancelación u oposición comunicándose mediante nuestros canales oficiales.
            </p>

            <hr />

            <h2>10. Propiedad Intelectual</h2>
            <p>
              Todo el contenido disponible en la plataforma, incluyendo:
            </p>
            <ul>
              <li>Videos.</li>
              <li>Material PDF.</li>
              <li>Logotipos.</li>
              <li>Diseño.</li>
              <li>Imágenes.</li>
              <li>Textos.</li>
              <li>Marca Academia El Profe Oficial.</li>
            </ul>
            <p>
              se encuentra protegido por la legislación sobre propiedad intelectual.
            </p>
            <p>
              Queda prohibida su reproducción, distribución, comercialización o utilización sin autorización expresa del titular.
            </p>

            <hr />

            <h2>11. Responsabilidad</h2>
            <p>
              Academia El Profe Oficial no será responsable por:
            </p>
            <ul>
              <li>Problemas derivados de la conexión a Internet del usuario.</li>
              <li>Fallas ocasionadas por equipos o dispositivos del usuario.</li>
              <li>Interrupciones temporales ocasionadas por mantenimiento o causas de fuerza mayor.</li>
            </ul>
            <p>
              La responsabilidad de Academia El Profe Oficial se limita a brindar el acceso al contenido adquirido conforme a las condiciones ofrecidas.
            </p>

            <hr />

            <h2>12. Modificaciones</h2>
            <p>
              Academia El Profe Oficial podrá actualizar estos Términos y Condiciones cuando resulte necesario.
            </p>
            <p>
              Las modificaciones serán publicadas en esta página y entrarán en vigencia desde su publicación.
            </p>

            <hr />

            <h2>13. Legislación Aplicable y Solución de Controversias</h2>
            <p>
              Los presentes Términos y Condiciones se rigen por la legislación de la República del Perú.
            </p>
            <p>
              Cualquier controversia será resuelta conforme a la normativa peruana, pudiendo las partes acudir a mecanismos de conciliación, INDECOPI o a los órganos jurisdiccionales competentes.
            </p>

            <hr />

            <h2>14. Contacto y Soporte</h2>
            <p>
              Para cualquier consulta relacionada con estos Términos y Condiciones puede comunicarse con nosotros mediante:
            </p>
            <ul>
              <li><strong>WhatsApp:</strong> +51 922 737 951</li>
              <li><strong>Correo electrónico:</strong> academiaelprofeoficial@gmail.com</li>
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
