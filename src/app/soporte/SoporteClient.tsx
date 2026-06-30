'use client';

import { PortableText } from '@portabletext/react';
import {
  Headphones, MessageCircle, Mail, Clock, Phone, HelpCircle,
} from 'lucide-react';
import { SoporteForm } from '@/components/SoporteForm';
import type { SanityPageContent, PortableTextBlock, SanityImage } from '@/lib/sanity.client';
import { plainText, getImageUrl } from '@/lib/sanity.client';

interface SoporteClientProps {
  pageContent: SanityPageContent | null;
}

const CANALES_CONTACTO = [
  { icono: MessageCircle, titulo: 'Chat en Vivo', descripcion: 'Respuesta inmediata en horario de atención.', horario: 'Lun a Vie: 8:00 AM - 10:00 PM' },
  { icono: Mail, titulo: 'Correo Electrónico', descripcion: 'soporte@academiaelprofe.com', horario: 'Respuesta en menos de 24 horas' },
  { icono: Phone, titulo: 'WhatsApp', descripcion: '+51 987 654 321', horario: 'Lun a Sáb: 9:00 AM - 8:00 PM' },
] as const;

const FAQ_DEFAULT = [
  { pregunta: '¿Cómo accedo a un curso comprado?', respuesta: 'Ingresa a "Mis Cursos" desde el menú principal. Allí verás todos los cursos que has adquirido con acceso completo.' },
  { pregunta: '¿Puedo ver las clases en mi celular?', respuesta: 'Sí. Puedes descargar nuestra app móvil o acceder desde el navegador de tu teléfono. Las clases son 100% compatibles con dispositivos móviles.' },
  { pregunta: '¿Los certificados tienen validez oficial?', respuesta: 'Los certificados de Academia El Profe Oficial respaldan la completion exitosa del curso. Son reconocidos por el cuerpo docente y avalados por el Prof. Kall Bruno Díaz.' },
  { pregunta: '¿Qué métodos de pago aceptan?', respuesta: 'Aceptamos Mercado Pago (soles peruanos), PayPal (dólares para pagos internacionales), y transferencia bancaria. Todos los pagos son seguros y están protegidos.' },
];

const ptComponents = {
  block: ({ children, style }: { children: React.ReactNode; style?: string }) => {
    if (style === 'h2') return <h2 className="text-lg font-bold text-foreground mb-3">{children}</h2>;
    if (style === 'h3') return <h3 className="text-base font-bold text-foreground mb-2">{children}</h3>;
    if (style === 'normal' || !style) return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>;
    return <p>{children}</p>;
  },
};

export function SoporteClient({ pageContent }: SoporteClientProps) {
  const hasHero = pageContent?.heroTitle;
  const hasBody = pageContent?.bodyContent && pageContent.bodyContent.length > 0;

  return (
    <section>
      {/* Título / Hero CMS */}
      <div className="mb-8" data-sanity-edit={pageContent ? `pageContent.${pageContent._id}.heroTitle` : undefined}>
        <div className="flex items-center gap-2 mb-2">
          <Headphones className="h-5 w-5 text-emerald-500" />
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            {pageContent?.heroTitle || 'Soporte y Ayuda'}
          </h1>
        </div>
        {pageContent?.heroSubtitle ? (
          <div className="text-muted-foreground text-sm lg:text-base">
            <PortableText value={pageContent.heroSubtitle as PortableTextBlock[]} components={ptComponents} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm lg:text-base">
            Estamos aquí para ayudarte. Elige un canal de contacto o envíanos
            un mensaje directamente desde aquí.
          </p>
        )}
      </div>

      {/* CMS Body Content */}
      {hasBody && (
        <div
          className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 mb-8 prose prose-sm dark:prose-invert max-w-none"
          data-sanity-edit={`pageContent.${pageContent!._id}.bodyContent`}
        >
          <PortableText
            value={pageContent!.bodyContent as any}
            components={{
              ...ptComponents,
              types: {
                image: ({ value }: any) => {
                  if (value?.asset?._ref || value?.asset?._id) {
                    return (
                      <div className="my-4 rounded-xl overflow-hidden">
                        <img src={getImageUrl(value, 800, 500) || ''} alt={value.alt || ''} className="w-full h-auto" />
                      </div>
                    );
                  }
                  return null;
                },
              },
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Canales de contacto */}
        <div id="canales-contacto" className="space-y-4 scroll-mt-16">
          <h2 className="text-lg font-bold text-foreground">Canales de Atención</h2>
          {CANALES_CONTACTO.map((canal) => {
            const Icono = canal.icono;
            return (
              <div key={canal.titulo} className="rounded-2xl border border-border/40 bg-card p-5 flex gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 shrink-0">
                  <Icono className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{canal.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{canal.descripcion}</p>
                  <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {canal.horario}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulario de contacto */}
        <div id="formulario-contacto" className="space-y-4 scroll-mt-16">
          <h2 className="text-lg font-bold text-foreground">Envíanos un Mensaje</h2>
          <SoporteForm />
        </div>
      </div>

      {/* Preguntas frecuentes */}
      <div id="preguntas-frecuentes" className="mt-10 scroll-mt-16">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          Preguntas Frecuentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_DEFAULT.map((faq) => (
            <div key={faq.pregunta} className="rounded-xl border border-border/40 bg-muted/20 p-4">
              <h3 className="text-sm font-bold text-foreground mb-1">{faq.pregunta}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.respuesta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}