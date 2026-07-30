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
  MessageSquare,
  Send,
  ListChecks,
  Loader2,
  LogIn,
  ShieldAlert,
} from 'lucide-react';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { sanitizeHex } from '@/lib/utils';
import type { SanityCourse, SanityClassVideo, SanityTopic, PortableTextBlock } from '@/lib/sanity.client';
import { getImageUrl } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';
import { useAuth } from '@/lib/auth-context';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { PurchaseOverlay } from '@/components/course/PurchaseOverlay';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TemarioPageClientProps {
  readonly course: SanityCourse | null;
  readonly whatsapp: string;
  readonly whatsappMessage: string;
  readonly backUrl: string;
}

// Selected video for the right panel
interface SelectedVideo {
  readonly url: string;
  readonly title: string;
  readonly poster?: string;
  readonly isFree?: boolean;
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

export function TemarioPageClient({ course, whatsapp, whatsappMessage, backUrl }: TemarioPageClientProps) {
  const { user, purchasedCourseIds, isOwner, isGoogleUser } = useAuth();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
  const [activeTopicTitle, setActiveTopicTitle] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingPay, setLoadingPay] = useState<Record<string, boolean>>({});

  const [showPurchase, setShowPurchase] = useState(false);

  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Course data from CMS (must be BEFORE callbacks that use them)
  const title = course?.title || 'Curso';
  const description = course?.description as PortableTextBlock[] | undefined;
  const slug = course?.slug || '';
  const category = course?.category || '';
  const cardColor = sanitizeHex(course?.cardColor);
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

  const mappedCourse = useMemo(() => ({
    id: slug,
    titulo: title,
    subtitulo: '',
    slug,
    categoria: {
      nombre: categoryLabel,
      color: 'bg-brand-primary',
    },
    nivel: level as any,
    precio: pricePEN,
    precioUSD: priceUSD,
    numeroLecciones: totalClasses,
    numeroEstudiantes: 1250,
    calificacion: 4.9,
    portadaUrl: coverImg || '',
    descripcion: '',
  }), [slug, title, categoryLabel, level, pricePEN, priceUSD, totalClasses, coverImg]);

  // Payment handlers — POST como en /cursos (no GET que da 405)
  const safeTitle = title.replace(/[\u200B-\u200D\uFEFF\u2060-\u2064\u00AD]/g, '').trim();

  const handleMP = useCallback(async () => {
    const key = `${slug}-mp`;
    if (loadingPay[key]) return;
    setLoadingPay((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: slug, titulo: safeTitle, precio: pricePEN, userId: user?.uid || undefined,
          userEmail: user?.email || undefined, }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {} finally {
      setLoadingPay((prev) => ({ ...prev, [key]: false }));
    }
  }, [slug, safeTitle, pricePEN, user, loadingPay]);

  const handlePayPal = useCallback(async () => {
    const key = `${slug}-pp`;
    if (loadingPay[key]) return;
    setLoadingPay((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: slug, titulo: safeTitle, precioUSD: priceUSD, userId: user?.uid || undefined,
          userEmail: user?.email || undefined, }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {} finally {
      setLoadingPay((prev) => ({ ...prev, [key]: false }));
    }
  }, [slug, safeTitle, priceUSD, user, loadingPay]);

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

  // Video progress persistence
  useEffect(() => {
    if (!videoRef.current || !selectedVideo) return;
    const saved = localStorage.getItem(`vid_progress_${slug}_${selectedVideo.url}`);
    if (saved) {
      videoRef.current.currentTime = parseFloat(saved);
    }
  }, [selectedVideo, slug]);

  const handleTimeUpdate = useCallback((seconds?: number) => {
    if (selectedVideo) {
      const time = seconds !== undefined ? seconds : (videoRef.current?.currentTime || 0);
      if (time > 0) {
        localStorage.setItem(`vid_progress_${slug}_${selectedVideo.url}`, String(time));
      }
    }
  }, [slug, selectedVideo]);

  // No auto-play — user clicks to play manually

  // Fetch comments when a video is selected
  useEffect(() => {
    if (!selectedVideo || !slug) return;
    const lessonId = selectedVideo.url;
    setLoadingComments(true);
    fetch(`/api/comments?courseId=${slug}&lessonId=${encodeURIComponent(lessonId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
        else setComments([]);
      })
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [selectedVideo, slug]);

  // Submit a comment
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim() || !selectedVideo || !slug || !user) return;
    setSendingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: slug,
          lessonId: selectedVideo.url,
          content: newComment.trim(),
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'Usuario',
          userPhoto: user.photoURL || null,
        }),
      });
      if (res.ok) {
        const newCmt = await res.json();
        setComments((prev) => [newCmt, ...prev]);
        setNewComment('');
      }
    } catch {}
    setSendingComment(false);
  }, [newComment, selectedVideo, slug, user]);

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `Hace ${days}d`;
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };


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
          const videoUrl = firstVideo.videoUrl || firstVideo.video?.asset?.url || firstVideo.sharedVideo?.videoFile?.asset?.url || firstVideo.sharedVideo?.videoUrl;
          if (videoUrl) {
            setSelectedVideo({
              url: videoUrl,
              title: firstVideo.title,
              poster: coverImg || undefined,
              isFree: !!firstVideo.isFree,
            });
          }
        }
      }
      return next;
    });
  }, [activeTopicTitle, topicGroups, coverImg]);

  // Select a specific video from a module
  const selectVideo = useCallback((video: SanityClassVideo) => {
    const videoUrl = video.videoUrl || video.video?.asset?.url || video.sharedVideo?.videoFile?.asset?.url || video.sharedVideo?.videoUrl;
    if (!videoUrl) return;
    setSelectedVideo({
      url: videoUrl,
      title: video.title,
      poster: coverImg || undefined,
      isFree: !!video.isFree,
    });
  }, [coverImg]);

  // Expand all / collapse all
  const expandAll = useCallback(() => {
    const allTitles = topicGroups.map((g) => g.title);
    setExpandedTopics(new Set(allTitles));
    // Auto-select first video of first group
    const firstGroup = topicGroups[0];
    if (firstGroup && firstGroup.videos.length > 0) {
      const firstVideo = firstGroup.videos[0];
      const videoUrl = firstVideo.videoUrl || firstVideo.video?.asset?.url || firstVideo.sharedVideo?.videoFile?.asset?.url || firstVideo.sharedVideo?.videoUrl;
      if (videoUrl) {
        setActiveTopicTitle(firstGroup.title);
        setSelectedVideo({ url: videoUrl, title: firstVideo.title, poster: coverImg || undefined, isFree: !!firstVideo.isFree });
        if (window.innerWidth < 1024) {
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
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
      return false;
    },
    [isFreeCourse, hasFullAccess]
  );

  const canAccessMaterial = useCallback((material?: SanityTopicMaterial): boolean => {
    if (isFreeCourse) return true;
    if (hasFullAccess) return true;
    if (material?.isFree) return true;
    return false;
  }, [isFreeCourse, hasFullAccess]);

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
        <Link href={backUrl} className="text-sm text-brand-primary hover:underline font-medium">
          Ver todos los cursos
        </Link>
      </div>
    );
  }

  // Override brand-primary CSS vars with course cardColor for entire page
  const colorStyle = useMemo(() => {
    const h = cardColor.replace('#', '');
    const num = parseInt(h, 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    const darken = (amt: number) => {
      const dr = Math.max(0, r - amt);
      const dg = Math.max(0, g - amt);
      const db = Math.max(0, b - amt);
      return `#${((dr << 16) | (dg << 8) | db).toString(16).padStart(6, '0')}`;
    };
    const lighten = (amt: number) => {
      const lr = Math.min(255, r + amt);
      const lg = Math.min(255, g + amt);
      const lb = Math.min(255, b + amt);
      return `#${((lr << 16) | (lg << 8) | lb).toString(16).padStart(6, '0')}`;
    };
    const safeHex = cardColor; // already sanitized above
    return {
      '--color-brand-primary': safeHex,
      '--color-brand-primary-hover': darken(30),
      '--color-brand-primary-text': darken(60),
      '--color-brand-primary-bg': `${safeHex}1F`,
      '--color-brand-primary-bg-light': `${safeHex}0F`,
      '--color-brand-primary-darkest': darken(80),
      '--color-brand-primary-light-text': lighten(80),
    } as React.CSSProperties;
  }, [cardColor]);

  return (
    <div className="space-y-6" style={colorStyle}>
      {/* ===== BACK LINK ===== */}
      <Link
        href={backUrl}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        Volver a {backUrl.includes('utp') ? 'cursos UTP' : 'cursos'}
      </Link>

      {/* ===== COURSE HEADER ===== */}
      <div className="rounded-2xl p-6 lg:p-8 text-white" style={{ backgroundColor: cardColor }}>
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

          {/* Price card — estilo directo como en /cursos */}
          {!isFreeCourse && !hasFullAccess && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 text-center min-w-[200px]">
              <p className="text-xs text-white/70 mb-1">Precio del curso</p>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-3xl font-bold text-white">{formatoSoles(pricePEN)}</span>
                <span className="text-sm text-white/80 font-medium">{formatoUSD(priceUSD)}</span>
              </div>

              {/* Auth Gate: require Google login to purchase */}
              {!user ? (
                <div className="flex flex-col gap-1.5 mt-3">
                  <div className="rounded-lg border border-amber-300/40 bg-amber-500/20 p-3 text-center">
                    <ShieldAlert className="h-6 w-6 text-amber-300 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-amber-100 mb-0.5">Debes iniciar sesion para comprar</p>
                    <p className="text-[10px] text-amber-200/70">Usa tu cuenta de Google</p>
                  </div>
                  <Link
                    href="/iniciar-sesion"
                    className="w-full h-10 text-xs font-bold tracking-wide text-white gap-1.5 rounded-lg flex items-center justify-center transition-all bg-white/25 hover:bg-white/35"
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    Iniciar Sesion con Google
                  </Link>
                </div>
              ) : !isGoogleUser ? (
                <div className="flex flex-col gap-1.5 mt-3">
                  <div className="rounded-lg border border-amber-300/40 bg-amber-500/20 p-3 text-center">
                    <ShieldAlert className="h-6 w-6 text-amber-300 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-amber-100 mb-0.5">Se requiere cuenta de Google</p>
                    <p className="text-[10px] text-amber-200/70">Cierra sesion y entra con Google</p>
                  </div>
                </div>
              ) : (
                <>
                {/* Botón de pago unificado (Culqi) */}
                <div className="flex flex-col gap-1.5 mt-3">
                <button
                  onClick={() => setShowPurchase(true)}
                  className="w-full h-10 text-xs font-bold tracking-wide text-white gap-1.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-brand-primary-hover hover:bg-brand-primary"
                >
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  Pagar con Tarjeta (Culqi)
                </button>
                <PurchaseOverlay 
                  curso={mappedCourse as any}
                  open={showPurchase}
                  onOpenChange={setShowPurchase}
                />
                <Link
                  href={`/cursos/${slug}/temario`}
                  className="w-full h-9 text-xs font-bold tracking-wide gap-1.5 rounded-lg flex items-center justify-center border border-white/40 text-white hover:bg-white/10 transition-colors"
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  VER TEMARIO
                </Link>
              </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== DESCRIPTION (collapsed by default) ===== */}
      {description && description.length > 0 && (
        <details className="rounded-xl border border-border/40 bg-card group mb-8">
          <summary className="px-4 py-3 text-sm font-bold text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center justify-between">
            Descripcion del Curso
            <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 prose prose-sm dark:prose-invert max-w-none">
            <PortableText value={description} components={ptComponents} />
          </div>
        </details>
      )}

      {/* ===== PROMO VIDEO (Standalone section) ===== */}
      {(course?.videoUrl || course?.courseVideo?.asset?.url) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-brand-primary" />
              Video de Presentacion
            </h2>
          </div>
          <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm">
            <div className="video-player-container relative bg-black aspect-video">
              <VideoPlayer
                videoUrl={course.videoUrl || course.courseVideo?.asset?.url}
                titulo={`Video de presentacion — ${title}`}
                posterUrl={coverImg || undefined}
                isFree={true}
              />
            </div>
            <div className="px-5 py-4 bg-card">
              <h3 className="text-base font-bold text-foreground">Introducción al Curso</h3>
              <p className="text-sm text-muted-foreground mt-1">Conoce todo lo que vas a aprender en este curso.</p>
            </div>
          </div>
        </div>
      )}

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
          <div className="flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* LEFT: Module accordion (3 cols) */}
              <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {topicGroups.map((group, groupIndex) => {
                const isExpanded = expandedTopics.has(group.title) || topicGroups.length === 1;
                const isActive = activeTopicTitle === group.title;
                const hasContent = group.videos.length > 0 || group.materials.length > 0;
                const groupSelectedVideoObj = !!selectedVideo ? group.videos.find((v) => {
                  const url = v.videoUrl || v.video?.asset?.url || v.sharedVideo?.videoFile?.asset?.url || v.sharedVideo?.videoUrl;
                  return url === selectedVideo.url;
                }) : undefined;
                const groupHasSelectedVideo = !!groupSelectedVideoObj;
                const isGroupVideoAccessible = groupSelectedVideoObj ? canAccessLesson(groupSelectedVideoObj) : false;

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
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                          const videoUrl = video.videoUrl || video.video?.asset?.url || video.sharedVideo?.videoFile?.asset?.url || video.sharedVideo?.videoUrl;
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
                                <button
                                  onClick={() => selectVideo(video)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left opacity-70 ${
                                    isSelected
                                      ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30'
                                      : 'hover:bg-muted/40 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                                    <Lock className="h-4 w-4" />
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
                                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                                  </div>
                                </button>
                              )}

                              {/* INLINE MOBILE VIDEO PLAYER */}
                              {isSelected && !isDesktop && hasVideo && (
                                <div className="mt-2 mb-4 mx-1 rounded-xl overflow-hidden bg-black aspect-video relative shadow-md border border-border/40 lg:hidden">
                                  {accessible ? (
                                    <div className="relative w-full h-full" onContextMenu={(e) => e.preventDefault()}>
                                      <VideoPlayer
                                        videoUrl={videoUrl}
                                        titulo={video.title}
                                        posterUrl={video.posterImg?.asset?.url || undefined}
                                        isFree={video.isFree}
                                        onProgress={(seconds) => handleTimeUpdate(seconds)}
                                      />
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-4 text-center z-10">
                                      <Lock className="h-10 w-10 text-amber-500 mb-2 shrink-0" />
                                      <p className="text-sm font-bold text-white">Clase Bloqueada</p>
                                      <p className="text-xs text-slate-400 mt-1">Adquiere el curso para ver esta clase.</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* 📱 MOBILE: Inline materials + comments inside module (Video is now global above) */}
                        {groupHasSelectedVideo && (
                          <div className="lg:hidden border-t border-border/10 my-1 pt-2 px-1">
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
                            {/* MOBILE COMMENTS */}
                            <div className="border-t border-border/10 pt-3 mt-2 px-1">
                              <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-brand-primary" />
                                Comentarios {comments.length > 0 && <span className="text-[10px] font-normal text-muted-foreground">({comments.length})</span>}
                              </h5>
                              {user ? (
                                <div className="flex gap-2 mb-3">
                                  <div className="h-7 w-7 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-brand-primary">
                                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div className="flex-1 flex gap-1.5">
                                    <textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Comentar..."
                                      rows={1}
                                      maxLength={1000}
                                      className="flex-1 text-[11px] rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                                    />
                                    <button
                                      onClick={handleSubmitComment}
                                      disabled={!newComment.trim() || sendingComment}
                                      className="px-2.5 rounded-lg bg-brand-primary text-white disabled:opacity-50"
                                    >
                                      {sendingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-muted-foreground text-center mb-3">
                                  <Link href="/iniciar-sesion" className="text-brand-primary hover:underline">Inicia sesión</Link> para comentar
                                </p>
                              )}
                              {loadingComments ? (
                                <div className="flex justify-center py-3">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                              ) : comments.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground text-center py-3">Se el primero en comentar</p>
                              ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                  {comments.slice(0, 5).map((cmt: any) => (
                                    <div key={cmt.id} className="flex gap-2 p-2 rounded-lg bg-muted/10">
                                      <div className="h-6 w-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-[9px] font-bold text-brand-primary">
                                        {cmt.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <span className="text-[10px] font-semibold text-foreground">{cmt.user?.name || 'Usuario'}</span>
                                          <span className="text-[9px] text-muted-foreground">{formatDate(cmt.createdAt)}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed break-words">{cmt.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
                  {/* Video Player — Netflix: no extra border, video is the hero */}
                  <div className="video-player-container relative bg-card overflow-hidden">
                    {(() => {
                      // Find the actual video object to check access
                      let activeVideoObj: SanityClassVideo | undefined;
                      for (const group of topicGroups) {
                        const found = group.videos.find(v => (v.videoUrl || v.video?.asset?.url || v.sharedVideo?.videoFile?.asset?.url || v.sharedVideo?.videoUrl) === selectedVideo.url);
                        if (found) {
                          activeVideoObj = found;
                          break;
                        }
                      }
                      
                      const isAccessible = activeVideoObj ? canAccessLesson(activeVideoObj) : false;
                      
                      if (!isAccessible) {
                        return (
                          <div className="flex flex-col items-center justify-center py-24 bg-black/5">
                            <Lock className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm font-bold text-muted-foreground">Clase Bloqueada</p>
                            <p className="text-xs text-muted-foreground mt-1">Adquiere el curso para ver esta clase.</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {isDesktop && (
                            <VideoPlayer
                              videoUrl={selectedVideo.url}
                              titulo={selectedVideo.title}
                              posterUrl={selectedVideo.poster}
                              isFree={selectedVideo.isFree}
                              onProgress={(seconds) => handleTimeUpdate(seconds)}
                            />
                          )}
                        </>
                      );
                    })()}
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

                  {/* ===== COMENTARIOS ===== */}
                  <div className="border-t border-border/20 pt-4">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand-primary" />
                      Comentarios {comments.length > 0 && <span className="text-xs font-normal text-muted-foreground">({comments.length})</span>}
                    </h4>

                    {/* Formulario de comentario */}
                    {user ? (
                      <div className="flex gap-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-primary">
                          {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe un comentario..."
                            rows={2}
                            maxLength={1000}
                            className="flex-1 text-xs rounded-lg border border-border/40 bg-muted/30 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50"
                          />
                          <button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || sendingComment}
                            className="h-full px-3 py-2 rounded-lg bg-brand-primary text-white text-xs font-bold flex items-center gap-1 disabled:opacity-50 hover:bg-brand-primary-hover transition-colors"
                          >
                            {sendingComment ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">Publicar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 mb-4 rounded-lg bg-muted/20 border border-dashed border-border/40">
                        <p className="text-xs text-muted-foreground">
                          <Link href="/iniciar-sesion" className="text-brand-primary hover:underline font-medium">Inicia sesión</Link> para dejar un comentario
                        </p>
                      </div>
                    )}

                    {/* Lista de comentarios */}
                    {loadingComments ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-6 rounded-lg bg-muted/10 border border-dashed border-border/30">
                        <MessageSquare className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">Se el primero en comentar esta clase</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {comments.map((cmt: any) => (
                          <div key={cmt.id} className="flex gap-2.5 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                            <div className="h-7 w-7 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-brand-primary">
                              {cmt.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-foreground">{cmt.user?.name || 'Usuario'}</span>
                                <span className="text-[10px] text-muted-foreground">{formatDate(cmt.createdAt)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{cmt.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Placeholder when no video selected — Netflix minimal */
                <div className="rounded-xl border border-dashed border-border/40 bg-muted/5 flex flex-col items-center justify-center py-20 lg:py-28">
                  <PlayCircle className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground/50">Selecciona un modulo</p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </div>


    </div>
  );
}