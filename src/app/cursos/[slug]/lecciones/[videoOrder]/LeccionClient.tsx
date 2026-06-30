'use client';

// ============================================================
// Leccion Client — 100% CMS-driven Lesson View
// Shows: Video player, lesson navigation, materials sidebar,
// comments placeholder. Supports Free/Paid access control.
// ============================================================

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Headset,
  Lock,
  PlayCircle,
  Clock,
  Phone,
  Circle,
  Eye,
  BookOpen,
  ShoppingCart,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import type { SanityCourse, SanityClassVideo, SanityTopic } from '@/lib/sanity.client';
import { useAuth } from '@/lib/auth-context';
import { VideoPlayer } from '@/components/course/VideoPlayer';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getFileIcon(mimeType?: string): string {
  if (!mimeType) return 'FILE';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'DOC';
  if (mimeType.includes('powerpoint') || mimeType.includes('ppt')) return 'PPT';
  if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType.includes('xls')) return 'XLS';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'ZIP';
  return 'FILE';
}

function getFileColor(mimeType?: string): string {
  if (!mimeType) return 'bg-slate-100 text-slate-600';
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-600';
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'bg-blue-100 text-blue-600';
  if (mimeType.includes('powerpoint') || mimeType.includes('ppt')) return 'bg-orange-100 text-orange-600';
  if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType.includes('xls')) return 'bg-green-100 text-green-600';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'bg-purple-100 text-purple-600';
  return 'bg-slate-100 text-slate-600';
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TopicWithLessons {
  title: string;
  lessons: (SanityClassVideo & { globalIndex: number })[];
}

interface LeccionClientProps {
  readonly course: SanityCourse;
  readonly videoOrder: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeccionClient({ course, videoOrder }: LeccionClientProps) {
  const { user, purchasedCourseIds, isOwner } = useAuth();
  const [comentario, setComentario] = useState('');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const slug = course.slug;
  const title = course.title;
  const courseType = course.courseType || 'paid';
  const isFreeCourse = courseType === 'free';
  const hasFullAccess = isOwner || purchasedCourseIds.includes('__ALL_COURSES__') || purchasedCourseIds.includes(slug);
  const pricePEN = course.pricePEN || 0;
  const priceUSD = course.priceUSD || 0;

  // Flatten all class videos from nested topics, sorted by order globally
  const sortedVideos = useMemo(() => {
    const all: (SanityClassVideo & { globalIndex: number; topicTitle: string })[] = [];
    for (const topic of course.topics || []) {
      if (topic.classVideos) {
        for (const v of topic.classVideos) {
          all.push({ ...v, globalIndex: all.length, topicTitle: topic.title });
        }
      }
    }
    return all.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }, [course.topics]);

  // Current video
  const currentVideoIndex = sortedVideos.findIndex((v) => String(v.order) === videoOrder);
  const currentVideo = sortedVideos[currentVideoIndex];
  const prevVideo = currentVideoIndex > 0 ? sortedVideos[currentVideoIndex - 1] : null;
  const nextVideo = currentVideoIndex < sortedVideos.length - 1 ? sortedVideos[currentVideoIndex + 1] : null;

  // Current video URL
  const videoUrl = currentVideo?.sharedVideo?.webmUrl || currentVideo?.sharedVideo?.videoUrl || currentVideo?.sharedVideo?.videoFile?.asset?.url || currentVideo?.videoUrl || currentVideo?.video?.asset?.url;
  const webmUrl = currentVideo?.sharedVideo?.webmUrl || (currentVideo?.video?.asset?.url?.endsWith('.webm') ? currentVideo?.video?.asset?.url : undefined);
  const canAccessCurrentLesson = isFreeCourse || hasFullAccess || !!currentVideo?.isFree || !!user;
  const canAccessMaterials = isFreeCourse || hasFullAccess || !!user;
  const isPremiumLocked = !canAccessCurrentLesson;

  // Group videos by topic for sidebar navigation — using nested structure
  const topicGroups = useMemo<TopicWithLessons[]>(() => {
    const groups: { title: string; lessons: (SanityClassVideo & { globalIndex: number })[] }[] = [];

    for (const topic of course.topics || []) {
      if (topic.classVideos && topic.classVideos.length > 0) {
        const lessons = topic.classVideos
          .map((v) => {
            const sortedIdx = sortedVideos.findIndex((sv) => sv.title === v.title && sv.order === v.order);
            return { ...v, globalIndex: sortedIdx >= 0 ? sortedIdx : 0 };
          })
          .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));

        groups.push({ title: topic.title, lessons });
      }
    }

    return groups;
  }, [course.topics, sortedVideos]);

  // Auto-expand the topic that contains the current video
  const currentTopic = currentVideo?.topicTitle || 'General';
  const activeExpandedTopic = expandedTopic || currentTopic;

  // Materials for the current video's topic — from nested structure
  const currentMaterials = useMemo(() => {
    if (!currentVideo?.topicTitle) return [];
    const topic = (course.topics || []).find((t) => t.title === currentVideo.topicTitle);
    if (!topic?.materials) return [];
    return topic.materials.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }, [currentVideo?.topicTitle, course.topics]);

  // canAccessMaterials is already defined above

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (!currentVideo) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Clase no encontrada</h2>
        <p className="text-sm text-muted-foreground mb-6">La clase que buscas no existe.</p>
        <Link href={`/cursos/${slug}/temario`} className="text-sm text-brand-primary hover:underline font-medium">
          Ver temario del curso
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      {/* ============================================================== */}
      {/*  DESKTOP LAYOUT — 3 columns (1 + 3 + 1)                        */}
      {/* ============================================================== */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-6">
        {/* ---- Column 1: Sidebar Navigation ---- */}
        <aside className="col-span-1 space-y-4">
          {/* Back link */}
          <Link
            href={`/cursos/${slug}/temario`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al temario
          </Link>

          {/* Course badge */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-brand-primary-bg-light text-brand-primary-text text-xs font-semibold px-2.5 py-1.5 rounded-lg">
              {title}
            </div>
          </div>

          {/* Lesson navigation */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              CONTENIDO DEL CURSO
            </h3>
            <div className="border-t border-slate-100 pt-1">
              {topicGroups.map((group) => {
                const isExpanded = activeExpandedTopic === group.title;
                const isActive = currentTopic === group.title;

                return (
                  <div key={group.title} className="border-b border-slate-100 last:border-b-0">
                    <button
                      onClick={() => setExpandedTopic(isExpanded ? null : group.title)}
                      className="w-full flex items-center gap-2.5 px-1 py-3 text-left group"
                    >
                      <span className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white shrink-0 bg-brand-primary">
                        {group.lessons.length}
                      </span>
                      <span className="flex-1 text-sm font-bold text-brand-heading truncate">
                        {group.title}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="pb-2 space-y-0.5 ml-3 pl-3 border-l-2 border-slate-100">
                        {group.lessons.map((lesson) => {
                          const isCurrentLesson = currentVideoIndex === lesson.globalIndex;
                          const lessonAccessible = isFreeCourse || hasFullAccess || !!lesson.isFree || !!user;

                          return lessonAccessible ? (
                            <Link
                              key={lesson.order}
                              href={`/cursos/${slug}/lecciones/${lesson.order}`}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                                isCurrentLesson
                                  ? 'bg-blue-50 text-brand-heading font-medium'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {isCurrentLesson ? (
                                <Eye className="h-4 w-4 text-brand-primary shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                              )}
                              <span className="flex-1 truncate text-[13px]">{lesson.title}</span>
                              {lesson.isFree && !isFreeCourse && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 shrink-0">
                                  GRATIS
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div
                              key={lesson.order}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 opacity-60"
                            >
                              <Lock className="h-4 w-4 shrink-0" />
                              <span className="flex-1 truncate text-[13px]">{lesson.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help box */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-primary-bg-light">
                <Headset className="h-4 w-4 text-brand-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-heading">Necesitas ayuda?</p>
                <p className="text-[11px] text-slate-500">Nuestro equipo esta listo.</p>
              </div>
            </div>
            <button className="w-full h-9 text-xs font-semibold rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white transition-colors flex items-center justify-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Contactar soporte
            </button>
          </div>
        </aside>

        {/* ---- Column 2: Video + Navigation + Comments ---- */}
        <div className="col-span-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Link href={`/cursos/${slug}/temario`} className="text-slate-500 hover:text-foreground transition-colors">
              {title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500">{currentTopic}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-foreground font-medium truncate">{currentVideo.title}</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-heading">
              {currentVideo.title}
            </h1>
            {currentVideo.isFree && !isFreeCourse && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Clase Gratuita
              </span>
            )}
            {!isFreeCourse && !currentVideo.isFree && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                Premium
              </span>
            )}
          </div>

          {/* Video Player or Lock */}
          <div id="lesson-player" className="scroll-mt-16">
            {isPremiumLocked ? (
              /* ---- LOCKED CONTENT ---- */
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-video flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">Contenido Premium</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Esta clase requiere la compra del curso para acceder al video y materiales.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-foreground">{formatoSoles(pricePEN)}</span>
                  <span className="text-sm text-muted-foreground">{formatoUSD(priceUSD)}</span>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/api/checkout?courseId=${slug}&provider=mercadopago`}
                    className="bg-[#009ee3] hover:bg-[#007ab8] text-white font-bold text-sm py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    MercadoPago
                  </Link>
                  <Link
                    href={`/api/checkout/paypal?courseId=${slug}`}
                    className="bg-[#ffc439] hover:bg-[#f0b020] text-[#003087] font-bold text-sm py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    PayPal
                  </Link>
                </div>
              </div>
            ) : (
              /* ---- VIDEO PLAYER ---- */
              <div className="rounded-2xl overflow-hidden bg-black">
                <VideoPlayer
                  videoUrl={videoUrl}
                  webmUrl={webmUrl}
                  titulo={currentVideo.title}
                />
              </div>
            )}
          </div>

          {/* Description */}
          {currentVideo.description && !isPremiumLocked && (
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/20">
              <p className="text-sm text-muted-foreground leading-relaxed">{currentVideo.description}</p>
            </div>
          )}

          {/* Prev / Next Navigation */}
          <div className="flex items-center justify-between mt-6">
            {prevVideo ? (
              <Link
                href={`/cursos/${slug}/lecciones/${prevVideo.order}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="truncate max-w-[150px]">{prevVideo.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextVideo ? (
              <Link
                href={`/cursos/${slug}/lecciones/${nextVideo.order}`}
                className="flex items-center gap-2 text-sm text-brand-primary hover:underline font-medium"
              >
                <span className="truncate max-w-[150px]">{nextVideo.title}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/cursos/${slug}/temario`}
                className="flex items-center gap-2 text-sm text-brand-primary hover:underline font-medium"
              >
                Volver al temario
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Comments Section */}
          {!isPremiumLocked && (
            <div id="lesson-comments" className="mt-8 scroll-mt-16">
              <h3 className="text-base font-bold text-brand-heading mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Preguntas y Comentarios
              </h3>

              {/* Input */}
              <div className="flex gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {user?.nombre?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Textarea
                    placeholder={user ? 'Escribe tu comentario...' : 'Inicia sesion para comentar'}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    disabled={!user}
                    className="resize-none min-h-[56px] text-sm border-slate-200 focus:border-brand-primary"
                  />
                  <div className="flex justify-end">
                    <button
                      className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors ${
                        user && comentario.trim()
                          ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!user || !comentario.trim()}
                    >
                      Publicar
                    </button>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              <div className="text-center py-8 text-sm text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p>Sé el primero en comentar en esta clase.</p>
              </div>
            </div>
          )}
        </div>

        {/* ---- Column 3: Materials ---- */}
        <aside className="col-span-1">
          <div id="lesson-materials" className="scroll-mt-16">
            <h3 className="text-sm font-bold text-brand-heading mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Material de la clase
            </h3>

            {currentMaterials.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border/40 rounded-xl">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p>Sin materiales adjuntos</p>
              </div>
            ) : isPremiumLocked ? (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border/40 rounded-xl">
                <Lock className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                <p>Materiales bloqueados</p>
                <p className="text-xs mt-1">Compra el curso para descargar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMaterials.map((material) => {
                  const fileUrl = material.file?.asset?.url;
                  const mimeType = material.file?.asset?.mimeType;
                  const fileIcon = getFileIcon(mimeType);
                  const fileColor = getFileColor(mimeType);

                  return (
                    <a
                      key={`mat-${material.title}-${material.order}`}
                      href={fileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="bg-slate-50 p-3 space-y-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${fileColor}`}>
                            {fileIcon}
                          </span>
                          {material.topic && (
                            <span className="text-[10px] text-slate-400 truncate">{material.topic}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-brand-heading leading-tight line-clamp-2">
                          {material.title}
                        </h4>
                      </div>
                      <div className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-brand-heading truncate">
                            {material.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {mimeType ? mimeType.split('/').pop()?.toUpperCase() : 'Archivo'}
                          </p>
                        </div>
                        <button className="shrink-0 w-9 h-9 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/*  MOBILE LAYOUT — 1 column with tab switcher                      */}
      {/* ============================================================== */}
      <div className="lg:hidden">
        {/* Back link */}
        <Link
          href={`/cursos/${slug}/temario`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al temario
        </Link>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="text-slate-500 truncate">{title} &gt; {currentTopic}</span>
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold text-brand-heading mb-1">{currentVideo.title}</h1>
        <div className="flex items-center gap-2 mb-4">
          {currentVideo.isFree && !isFreeCourse && (
            <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">Clase Gratuita</span>
          )}
          {!isFreeCourse && !currentVideo.isFree && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">Premium</span>
          )}
          {currentVideo.duration && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {currentVideo.duration}
            </span>
          )}
        </div>

        {/* Video or Lock */}
        {isPremiumLocked ? (
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-video flex flex-col items-center justify-center text-center p-8 mb-6">
            <Lock className="h-10 w-10 text-amber-500 mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-2">Contenido Premium</h2>
            <p className="text-sm text-muted-foreground mb-4">Compra el curso para acceder.</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold">{formatoSoles(pricePEN)}</span>
              <span className="text-sm text-muted-foreground">{formatoUSD(priceUSD)}</span>
            </div>
            <div className="flex gap-2 w-full">
              <Link
                href={`/api/checkout?courseId=${slug}&provider=mercadopago`}
                className="flex-1 bg-[#009ee3] text-white font-bold text-sm py-2.5 rounded-xl text-center"
              >
                MercadoPago
              </Link>
              <Link
                href={`/api/checkout/paypal?courseId=${slug}`}
                className="flex-1 bg-[#ffc439] text-[#003087] font-bold text-sm py-2.5 rounded-xl text-center"
              >
                PayPal
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden bg-black mb-4">
            <VideoPlayer videoUrl={videoUrl} webmUrl={webmUrl} titulo={currentVideo.title} />
          </div>
        )}

        {/* Description */}
        {currentVideo.description && !isPremiumLocked && (
          <div className="mb-4 p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
            {currentVideo.description}
          </div>
        )}

        {/* Materials (mobile) */}
        {!isPremiumLocked && currentMaterials.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-brand-heading mb-3">Material de la clase</h3>
            <div className="space-y-2">
              {currentMaterials.map((material) => {
                const fileUrl = material.file?.asset?.url;
                const mimeType = material.file?.asset?.mimeType;
                const fileIcon = getFileIcon(mimeType);
                const fileColor = getFileColor(mimeType);

                return (
                  <a
                    key={`mob-mat-${material.order}`}
                    href={fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className={`flex items-center justify-center h-8 w-8 rounded-lg text-[10px] font-bold shrink-0 ${fileColor}`}>
                      {fileIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{material.title}</p>
                      <p className="text-xs text-slate-400">{mimeType?.split('/').pop()?.toUpperCase()}</p>
                    </div>
                    <Download className="w-4 h-4 text-brand-primary shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Prev / Next (mobile) */}
        <div className="flex items-center justify-between py-4 border-t border-slate-200">
          {prevVideo ? (
            <Link
              href={`/cursos/${slug}/lecciones/${prevVideo.order}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Link>
          ) : <div />}
          {nextVideo ? (
            <Link
              href={`/cursos/${slug}/lecciones/${nextVideo.order}`}
              className="flex items-center gap-1.5 text-sm text-brand-primary font-medium"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link href={`/cursos/${slug}/temario`} className="text-sm text-brand-primary font-medium">
              Terminar
            </Link>
          )}
        </div>

        {/* Comments (mobile) */}
        {!isPremiumLocked && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-base font-bold text-brand-heading mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comentarios
            </h3>
            <div className="text-center py-6 text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p>Se el primero en comentar.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}