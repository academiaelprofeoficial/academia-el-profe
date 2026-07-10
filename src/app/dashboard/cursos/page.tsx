'use client';

// ============================================================
// Dashboard – Mis Cursos (vista estudiante)
// SOLO muestra cursos COMPRADOS por el usuario.
// Datos desde API /api/user/courses (Sanity CMS + DB progreso).
// Estado vacío: "Aún no tienes cursos" + CTA a /cursos
// ============================================================

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  PlayCircle,
  Search,
  XCircle,
  ArrowRight,
  Video,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { CURSOS_LANDING, COLOR_MAP } from '@/lib/data';
import { cn } from '@/lib/utils';
import { AnimatedSection } from '@/components/AnimatedSection';
import { getImageUrl, plainText } from '@/lib/sanity.client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CourseProgress {
  totalTemas: number;
  completedTemas: number;
  percentage: number;
  totalWatchTime: number;
  totalWatchTimeFormatted: string;
}

interface UserCourse {
  _id: string;
  title: string;
  slug: string;
  coverImage?: any;
  description?: any;
  professor?: string;
  topics?: any[];
  pricePEN?: number;
  priceUSD?: number;
  totalClasses?: number;
  totalHours?: string;
  level?: string;
  courseType?: string;
  progress: CourseProgress | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const FORMULA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FunctionSquare: require('lucide-react').FunctionSquare,
  Sigma: require('lucide-react').Sigma,
  TrendingUp: require('lucide-react').TrendingUp,
  MoveUpRight: require('lucide-react').MoveUpRight,
  Atom: require('lucide-react').Atom,
  Magnet: require('lucide-react').Magnet,
  Triangle: require('lucide-react').Triangle,
  BookOpen: require('lucide-react').BookOpen,
};

function getCourseDisplayHints(slug: string) {
  const mock = CURSOS_LANDING.find((m) => m.id === slug);
  return {
    colorKey: mock?.colorKey || 'emerald',
    formulaIcon: mock?.formulaIcon || 'BookOpen',
    formula: mock?.formula || '',
  };
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */

function ProgressBar({ percentage }: { readonly percentage: number }) {
  if (percentage <= 0) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
        <span>{percentage}% completado</span>
        <span>
          {percentage === 100 ? 'Finalizado' : 'En progreso'}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Course Card                                                        */
/* ------------------------------------------------------------------ */

function PurchasedCourseCard({ course, index }: { readonly course: UserCourse; readonly index: number }) {
  const { colorKey, formulaIcon, formula } = getCourseDisplayHints(course.slug);
  const colors = COLOR_MAP[colorKey] || COLOR_MAP.emerald;
  const FormulaIcon = FORMULA_ICONS[formulaIcon] || BookOpen;
  const topicCount = course.topics?.length || 0;
  const classCount = course.totalClasses || 0;

  return (
    <AnimatedSection delay={index * 0.08} direction="up">
      <div
        className="flex flex-col rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-[var(--surface-border)] hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer premium-card-shimmer card-glow"
        onClick={() => {
          window.location.href = `/cursos/${course.slug}/temario`;
        }}
      >
        {/* HEADER */}
        <div className={cn(colors.bg, 'px-4 py-5 flex flex-col gap-2 min-h-[120px] relative')}>
          <span className="absolute top-2 right-3 text-[10px] font-black tracking-[0.25em] text-white/20 select-none pointer-events-none uppercase">
            Premium
          </span>
          <span className="absolute top-2 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[9px] font-bold text-white">
            <CheckCircle2 className="h-3 w-3" />
            Comprado
          </span>
          <span className="text-2xl font-light text-white/90 leading-none">
            {formula || <FormulaIcon className="h-7 w-7 text-white/90" />}
          </span>
          <h3 className="text-sm font-bold text-white leading-snug">{course.title}</h3>
          <p className="text-[11px] text-white/70 leading-snug mt-auto">
            {plainText(course.description) || 'Curso completo con clases grabadas y material descargable.'}
          </p>
        </div>

        {/* BODY */}
        <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-3 flex flex-col gap-2 border-b border-slate-100 dark:border-[var(--surface-border)] flex-1">
          {topicCount > 0 && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <BookOpen className={cn('h-3.5 w-3.5 shrink-0', colors.text)} />
              <span>{topicCount} temas</span>
            </div>
          )}
          {classCount > 0 && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <Video className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>{classCount} clases</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <FileText className="h-3.5 w-3.5 shrink-0 text-purple-500" />
            <span>Material en PDF</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-4 flex flex-col gap-3 mt-auto">
          {/* Progress bar */}
          {course.progress && <ProgressBar percentage={course.progress.percentage} />}

          {/* CTA */}
          <Link
            href={`/cursos/${course.slug}/temario`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'w-full h-10 text-xs font-bold tracking-wide gap-2 rounded-lg flex items-center justify-center transition-all text-white',
              colors.bg,
              colors.hover
            )}
          >
            <PlayCircle className="h-4 w-4" />
            {course.progress && course.progress.percentage > 0
              ? 'CONTINUAR ESTUDIANDO'
              : 'ACCEDER AL CURSO'}
          </Link>
          <p className="text-[10px] text-center text-brand-primary font-medium">
            Acceso de por vida
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h2 className="text-xl font-bold text-brand-heading dark:text-slate-100 mb-2">
        Aun no tienes cursos
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        Explora nuestro catalogo de cursos y comienza a aprender hoy mismo.
        Acceso de por vida a todas las clases.
      </p>
      <Link
        href="/cursos"
        className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold transition-colors"
      >
        <BookOpen className="h-4 w-4" />
        Ver Catalogo
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment Status Banner (after redirect from checkout)               */
/* ------------------------------------------------------------------ */

function PaymentStatusBanner({ status, gateway }: { readonly status: string; readonly gateway?: string }) {
  const gatewayLabel = gateway === 'paypal' ? 'PayPal' : 'Mercado Pago';

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-brand-primary/30 dark:border-brand-primary/40 bg-brand-primary-bg-light px-5 py-4">
        <CheckCircle2 className="h-6 w-6 text-brand-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand-primary-text dark:text-brand-primary-light-text">
            Pago exitoso via {gatewayLabel}!
          </p>
          <p className="text-xs text-brand-primary-text mt-0.5">
            Tu curso ha sido activado. Ya puedes acceder a las clases.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-5 py-4">
        <Clock className="h-6 w-6 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Pago pendiente
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Tu pago esta siendo procesado. Recibiras una confirmacion pronto.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-5 py-4">
        <XCircle className="h-6 w-6 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Pago no completado
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            Hubo un problema con tu pago. Intenta nuevamente o usa otro metodo.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Main Page Content                                                  */
/* ------------------------------------------------------------------ */

function DashboardCursosContent() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('status') || '';
  const paymentGateway = searchParams.get('gateway') || '';
  const { user, purchasedCourseIds, refreshPurchases } = useAuth();

  // Fetch purchased courses from API
  const fetchCourses = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/courses?uid=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Refrescar compras tras pago exitoso
  useEffect(() => {
    if (paymentStatus === 'success') {
      refreshPurchases();
      fetchCourses(); // Re-fetch courses from API
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard/cursos');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, refreshPurchases, fetchCourses]);

  // Filter by search
  const cursosFiltrados = courses.filter((c) =>
    c.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100 leading-tight">
          <span className="block sm:inline">Mis Cursos</span>
          {courses.length > 0 && (
            <span className="inline-flex items-center gap-2 ml-2">
              <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-brand-primary text-white text-sm font-bold">
                {courses.length} activo{courses.length !== 1 ? 's' : ''}
              </span>
            </span>
          )}
        </h1>

        <Link
          href="/cursos"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-hover transition-colors self-start sm:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          Ver Catalogo
        </Link>
      </div>

      {/* Subtitle */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <PlayCircle className="h-4 w-4 shrink-0" />
        <span>Tus cursos adquiridos. Accede a las clases, materiales y certificados.</span>
      </div>

      {/* Payment status banner */}
      {paymentStatus && <PaymentStatusBanner status={paymentStatus} gateway={paymentGateway} />}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando tus cursos...</p>
          </div>
        </div>
      )}

      {/* Loaded — no courses */}
      {!loading && courses.length === 0 && <EmptyState />}

      {/* Loaded — has courses */}
      {!loading && courses.length > 0 && (
        <>
          {/* Search bar */}
          {courses.length > 2 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-brand-heading dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
              />
            </div>
          )}

          {/* Course grid */}
          {cursosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No se encontraron cursos para &quot;{busqueda}&quot;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {cursosFiltrados.map((course, idx) => (
                <PurchasedCourseCard key={course.slug} course={course} index={idx} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

export default function DashboardCursosPage() {
  return (
    <Suspense>
      <DashboardCursosContent />
    </Suspense>
  );
}