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
            <h2>1. Naturaleza de los Productos</h2>
            <p>
              Academia El Profe Oficial ofrece productos digitales intangibles (cursos en video pregrabados y materiales de estudio descargables). Debido a la naturaleza inmediata del acceso al contenido digital tras la compra, nuestra política de devoluciones se rige bajo condiciones estrictas para prevenir el fraude y abuso.
            </p>

            <h2>2. Condiciones para Reembolsos</h2>
            <p>
              Solo se emitirán reembolsos bajo las siguientes circunstancias excepcionales:
            </p>
            <ul>
              <li><strong>Cobros Duplicados:</strong> Si por un error del sistema o de la pasarela de pagos se procesó el cobro más de una vez por el mismo curso.</li>
              <li><strong>Problemas Técnicos Graves:</strong> Si el contenido del curso es inaccesible debido a problemas técnicos persistentes en nuestra plataforma que no puedan ser resueltos por nuestro equipo de soporte en un plazo de 72 horas hábiles.</li>
            </ul>

            <h2>3. Exclusiones de Reembolso</h2>
            <p>
              <strong>NO</strong> se procesarán reembolsos en los siguientes casos:
            </p>
            <ul>
              <li>Cambio de opinión después de haber accedido o descargado el material del curso.</li>
              <li>No contar con el tiempo suficiente para realizar el curso.</li>
              <li>Falta de conocimientos previos requeridos explícitamente en la descripción del curso.</li>
              <li>Violación de nuestros Términos y Condiciones (ej. compartir la cuenta con terceros).</li>
            </ul>

            <h2>4. Proceso de Solicitud</h2>
            <p>
              Para solicitar una evaluación de reembolso bajo las condiciones aprobadas, el usuario debe comunicarse a través de nuestros canales oficiales de soporte (correo electrónico) en un plazo máximo de <strong>7 días calendario</strong> desde la fecha de compra. La solicitud debe incluir:
            </p>
            <ul>
              <li>Nombre completo y correo electrónico de la cuenta.</li>
              <li>Comprobante de pago o número de transacción.</li>
              <li>Motivo detallado de la solicitud (incluyendo capturas de pantalla si se trata de un problema técnico).</li>
            </ul>

            <h2>5. Resolución y Tiempos</h2>
            <p>
              Nuestro equipo evaluará su caso y emitirá una respuesta en un plazo de hasta 7 días hábiles. De ser aprobado, el reembolso se procesará al mismo método de pago original en un plazo que dependerá de los tiempos bancarios y de la pasarela de pagos (habitualmente de 5 a 15 días hábiles).
            </p>

            <h2>6. Cambios de Curso</h2>
            <p>
              No se permiten cambios de un curso por otro una vez que el usuario ha ingresado al curso adquirido y consumido parte del material.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
