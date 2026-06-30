'use client';

// ============================================================
// Course Detail Client — 100% CMS-driven
// Shows course overview, video, description, temario preview,
// and access control (Free/Paid, Preview/Premium).
// No mock data whatsoever.
// ============================================================

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Video,
  FileText,
  Clock,
  Lock,
  CheckCircle2,
  BookOpen,
  ListChecks,
  PlayCircle,
  FolderOpen,
  GraduationCap,
  ShoppingCart,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { cn } from '@/lib/utils';
import type { SanityCourse, SanityImage, PortableTextBlock } from '@/lib/sanity.client';
import { getImageUrl } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';

interface DetalleCursoClientProps {
  readonly course: SanityCourse;
}

const CATEGORY_COLORS: Record<string, string> = {
  calculo: 'bg-emerald-600',
  mecanica: 'bg-blue-600',
  fluidos: 'bg-cyan-600',
  termodinamica: 'bg-orange-600',
  estadistica: 'bg-purple-600',
  ecuaciones: 'bg-rose-600',
  otros: 'bg-slate-600',
};

const CATEGORY_LABELS: Record<string, string> = {
  calculo: 'Calculo',
  mecanica: 'Mecanica',
  fluidos: 'Fluidos',
  termodinamica: 'Termodinamica',
  estadistica: 'Estadistica',
  ecuaciones: 'Ecuaciones Diferenciales',
  otros: 'Otros',
};

const LEVEL_LABELS: Record<string, string> = {
  basico: 'Basico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const ptComponents = {
  block: ({ children, style }: { children: React.ReactNode; style?: string }) => {
    if (style === 'h2') return <h2 className="text-lg font-bold text-foreground mb-3">{children}</h2>;
    if (style === 'h3') return <h3 className="text-base font-bold text-foreground mb-2">{children}</h3>;
    if (style === 'normal' || !style) return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>;
    return <p>{children}</p>;
  },
};

export function DetalleCursoClient({ course }: DetalleCursoClientProps) {
  const [showPurchase, setShowPurchase] = useState(false);

  // CMS Data
  const title = course.title;
  const slug = course.slug;
  const category = course.category || '';
  const categoryColor = CATEGORY_COLORS[category] || 'bg-emerald-600';
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const professor = course.professor || '';
  const pricePEN = course.pricePEN || 0;
  const priceUSD = course.priceUSD || 0;
  const totalClasses = course.totalClasses || 0;
  const totalHours = course.totalHours || '0';
  const level = course.level || '';
  const courseType = course.courseType || 'paid';
  const isFreeCourse = courseType === 'free';
  const topics = course.topics || [];
  // Count all class videos across all topics
  const classVideos = topics.flatMap(t => t.classVideos || []);
  const topicMaterials = topics.flatMap(t => t.materials || []);
  const coverImg = course.coverImage ? getImageUrl(course.coverImage, 800, 500) : null;

  // Video
  const videoSourceUrl = course.videoUrl || course.courseVideo?.asset?.url || undefined;

  // Stats
  const freeVideoCount = classVideos.filter(v => v.isFree).length;

  const handleComprar = useCallback(() => setShowPurchase(true), []);

  return (
    <section>
      {/* Back Navigation */}
      <Link
        href="/cursos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catalogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div className={cn('rounded-2xl p-6 lg:p-8 text-white', categoryColor)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    {categoryLabel}
                  </Badge>
                  {isFreeCourse && (
                    <span className="bg-green-400/20 text-green-100 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      Gratuito
                    </span>
                  )}
                  {level && (
                    <Badge variant="secondary" className="bg-white/15 text-white/90 border-0 text-xs">
                      {LEVEL_LABELS[level] || level}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{title}</h1>
                {professor && <p className="text-white/80 text-sm">Prof. {professor}</p>}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {totalClasses > 0 && (
                <span className="flex items-center gap-1.5">
                  <Video className="h-4 w-4" />
                  {totalClasses} lecciones
                </span>
              )}
              {topicMaterials.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Material descargable
                </span>
              )}
              {totalHours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {totalHours} horas
                </span>
              )}
              {!isFreeCourse && freeVideoCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <PlayCircle className="h-4 w-4" />
                  {freeVideoCount} clases gratuitas
                </span>
              )}
            </div>
          </div>

          {/* Video Player */}
          {videoSourceUrl && (
            <div className="rounded-2xl bg-muted/50 border border-border/40 overflow-hidden">
              <VideoPlayer
                videoUrl={videoSourceUrl}
                titulo={`Video de presentacion — ${title}`}
                posterUrl={coverImg || undefined}
              />
            </div>
          )}

          {/* Description */}
          {course.description && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Descripcion del Curso</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <PortableText value={course.description as PortableTextBlock[]} components={ptComponents} />
              </div>
            </div>
          )}

          {/* Quick Overview: What you'll learn */}
          {topics.length > 0 && (
            <div className="rounded-xl border border-border/40 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Que vas a aprender</h2>
              <div className="space-y-3">
                {topics.map((topic, index) => (
                  <div key={topic.title} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{topic.title}</p>
                      {topic.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Go to Full Temario CTA */}
          <Link
            href={`/cursos/${slug}/temario`}
            className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-primary/10">
                <ListChecks className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Ver Temario Completo</p>
                <p className="text-xs text-muted-foreground">
                  {topics.length} modulos, {classVideos.length} videos, {topicMaterials.length} materiales
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-brand-primary transition-colors" />
          </Link>

          {/* Certificate Section */}
          <div className="rounded-xl border border-border/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 shrink-0">
                <GraduationCap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">Certificado de Finalizacion</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Al completar todas las lecciones del curso, obtendras un certificado digital verificado
                  que podras agregar a tu perfil profesional y redes sociales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4 sticky top-20">
            {isFreeCourse ? (
              <>
                <div className="text-center">
                  <span className="text-3xl font-bold text-green-600">GRATIS</span>
                  <p className="text-sm text-muted-foreground mt-1">Acceso completo sin costo</p>
                </div>
                <Link
                  href={`/cursos/${slug}/temario`}
                  className="block w-full h-11 text-sm font-bold rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-center leading-[44px] transition-colors"
                >
                  Comenzar Curso
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {formatoSoles(pricePEN)}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {formatoUSD(priceUSD)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Pago unico, acceso de por vida</p>
                <Button
                  className={cn(
                    'w-full h-11 text-sm font-bold rounded-xl',
                    'bg-brand-primary hover:bg-brand-primary-hover text-white'
                  )}
                  onClick={handleComprar}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Comprar Ahora
                </Button>
                {freeVideoCount > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    {freeVideoCount} {freeVideoCount === 1 ? 'clase gratuita' : 'clases gratuitas'} de preview incluidas
                  </p>
                )}
              </>
            )}

            <Link
              href={`/cursos/${slug}/temario`}
              className="block w-full h-11 text-sm font-semibold rounded-xl border border-border/40 text-center leading-[44px] hover:bg-muted/30 transition-colors"
            >
              Ver Temario Completo
            </Link>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                Acceso de por vida
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                {totalClasses} lecciones en video
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                Material descargable (PDF, Word)
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                Certificado de finalizacion
              </div>
            </div>
          </div>

          {/* Temario Preview in Sidebar */}
          {topics.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">
                  Temario del Curso
                </h3>
                <Link
                  href={`/cursos/${slug}/temario`}
                  className="text-xs text-brand-primary-text hover:underline font-medium"
                >
                  Ver todo
                </Link>
              </div>
              <div className="space-y-0">
                {topics.map((topic, index) => (
                  <div key={topic.title}>
                    <div className="flex items-center gap-3 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0 bg-muted text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{topic.title}</p>
                        {topic.description && (
                          <p className="text-xs text-muted-foreground/70 truncate">{topic.description}</p>
                        )}
                      </div>
                      {topic.classes && (
                        <span className="text-xs text-muted-foreground shrink-0">{topic.classes} clases</span>
                      )}
                    </div>
                    {index < topics.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Overlay */}
      {showPurchase && !isFreeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPurchase(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">Compra {title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Accede a todos los {totalClasses} videos, materiales descargables y obtiene tu certificado.
            </p>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl font-bold text-foreground">{formatoSoles(pricePEN)}</span>
              <span className="text-sm text-muted-foreground">{formatoUSD(priceUSD)}</span>
            </div>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                Acceso de por vida a todo el contenido
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                Todos los videos y materiales descargables
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                Certificado digital de finalizacion
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                Soporte del profesor
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/api/checkout?courseId=${slug}&provider=mercadopago`}
                className="flex-1 bg-[#009ee3] hover:bg-[#007ab8] text-white font-bold text-sm py-3 rounded-xl text-center transition-colors"
              >
                Pagar con MercadoPago
              </Link>
              <Link
                href={`/api/checkout/paypal?courseId=${slug}`}
                className="flex-1 bg-[#ffc439] hover:bg-[#f0b020] text-[#003087] font-bold text-sm py-3 rounded-xl text-center transition-colors"
              >
                Pagar con PayPal
              </Link>
            </div>
            <button
              onClick={() => setShowPurchase(false)}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}