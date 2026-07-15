'use client';

import { PortableText } from '@portabletext/react';
import * as LucideIcons from 'lucide-react';
import { GraduationCap, Target, Users, ShieldCheck } from 'lucide-react';
import type { SanityPageContent, SanityTeamMember, PortableTextBlock, SanityImage } from '@/lib/sanity.client';
import { plainText, getImageUrl } from '@/lib/sanity.client';

interface NosotrosClientProps {
  pageContent: SanityPageContent | null;
  teamMembers: SanityTeamMember[] | null;
}

const PILARES_FALLBACK = [
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
  'graduation-cap': GraduationCap, 'target': Target, 'users': Users,
  'shield-check': ShieldCheck, 'award': LucideIcons.Award, 'book-open': LucideIcons.BookOpen,
  'check-circle': LucideIcons.CheckCircle, 'star': LucideIcons.Star, 'heart': LucideIcons.Heart,
  'trending-up': LucideIcons.TrendingUp, 'zap': LucideIcons.Zap, 'globe': LucideIcons.Globe,
  'lightbulb': LucideIcons.Lightbulb, 'message-square': LucideIcons.MessageSquare,
  'play-circle': LucideIcons.PlayCircle, 'monitor-play': LucideIcons.MonitorPlay,
  'badge-check': LucideIcons.BadgeCheck, 'file-text': LucideIcons.FileText, 'video': LucideIcons.Video,
  'clock': LucideIcons.Clock, 'folder-open': LucideIcons.FolderOpen, 'shopping-cart': LucideIcons.ShoppingCart,
  'phone': LucideIcons.Phone, 'mail': LucideIcons.Mail, 'map-pin': LucideIcons.MapPin,
  'cake': LucideIcons.Cake, 'medal': LucideIcons.Medal, 'crown': LucideIcons.Crown,
  'rocket': LucideIcons.Rocket, 'sparkles': LucideIcons.Sparkles,
};

function resolveIcon(nombre?: string): React.ComponentType<any> {
  if (!nombre) return GraduationCap;
  const key = nombre.toLowerCase().replace(/\s+/g, '-');
  if (MAPA_ICONOS[key]) return MAPA_ICONOS[key];
  const pascal = nombre.charAt(0).toUpperCase() + nombre.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return (LucideIcons as any)[pascal] || GraduationCap;
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
  const hasHero = pageContent?.heroTitle || pageContent?.heroImage;
  const hasBody = pageContent?.bodyContent && pageContent.bodyContent.length > 0;
  const hasTeam = teamMembers && teamMembers.length > 0;
  const cmsId = pageContent?._id || '';
  const isCmsPresent = !!pageContent;

  // Determinar qué pilares mostrar
  const cmsCaracteristicas = (pageContent?.caracteristicas && pageContent.caracteristicas.length > 0)
    ? pageContent.caracteristicas
    : null;

  return (
    <section>
      {/* ===== HERO desde Sanity CMS ===== */}
      {hasHero && (
        <div className="mb-8" data-sanity-edit={`pageContent.${cmsId}.heroTitle`}>
          {pageContent?.heroImage?.asset ? (
            <div className="relative rounded-2xl overflow-hidden mb-6 h-48 md:h-64">
              <img src={getImageUrl(pageContent.heroImage as SanityImage, 1200, 400) || ''} alt={pageContent.heroTitle || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{pageContent.heroTitle}</h1>
                {pageContent.heroSubtitle && (
                  <div className="text-white/80 mt-2 max-w-2xl">
                    <PortableText value={pageContent.heroSubtitle as PortableTextBlock[]} components={ptComponents} />
                  </div>
                )}
              </div>
            </div>
          ) : (
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

      {/* ===== BODY desde Sanity CMS ===== */}
      {hasBody && (
        <div className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 mb-8 prose prose-sm dark:prose-invert max-w-none" data-sanity-edit={`pageContent.${cmsId}.bodyContent`}>
          <PortableText value={pageContent!.bodyContent as any} components={{
            ...ptComponents,
            types: {
              image: ({ value }: any) => {
                if (value?.asset?._ref || value?.asset?._id) {
                  return (<div className="my-4 rounded-xl overflow-hidden"><img src={getImageUrl(value, 800, 500) || ''} alt={value.alt || ''} className="w-full h-auto" /></div>);
                }
                return null;
              },
            },
          }} />
        </div>
      )}

      {/* ===== FALLBACK / HISTORIA (siempre con data-sanity-edit si hay CMS) ===== */}
      {!hasHero && !hasBody && (
        <>
          {/* Header */}
          <div className="mb-8" data-sanity-edit={`pageContent.${cmsId}.pageTitle`}>
            {pageContent?.historiaTexto ? (
              <>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-2">
                  {pageContent.pageTitle?.split(' ').map((word, i, arr) =>
                    i === arr.length - 1 ? <span key={i} className="text-emerald-500">{word}</span> : <span key={i}>{word} </span>
                  ) || 'Sobre Academia El Profe Oficial'}
                </h1>
                {pageContent?.heroSubtitle && (
                  <div className="text-muted-foreground text-sm lg:text-base max-w-2xl">
                    <PortableText value={pageContent.heroSubtitle as PortableTextBlock[]} components={ptComponents} />
                  </div>
                )}
              </>
            ) : (
              /* Fallback hardcodeado cuando no hay CMS ni hero */
              <>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-2">
                  Sobre <span className="text-emerald-500">Academia El Profe Oficial</span>
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">
                  Nace con la misión de brindar refuerzo académico de calidad a estudiantes de ingeniería en Perú. Creemos que ningún estudiante debería reprobar por falta de recursos educativos adecuados.
                </p>
              </>
            )}
          </div>

          {/* Historia — SIEMPRE con data-sanity-edit cuando el documento CMS existe */}
          <div id="historia" className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 mb-8 scroll-mt-16"
            {...(isCmsPresent ? { 'data-sanity-edit': `pageContent.${cmsId}.historiaTexto` } : {})}>
            <h2 className="text-lg font-bold text-foreground mb-4">Nuestra Historia</h2>
            {pageContent?.historiaTexto ? (
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {pageContent.historiaTexto}
              </div>
            ) : (
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Academia El Profe Oficial fue fundada por el Prof. Kall Bruno Díaz, docente universitario con una pasión inquebrantable por la enseñanza de las ciencias básicas para ingeniería. Tras años de observar cómo cientos de estudiantes luchaban con cursos como Cálculo, Mecánica y Fluidos, decidió crear una plataforma que llevara sus clases de calidad directa al celular o computadora de cada estudiante.</p>
                <p>Lo que comenzó como grabaciones compartidas por WhatsApp se transformó en una plataforma educativa completa con video-lecciones estructuradas, material de apoyo en PDF, sistemas de evaluación y certificados que respaldan el esfuerzo de cada estudiante. Hoy, Academia El Profe Oficial es la opción preferida por miles de estudiantes de la UTP y otras universidades de ingeniería en todo el Perú.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== PROFESOR FUNDADOR — SIEMPRE con data-sanity-edit cuando el documento CMS existe ===== */}
      {isCmsPresent && (
        <div id="equipo" className="mb-8 scroll-mt-16">
          <h2 className="text-lg font-bold text-foreground mb-4">Nuestro Equipo</h2>
          <div className="rounded-2xl border border-border/40 bg-card p-6 lg:p-8 text-center max-w-md mx-auto"
            data-sanity-edit={`pageContent.${cmsId}.profesor`}>
            {pageContent?.profesor?.foto?.asset ? (
              <img src={getImageUrl(pageContent.profesor.foto as SanityImage, 200, 200) || ''} alt={pageContent.profesor.nombre || ''} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-2 ring-emerald-500/30" />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl font-bold">
                {pageContent?.profesor?.nombre?.charAt(0) || '?'}
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground mb-1">{pageContent?.profesor?.nombre || 'Prof. Kall Bruno Díaz'}</h3>
            {pageContent?.profesor?.titulo && <p className="text-emerald-500 text-sm font-medium mb-3">{pageContent.profesor.titulo}</p>}
            {pageContent?.profesor?.descripcion ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{pageContent.profesor.descripcion}</p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">Profesor universitario con amplia experiencia en la enseñanza de Cálculo 1,2,3, Física, Ecuaciones Diferenciales, Estática, Termodinámica y otras asignaturas de ciencias e ingeniería.</p>
            )}
          </div>
        </div>
      )}

      {/* ===== TEAM desde Sanity (solo si no hay CMS) ===== */}
      {hasTeam && !isCmsPresent && (
        <div id="equipo" className="mb-8 scroll-mt-16">
          <h2 className="text-lg font-bold text-foreground mb-4">Nuestro Equipo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers!.map((member) => (
              <div key={member._id} className="rounded-2xl border border-border/40 bg-card p-5 text-center" data-sanity-edit={`teamMember.${member._id}.name`}>
                {member.photo?.asset ? (
                  <img src={getImageUrl(member.photo, 200, 200) || ''} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">{member.name.charAt(0)}</div>
                )}
                <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
                {member.bio && <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-3">{plainText(member.bio)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CARACTERÍSTICAS / PILARES ===== */}
      <div id="pilares" className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 scroll-mt-16">
        {cmsCaracteristicas
          ? /* Desde Sanity CMS — cada tarjeta con data-sanity-edit individual */
            cmsCaracteristicas.map((item, idx) => {
              const Icono = resolveIcon(item.icono);
              const sanPath = item._key
                ? `pageContent.${cmsId}.caracteristicas[_key=="${item._key}"]`
                : `pageContent.${cmsId}.caracteristicas[${idx}]`;
              return (
                <div key={item._key || idx} className="rounded-2xl border border-border/40 bg-card p-6" data-sanity-edit={sanPath}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                      <Icono className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-foreground">{item.titulo}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.descripcion}</p>
                </div>
              );
            })
          : isCmsPresent
            ? /* CMS existe pero las características están vacías — mostramos placeholders editables */
              [0, 1, 2, 3].map((idx) => {
                const pilar = PILARES_FALLBACK[idx];
                const Icono = pilar.icono;
                return (
                  <div key={pilar.titulo} className="rounded-2xl border border-border/40 bg-card p-6" data-sanity-edit={`pageContent.${cmsId}.caracteristicas[${idx}]`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                        <Icono className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-foreground">{pilar.titulo}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pilar.descripcion}</p>
                  </div>
                );
              })
            : /* Sin CMS — fallback hardcodeado sin overlay */
              PILARES_FALLBACK.map((pilar) => {
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
              )}
      </div>
    </section>
  );
}
