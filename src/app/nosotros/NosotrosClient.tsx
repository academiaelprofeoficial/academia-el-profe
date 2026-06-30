'use client';

import { PortableText } from '@portabletext/react';
import { GraduationCap, Target, Users, ShieldCheck } from 'lucide-react';
import type { SanityPageContent, SanityTeamMember, PortableTextBlock, SanityImage } from '@/lib/sanity.client';
import { plainText, getImageUrl } from '@/lib/sanity.client';

interface NosotrosClientProps {
  pageContent: SanityPageContent | null;
  teamMembers: SanityTeamMember[] | null;
}

const PILARES = [
  {
    icono: Target,
    titulo: 'Enfoque UTP',
    descripcion: 'Cada curso está diseñado específicamente para los ciclos, sílabos y exigencias de la Universidad Tecnológica del Perú. No es contenido genérico: es contenido que responde exactamente a lo que te examinan.',
  },
  {
    icono: GraduationCap,
    titulo: 'Experiencia Docente',
    descripcion: 'El Prof. Kall Bruno Díaz cuenta con más de 10 años de experiencia enseñando matemáticas y física a nivel universitario. Su metodología clara y directa ha ayudado a miles de estudiantes a aprobar sus cursos.',
  },
  {
    icono: Users,
    titulo: 'Comunidad Activa',
    descripcion: 'Más de 5,000 estudiantes confían en Academia El Profe Oficial. Cada curso cuenta con un sistema de preguntas y respuestas donde puedes resolver tus dudas con compañeros y el profesor.',
  },
  {
    icono: ShieldCheck,
    titulo: 'Garantía de Calidad',
    descripcion: 'Si el curso no cumple tus expectativas, ofrecemos una garantía de devolución de 7 días. Además, todos los cursos incluyen acceso de por vida y actualizaciones gratuitas del contenido.',
  },
] as const;

const ptComponents = {
  block: ({ children, style }: { children: React.ReactNode; style?: string }) => {
    if (style === 'h2') return <h2 className="text-lg font-bold text-foreground mb-3">{children}</h2>;
    if (style === 'h3') return <h3 className="text-base font-bold text-foreground mb-2">{children}</h3>;
    if (style === 'normal' || !style) return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>;
    return <p>{children}</p>;
  },
};

export function NosotrosClient({ pageContent, teamMembers }: NosotrosClientProps) {
  const hasHero = pageContent?.heroTitle || pageContent?.heroImage;
  const hasBody = pageContent?.bodyContent && pageContent.bodyContent.length > 0;
  const hasTeam = teamMembers && teamMembers.length > 0;

  return (
    <section>
      {/* Hero CMS */}
      {hasHero && (
        <div className="mb-8" data-sanity-edit={`pageContent.${pageContent?._id}.heroTitle`}>
          {pageContent?.heroImage?.asset && (
            <div className="relative rounded-2xl overflow-hidden mb-6 h-48 md:h-64">
              <img
                src={getImageUrl(pageContent.heroImage as SanityImage, 1200, 400) || ''}
                alt={pageContent.heroTitle || ''}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {pageContent.heroTitle}
                </h1>
                {pageContent.heroSubtitle && (
                  <div className="text-white/80 mt-2 max-w-2xl">
                    <PortableText value={pageContent.heroSubtitle as PortableTextBlock[]} components={ptComponents} />
                  </div>
                )}
              </div>
            </div>
          )}
          {!pageContent?.heroImage?.asset && (
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-2">
                {pageContent?.heroTitle?.split(' ').map((word, i, arr) =>
                  i === arr.length - 1 ? <span key={i} className="text-emerald-500">{word}</span> : <span key={i}>{word} </span>
                )}
              </h1>
              {pageContent?.heroSubtitle && (
                <div className="text-muted-foreground text-sm lg:text-base max-w-2xl">
                  <PortableText value={pageContent.heroSubtitle as PortableTextBlock[]} components={ptComponents} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CMS Body Content */}
      {hasBody && (
        <div
          className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 mb-8 prose prose-sm dark:prose-invert max-w-none"
          data-sanity-edit={`pageContent.${pageContent?._id}.bodyContent`}
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
                        <img
                          src={getImageUrl(value, 800, 500) || ''}
                          alt={value.alt || ''}
                          className="w-full h-auto"
                        />
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

      {/* Fallback: Contenido estático si no hay datos CMS */}
      {!hasHero && !hasBody && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-2">
              Sobre <span className="text-emerald-500">Academia El Profe Oficial</span>
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">
              Nace con la misión de brindar refuerzo académico de calidad a estudiantes
              de ingeniería en Perú. Creemos que ningún estudiante debería reprobar
              por falta de recursos educativos adecuados.
            </p>
          </div>

          <div id="historia" className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 mb-8 scroll-mt-16">
            <h2 className="text-lg font-bold text-foreground mb-4">Nuestra Historia</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Academia El Profe Oficial fue fundada por el Prof. Kall Bruno Díaz,
                docente universitario con una pasión inquebrantable por la enseñanza
                de las ciencias básicas para ingeniería. Tras años de observar cómo
                cientos de estudiantes luchaban con cursos como Cálculo, Mecánica y
                Fluidos, decidió crear una plataforma que llevara sus clases de
                calidad directa al celular o computadora de cada estudiante.
              </p>
              <p>
                Lo que comenzó como grabaciones compartidas por WhatsApp se transformó
                en una plataforma educativa completa con video-lecciones estructuradas,
                material de apoyo en PDF, sistemas de evaluación y certificados que
                respaldan el esfuerzo de cada estudiante. Hoy, Academia El Profe
                Oficial es la opción preferida por miles de estudiantes de la UTP
                y otras universidades de ingeniería en todo el Perú.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Equipo desde CMS */}
      {hasTeam && (
        <div id="equipo" className="mb-8 scroll-mt-16">
          <h2 className="text-lg font-bold text-foreground mb-4">Nuestro Equipo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers!.map((member) => (
              <div
                key={member._id}
                className="rounded-2xl border border-border/40 bg-card p-5 text-center"
                data-sanity-edit={`teamMember.${member._id}.name`}
              >
                {member.photo?.asset ? (
                  <img
                    src={getImageUrl(member.photo, 200, 200) || ''}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
                {member.bio && (
                  <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-3">{plainText(member.bio)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pilares (siempre visibles) */}
      <div id="pilares" className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 scroll-mt-16">
        {PILARES.map((pilar) => {
          const Icono = pilar.icono;
          return (
            <div key={pilar.titulo} className="rounded-2xl border border-border/40 bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                  <Icono className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-foreground">{pilar.titulo}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{pilar.descripcion}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}