'use client';

import { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';
import * as LucideIcons from 'lucide-react';
import { GraduationCap, Target, Users, ShieldCheck, Loader2 } from 'lucide-react';
import type { SanityPageContent, SanityTeamMember, PortableTextBlock, SanityImage } from '@/lib/sanity.client';
import { plainText, getImageUrl } from '@/lib/sanity.client';

interface NosotrosClientProps {
  pageContent: SanityPageContent | null;
  teamMembers: SanityTeamMember[] | null;
}

interface CaracteristicaDinamica {
  icono: string;
  titulo: string;
  descripcion: string;
}

interface ContenidoDinamico {
  titulo_principal: string;
  subtitulo_principal: string;
  texto_historia: string;
  prof_nombre: string;
  prof_titulo: string;
  prof_descripcion: string;
  prof_foto_url: string;
  caracteristicas: CaracteristicaDinamica[];
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

const MAPA_ICONOS: Record<string, React.ComponentType<any>> = {
  'graduation-cap': GraduationCap,
  'target': Target,
  'users': Users,
  'shield-check': ShieldCheck,
  'award': LucideIcons.Award,
  'book-open': LucideIcons.BookOpen,
  'check-circle': LucideIcons.CheckCircle,
  'star': LucideIcons.Star,
  'heart': LucideIcons.Heart,
  'trending-up': LucideIcons.TrendingUp,
  'zap': LucideIcons.Zap,
  'globe': LucideIcons.Globe,
  'lightbulb': LucideIcons.Lightbulb,
  'message-square': LucideIcons.MessageSquare,
  'play-circle': LucideIcons.PlayCircle,
};

function resolveIcon(nombre: string): React.ComponentType<any> {
  const icono = MAPA_ICONOS[nombre.toLowerCase().replace(/\s+/g, '-')];
  if (icono) return icono;
  // Intentar desde lucide-react directamente
  const key = nombre.charAt(0).toUpperCase() + nombre.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return (LucideIcons as any)[key] || GraduationCap;
}

const ptComponents = {
  block: ({ children, style }: { children: React.ReactNode; style?: string }) => {
    if (style === 'h2') return <h2 className="text-lg font-bold text-foreground mb-3">{children}</h2>;
    if (style === 'h3') return <h3 className="text-base font-bold text-foreground mb-2">{children}</h3>;
    if (style === 'normal' || !style) return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>;
    return <p>{children}</p>;
  },
};

export function NosotrosClient({ pageContent, teamMembers }: NosotrosClientProps) {
  const [dinamico, setDinamico] = useState<ContenidoDinamico | null>(null);
  const [cargandoDinamico, setCargandoDinamico] = useState(true);

  // Cargar contenido dinámico desde Supabase
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/nosotros')
      .then(r => r.json())
      .then(json => {
        if (!cancelled && json.data) {
          setDinamico({
            titulo_principal: json.data.titulo_principal || '',
            subtitulo_principal: json.data.subtitulo_principal || '',
            texto_historia: json.data.texto_historia || '',
            prof_nombre: json.data.prof_nombre || '',
            prof_titulo: json.data.prof_titulo || '',
            prof_descripcion: json.data.prof_descripcion || '',
            prof_foto_url: json.data.prof_foto_url || '',
            caracteristicas: Array.isArray(json.data.caracteristicas) ? json.data.caracteristicas : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCargandoDinamico(false); });
    return () => { cancelled = true; };
  }, []);

  const hasHero = pageContent?.heroTitle || pageContent?.heroImage;
  const hasBody = pageContent?.bodyContent && pageContent.bodyContent.length > 0;
  const hasTeam = teamMembers && teamMembers.length > 0;
  const hasDinamico = dinamico && (dinamico.titulo_principal || dinamico.texto_historia);
  const caracteristicas = (hasDinamico && dinamico!.caracteristicas.length >= 4)
    ? dinamico!.caracteristicas
    : null;

  return (
    <section>
      {/* Hero CMS (Sanity) */}
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

      {/* CMS Body Content (Sanity) */}
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

      {/* Fallback: Contenido desde DB o estático */}
      {!hasHero && !hasBody && (
        <>
          {cargandoDinamico ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : hasDinamico ? (
            <>
              {/* Hero desde DB */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-2">
                  {dinamico!.titulo_principal.split(' ').map((word, i, arr) =>
                    i === arr.length - 1 ? <span key={i} className="text-emerald-500">{word}</span> : <span key={i}>{word} </span>
                  )}
                </h1>
                {dinamico!.subtitulo_principal && (
                  <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">
                    {dinamico!.subtitulo_principal}
                  </p>
                )}
              </div>

              {/* Historia desde DB */}
              <div id="historia" className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 mb-8 scroll-mt-16">
                <h2 className="text-lg font-bold text-foreground mb-4">Nuestra Historia</h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {dinamico!.texto_historia}
                </div>
              </div>
            </>
          ) : (
            /* Contenido estático original (fallback final) */
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
        </>
      )}

      {/* Profesor Fundador (solo cuando hay datos dinámicos) */}
      {hasDinamico && dinamico!.prof_nombre && (
        <div id="equipo" className="mb-8 scroll-mt-16">
          <h2 className="text-lg font-bold text-foreground mb-4">Nuestro Equipo</h2>
          <div className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 text-center max-w-md mx-auto">
            {dinamico!.prof_foto_url ? (
              <img
                src={dinamico!.prof_foto_url}
                alt={dinamico!.prof_nombre}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-2 ring-emerald-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl font-bold">
                {dinamico!.prof_nombre.charAt(0)}
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground mb-1">{dinamico!.prof_nombre}</h3>
            {dinamico!.prof_titulo && (
              <p className="text-emerald-500 text-sm font-medium mb-3">{dinamico!.prof_titulo}</p>
            )}
            {dinamico!.prof_descripcion && (
              <p className="text-sm text-muted-foreground leading-relaxed">{dinamico!.prof_descripcion}</p>
            )}
          </div>
        </div>
      )}

      {/* Equipo desde CMS (Sanity) */}
      {hasTeam && !hasDinamico && (
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

      {/* Pilares / Características */}
      <div id="pilares" className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 scroll-mt-16">
        {caracteristicas
          ? /* Características desde DB */
            caracteristicas.map((caracteristica) => {
              const Icono = resolveIcon(caracteristica.icono);
              return (
                <div key={caracteristica.titulo} className="rounded-2xl border border-border/40 bg-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                      <Icono className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-foreground">{caracteristica.titulo}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{caracteristica.descripcion}</p>
                </div>
              );
            })
          : /* Pilares estáticos (fallback) */
            PILARES.map((pilar) => {
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
