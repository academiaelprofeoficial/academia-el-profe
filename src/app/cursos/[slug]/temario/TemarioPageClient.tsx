'use client';

// ============================================================
// Temario Page Client — 100% CMS-driven
// SPLIT VIEW: Left = module list, Right = video + PDF player
// Clicking a module auto-expands and plays the first video.
// ============================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  CheckCircle2,
  FileText,
  Download,
  PlayCircle,
  Clock,
  Video,
  BookOpen,
  FolderOpen,
  ExternalLink,
  BadgeCheck,
  GraduationCap,
  MonitorPlay,
} from 'lucide-react';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import type { SanityCourse, SanityClassVideo, SanityTopic, PortableTextBlock } from '@/lib/sanity.client';
import { getImageUrl } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';
import { useAuth } from '@/lib/auth-context';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TemarioPageClientProps {
  readonly course: SanityCourse | null;
}

// Selected video for the right panel
interface SelectedVideo {
  readonly url: string;
  readonly title: string;
  readonly poster?: string;
}

/* ------------------------------------------------------------------ */
/*  PortableText Components                                            */
/* ------------------------------------------------------------------ */

const ptComponents = {
  block: ({ children, style }: { children: React.ReactNode; style?: string }) => {
    if (style === 'h2') return <h2 className="text-lg font-bold text-foreground mb-3">{children}</h2>;
    if (style === 'h3') return <h3 className="text-base font-bold text-foreground mb-2">{children}</h3>;
    if (style === 'normal' || !style) return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>;
    return <p>{children}</p>;
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getFileExtension(filename?: string): string {
  if (!filename) return '';
  const ext = filename.split('.').pop()?.toUpperCase() || '';
  return ext.slice(0, 5);
}

function getFileIcon(mimeType?: string): string {
  if (!mimeType) return 'FILE';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'DOC';
  if (mimeType.includes('powerpoint') || mimeType.includes('ppt')) return 'PPT';
  if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType.includes('xls')) return 'XLS';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compress')) return 'ZIP';
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

function getFileDarkColor(mimeType?: string): string {
  if (!mimeType) return 'bg-slate-800 text-slate-400';
  if (mimeType.includes('pdf')) return 'bg-red-950/40 text-red-400';
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'bg-blue-950/40 text-blue-400';
  if (mimeType.includes('powerpoint') || mimeType.includes('ppt')) return 'bg-orange-950/40 text-orange-400';
  if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType.includes('xls')) return 'bg-green-950/40 text-green-400';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'bg-purple-950/40 text-purple-400';
  return 'bg-slate-800 text-slate-400';
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TemarioPageClient({ course }: TemarioPageClientProps) {
  const { user, purchasedCourseIds, isOwner } = useAuth();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
  const [activeTopicTitle, setActiveTopicTitle] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Course data from CMS
  const title = course?.title || 'Curso';
  const description = course?.description as PortableTextBlock[] | undefined;
  const slug = course?.slug || '';
  const category = course?.category || '';
  const categoryColor = CATEGORY_COLORS[category] || 'bg-emerald-600';
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const professor = course?.professor || '';
  const pricePEN = course?.pricePEN || 0;
  const priceUSD = course?.priceUSD || 0;
  const totalClasses = course?.totalClasses || 0;
  const totalHours = course?.totalHours || '0';
  const level = course?.level || '';
  const courseType = course?.courseType || 'paid';
  const coverImg = course?.coverImage ? getImageUrl(course.coverImage, 800, 500) : null;
  const isFreeCourse = courseType === 'free';
  const hasFullAccess = isOwner || purchasedCourseIds.includes('__ALL_COURSES__') || purchasedCourseIds.includes(slug);

  const topics = course?.topics || [];

  // Build topic groups directly from nested structure — no fuzzy matching needed
  const topicGroups = useMemo(() => {
    return topics.map((topic) => ({
      title: topic.title,
      description: topic.description || undefined,
      classCount: topic.classes ?? topic.classVideos?.length ?? 0,
      videos: (topic.classVideos || [])
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
        .map((v, j) => ({ ...v, index: j })),
      materials: (topic.materials || [])
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100)),
    }));
  }, [topics]);

  // Flatten all class videos across all topics for stats
  const classVideos = useMemo(() => {
    const all: (SanityClassVideo & { index: number; topicTitle: string })[] = [];
    for (const topic of topics) {
      if (topic.classVideos) {
        for (const v of topic.classVideos) {
          all.push({ ...v, index: all.length, topicTitle: topic.title });
        }
      }
    }
    return all;
  }, [topics]);

  // Flatten all materials across all topics for stats
  const topicMaterials = useMemo(() => {
    const all: any[] = [];
    for (const topic of topics) {
      if (topic.materials) {
        for (const m of topic.materials) {
          all.push({ ...m, topic: topic.title });
        }
      }
    }
    return all;
  }, [topics]);

  // Get active group's data for right panel
  const activeGroup = useMemo(
    () => topicGroups.find((g) => g.title === activeTopicTitle) || null,
    [topicGroups, activeTopicTitle]
  );

  const totalVideos = classVideos.length;
  const totalMaterials = topicMaterials.length;
  const totalTopicCount = topicGroups.length;

  // Auto-play video when selectedVideo changes
  useEffect(() => {
    if (videoRef.current && selectedVideo) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [selectedVideo]);

  // Toggle topic expansion + auto-select first video
  const toggleTopic = useCallback((topicTitle: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicTitle)) {
        next.delete(topicTitle);
        if (activeTopicTitle === topicTitle) {
          setActiveTopicTitle(null);
          setSelectedVideo(null);
        }
      } else {
        next.add(topicTitle);
        setActiveTopicTitle(topicTitle);
        // Auto-select first accessible video
        const group = topicGroups.find((g) => g.title === topicTitle);
        if (group && group.videos.length > 0) {
          const firstVideo = group.videos[0];
          const videoUrl = firstVideo.videoUrl || firstVideo.video?.asset?.url;
          if (videoUrl) {
            setSelectedVideo({
              url: videoUrl,
              title: firstVideo.title,
              poster: coverImg || undefined,
            });
            // Scroll into view on mobile
            if (window.innerWidth < 1024) {
              setTimeout(() => {
                const el = document.getElementById(`topic-${topicTitle?.replace(/\s+/g, '-')}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 150);
            }
          }
        }
      }
      return next;
    });
  }, [activeTopicTitle, topicGroups, coverImg]);

  // Select a specific video from a module
  const selectVideo = useCallback((video: SanityClassVideo) => {
    const videoUrl = video.videoUrl || video.video?.asset?.url;
    if (!videoUrl) return;
    setSelectedVideo({
      url: videoUrl,
      title: video.title,
      poster: coverImg || undefined,
    });
    // Scroll topic into view on mobile
    const topicEl = document.getElementById(`topic-${video.title?.replace(/\s+/g, '-')}`);
    if (topicEl && window.innerWidth < 1024) {
      setTimeout(() => topicEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [coverImg]);

  // Expand all / collapse all
  const expandAll = useCallback(() => {
    const allTitles = topicGroups.map((g) => g.title);
    setExpandedTopics(new Set(allTitles));
    // Auto-select first video of first group
    const firstGroup = topicGroups[0];
    if (firstGroup && firstGroup.videos.length > 0) {
      const firstVideo = firstGroup.videos[0];
      const videoUrl = firstVideo.videoUrl || firstVideo.video?.asset?.url;
      if (videoUrl) {
        setActiveTopicTitle(firstGroup.title);
        setSelectedVideo({ url: videoUrl, title: firstVideo.title, poster: coverImg || undefined });
      }
    }
  }, [topicGroups, coverImg]);

  const collapseAll = useCallback(() => {
    setExpandedTopics(new Set());
    setActiveTopicTitle(null);
    setSelectedVideo(null);
  }, []);

  // Determine if a lesson is accessible
  const canAccessLesson = useCallback(
    (video: SanityClassVideo): boolean => {
      if (isFreeCourse) return true;
      if (hasFullAccess) return true;
      if (video.isFree) return true;
      return !!user;
    },
    [isFreeCourse, hasFullAccess, user]
  );

  const canAccessMaterial = useCallback((material?: SanityTopicMaterial): boolean => {
    if (isFreeCourse) return true;
    if (hasFullAccess) return true;
    if (material?.isFree) return true;
    return !!user;
  }, [isFreeCourse, hasFullAccess, user]);

  // Level label
  const levelLabel: Record<string, string> = {
    basico: 'Basico',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (!course) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Curso no encontrado</h2>
        <p className="text-sm text-muted-foreground mb-6">El curso que buscas no existe o fue eliminado.</p>
        <Link href="/cursos" className="text-sm text-brand-primary hover:underline font-medium">
          Ver todos los cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== BACK LINK ===== */}
      <Link
        href={slug ? `/cursos/${slug}` : '/cursos'}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        Volver al curso
      </Link>

      {/* ===== COURSE HEADER ===== */}
      <div className={`${categoryColor} rounded-2xl p-6 lg:p-8 text-white`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                {categoryLabel}
              </span>
              {isFreeCourse && (
                <span className="bg-green-400/20 text-green-100 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Gratuito
                </span>
              )}
              {level && (
                <span className="bg-white/15 text-white/90 text-xs font-medium px-2.5 py-1 rounded-lg">
                  {levelLabel[level] || level}
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{title}</h1>
            {professor && <p className="text-white/80 text-sm mb-4">Prof. {professor}</p>}

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {totalTopicCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="h-4 w-4" />
                  {totalTopicCount} modulos
                </span>
              )}
              {totalVideos > 0 && (
                <span className="flex items-center gap-1.5">
                  <Video className="h-4 w-4" />
                  {totalVideos} videos
                </span>
              )}
              {totalMaterials > 0 && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {totalMaterials} materiales
                </span>
              )}
              {totalHours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {totalHours} horas
                </span>
              )}
            </div>
          </div>

          {/* Price card */}
          {!isFreeCourse && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 text-center min-w-[200px]">
              <p className="text-xs text-white/70 mb-1">Precio del curso</p>
              <p className="text-3xl font-bold mb-0.5">{formatoSoles(pricePEN)}</p>
              <p className="text-sm text-white/80 mb-4">{formatoUSD(priceUSD)}</p>
              <button
                onClick={() => setShowPurchase(true)}
                className="w-full bg-white text-foreground font-bold text-sm py-2.5 rounded-lg hover:bg-white/90 transition-colors"
              >
                Comprar Ahora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== DESCRIPTION ===== */}
      {description && description.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Descripcion del Curso</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <PortableText value={description} components={ptComponents} />
          </div>
        </div>
      )}

      {/* ===== PROMO VIDEO ===== */}
      {(course?.videoUrl || course?.courseVideo?.asset?.url) && (
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-brand-primary" />
            Video de Presentacion
          </h2>
          <div className="rounded-lg overflow-hidden bg-black aspect-video">
            <video
              src={course.videoUrl || course.courseVideo?.asset?.url}
              controls
              className="w-full h-full"
              poster={coverImg || undefined}
            />
          </div>
        </div>
      )}

      {/* ===== CONTENT STATS BAR ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <FolderOpen className="h-5 w-5 mx-auto mb-1.5 text-brand-primary" />
          <p className="text-xl font-bold text-foreground">{totalTopicCount}</p>
          <p className="text-xs text-muted-foreground">Modulos</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <Video className="h-5 w-5 mx-auto mb-1.5 text-blue-500" />
          <p className="text-xl font-bold text-foreground">{totalVideos}</p>
          <p className="text-xs text-muted-foreground">Videos</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <FileText className="h-5 w-5 mx-auto mb-1.5 text-orange-500" />
          <p className="text-xl font-bold text-foreground">{totalMaterials}</p>
          <p className="text-xs text-muted-foreground">Materiales</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1.5 text-purple-500" />
          <p className="text-xl font-bold text-foreground">{totalHours}</p>
          <p className="text-xs text-muted-foreground">Horas</p>
        </div>
      </div>

      {/* ===== COURSE CURRICULUM — SPLIT VIEW ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Contenido del Curso
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={expandAll} className="text-xs text-brand-primary hover:underline font-medium">
              Expandir todo
            </button>
            <span className="text-muted-foreground/40">|</span>
            <button onClick={collapseAll} className="text-xs text-muted-foreground hover:text-foreground font-medium">
              Colapsar
            </button>
          </div>
        </div>

        {topicGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
            <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              El contenido del curso estara disponible pronto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEFT: Module accordion (3 cols) */}
            <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {topicGroups.map((group, groupIndex) => {
                const isExpanded = expandedTopics.has(group.title) || topicGroups.length === 1;
                const isActive = activeTopicTitle === group.title;
                const hasContent = group.videos.length > 0 || group.materials.length > 0;

                return (
                  <div
                    key={group.title}
                    id={`topic-${group.title?.replace(/\s+/g, '-')}`}
                    className={`rounded-xl border overflow-hidden transition-colors ${
                      isActive
                        ? 'border-brand-primary/50 bg-brand-primary-bg-light dark:border-brand-primary/30 dark:bg-brand-primary-bg'
                        : 'border-border/40 bg-card'
                    }`}
                  >
                    {/* Module Header */}
                    <button
                      onClick={() => hasContent && toggleTopic(group.title)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
                      disabled={!hasContent}
                    >
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold text-white shrink-0 ${isActive ? 'bg-brand-primary' : 'bg-brand-primary/60'}`}>
                        {groupIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isActive ? 'text-brand-primary' : 'text-foreground'}`}>{group.title}</p>
                        {group.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{group.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                          {group.videos.length > 0 && (
                            <span className="flex items-center gap-1"><Video className="h-3 w-3" />{group.videos.length}</span>
                          )}
                          {group.materials.length > 0 && (
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{group.materials.length}</span>
                          )}
                        </div>
                        {hasContent ? (
                          isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : null}
                      </div>
                    </button>

                    {/* Expanded: video + material list */}
                    {isExpanded && hasContent && (
                      <div className="border-t border-border/20 py-2 px-2 space-y-1">
                        {group.videos.map((video) => {
                          const accessible = canAccessLesson(video);
                          const videoUrl = video.videoUrl || video.video?.asset?.url;
                          const isSelected = selectedVideo?.url === videoUrl;
                          const hasVideo = !!videoUrl;

                          return (
                            <div key={`video-${video.title}-${video.order}`}>
                              {accessible && hasVideo ? (
                                <button
                                  onClick={() => selectVideo(video)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                    isSelected
                                      ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30'
                                      : 'hover:bg-muted/40 border border-transparent'
                                  }`}
                                >
                                  <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-brand-primary text-white'
                                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                                  }`}>
                                    {isSelected ? <MonitorPlay className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-brand-primary' : 'text-foreground'}`}>{video.title}</p>
                                    {video.description && (
                                      <p className="text-xs text-muted-foreground truncate mt-0.5">{video.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {video.duration && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />{video.duration}
                                      </span>
                                    )}
                                    {video.isFree && !isFreeCourse && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Gratis</span>
                                    )}
                                  </div>
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-70">
                                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                                    {!accessible ? <Lock className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground truncate">{video.title}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {video.duration && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />{video.duration}
                                      </span>
                                    )}
                                    {!accessible && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* 📱 MOBILE: Inline video player + materials inside module */}
                        {isSelected && (
                          <div className="lg:hidden border-t border-border/10 my-1 pt-2 px-1">
                            {/* Video Player */}
                            <div className="rounded-xl border border-border/40 bg-card overflow-hidden mb-3">
                              <div className="bg-black aspect-video">
                                <video
                                  key={`mobile-${selectedVideo.url}`}
                                  src={selectedVideo.url}
                                  controls
                                  autoPlay
                                  className="w-full h-full"
                                  poster={selectedVideo.poster}
                                  playsInline
                                />
                              </div>
                              <div className="px-4 py-3">
                                <h3 className="text-sm font-bold text-foreground">{selectedVideo.title}</h3>
                              </div>
                            </div>
                            {/* Materials inline on mobile */}
                            {activeGroup && activeGroup.materials.length > 0 && (
                              <div className="rounded-xl border border-border/40 bg-card p-4">
                                <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5 text-orange-500" />
                                  Materiales del Modulo
                                </h4>
                                <div className="space-y-1.5">
                                  {activeGroup.materials.map((material) => {
                                    const fileUrl = material.file?.asset?.url;
                                    const mimeType = material.file?.asset?.mimeType;
                                    const fileIcon = getFileIcon(mimeType);
                                    const fileColor = getFileColor(mimeType);
                                    const fileDarkColor = getFileDarkColor(mimeType);
                                    const accessible = canAccessMaterial(material);
                                    return (
                                      <div key={`mobile-mat-${material.title}`}>
                                        {accessible && fileUrl ? (
                                          <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors group"
                                          >
                                            <div className={`flex items-center justify-center h-8 w-8 rounded-lg text-[10px] font-bold shrink-0 ${fileColor} dark:${fileDarkColor}`}>
                                              {fileIcon}
                                            </div>
                                            <span className="text-xs font-medium text-foreground truncate flex-1">{material.title}</span>
                                            <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                          </a>
                                        ) : (
                                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/20 opacity-60">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-lg text-[10px] font-bold shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-400">
                                              <Lock className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground truncate flex-1">{material.title}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Materials */}
                        {group.materials.length > 0 && group.videos.length > 0 && (
                          <div className="border-t border-border/10 my-1" />
                        )}
                        {group.materials.map((material) => {
                          const fileUrl = material.file?.asset?.url;
                          const mimeType = material.file?.asset?.mimeType;
                          const fileIcon = getFileIcon(mimeType);
                          const fileColor = getFileColor(mimeType);
                          const fileDarkColor = getFileDarkColor(mimeType);
                          const accessible = canAccessMaterial(material);

                          return (
                            <div key={`mat-${material.title}-${material.order}`}>
                              {accessible && fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors group"
                                >
                                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg text-[10px] font-bold shrink-0 ${fileColor} dark:${fileDarkColor}`}>
                                    {fileIcon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate group-hover:underline">{material.title}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {material.isFree && !isFreeCourse && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Gratis</span>
                                    )}
                                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors" />
                                  </div>
                                </a>
                              ) : (
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-70">
                                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg text-[10px] font-bold shrink-0 ${accessible ? fileColor : 'bg-slate-100 text-slate-400'} dark:${accessible ? fileDarkColor : 'dark:bg-slate-800 text-slate-400'}`}>
                                    {accessible ? fileIcon : <Lock className="h-3.5 w-3.5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground truncate">{material.title}</p>
                                  </div>
                                  {!accessible && <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Video Player + PDFs (3 cols) — hidden on mobile, video is inline */}
            <div className="hidden lg:block lg:col-span-3">
              {selectedVideo ? (
                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                    <div className="bg-black aspect-video">
                      <video
                        ref={videoRef}
                        key={selectedVideo.url}
                        src={selectedVideo.url}
                        controls
                        autoPlay
                        className="w-full h-full"
                        poster={selectedVideo.poster}
                        playsInline
                      />
                    </div>
                    <div className="px-5 py-4">
                      <h3 className="text-base font-bold text-foreground">{selectedVideo.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{title} — Modulo: {activeTopicTitle}</p>
                    </div>
                  </div>

                  {/* Active group's PDFs */}
                  {activeGroup && activeGroup.materials.length > 0 && (
                    <div className="rounded-xl border border-border/40 bg-card p-5">
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        Materiales del Modulo
                      </h4>
                      <div className="space-y-2">
                        {activeGroup.materials.map((material) => {
                          const fileUrl = material.file?.asset?.url;
                          const mimeType = material.file?.asset?.mimeType;
                          const fileIcon = getFileIcon(mimeType);
                          const fileColor = getFileColor(mimeType);
                          const fileDarkColor = getFileDarkColor(mimeType);
                          const accessible = canAccessMaterial(material);

                          return (
                            <div key={`right-mat-${material.title}`}>
                              {accessible && fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/30 hover:bg-muted/30 hover:border-brand-primary/30 transition-all group"
                                >
                                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg text-xs font-bold shrink-0 ${fileColor} dark:${fileDarkColor}`}>
                                    {fileIcon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground group-hover:text-brand-primary transition-colors">{material.title}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">Archivo descargable</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {material.isFree && !isFreeCourse && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Gratis</span>
                                    )}
                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors" />
                                  </div>
                                </a>
                              ) : (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/20 opacity-60">
                                  <div className="flex items-center justify-center h-10 w-10 rounded-lg text-xs font-bold shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-400">
                                    <Lock className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">{material.title}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Placeholder when no video selected */
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center py-20 lg:py-28">
                  <MonitorPlay className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">Selecciona un modulo</p>
                  <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
                    Haz clic en cualquier modulo de la izquierda para ver el video y materiales aqui
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== PURCHASE OVERLAY ===== */}
      {showPurchase && !isFreeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPurchase(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">Compra este Curso</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Desbloquea acceso completo a todos los videos, materiales y descargas de {title}.
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-foreground">{formatoSoles(pricePEN)}</span>
              <span className="text-sm text-muted-foreground">{formatoUSD(priceUSD)}</span>
            </div>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                Acceso de por vida
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                Todos los videos y materiales
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                Certificado de finalizacion
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

      {/* ===== CERTIFICATE SECTION ===== */}
      <div className="rounded-xl border border-border/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 shrink-0">
            <GraduationCap className="h-6 w-6 text-amber-600 dark:amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Certificado Incluido</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Al completar el curso, obtendras un certificado digital verificado que podras compartir
              en tu perfil profesional y redes sociales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}