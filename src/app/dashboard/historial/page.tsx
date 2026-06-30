'use client';

// ============================================================
// Dashboard — Historial de Clases (Production DB)
// ============================================================

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, BookOpen, Loader2, ShoppingCart, Gift, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryCourse {
  courseId: string;
  courseTitle?: string;
  purchaseDate?: string;
  paymentStatus: string;
  accessType: 'purchase' | 'granted' | 'both' | 'progress_only';
  gateway?: string;
  amount?: number;
  currency?: string;
  progress: number;
  totalLessons: number;
  lastAccess?: string;
}

interface HistoryData {
  courses: HistoryCourse[];
  totalCourses: number;
  completedCourses: number;
}

function formatCourseSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function AccessTypeBadge({ type }: { type: HistoryCourse['accessType'] }) {
  if (type === 'purchase') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
        <ShoppingCart className="h-3 w-3" />
        Comprado
      </span>
    );
  }
  if (type === 'granted') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
        <Gift className="h-3 w-3" />
        Otorgado
      </span>
    );
  }
  if (type === 'both') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary-bg text-brand-primary-text">
        <ArrowRight className="h-3 w-3" />
        Ambos
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
      Progreso
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  if (normalized === 'approved' || normalized === 'granted' || normalized === 'active') {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
        Activo
      </span>
    );
  }
  if (normalized === 'pending') {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
        Pendiente
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize">
      {status}
    </span>
  );
}

export default function DashboardHistorialPage() {
  const { user } = useAuth();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/user/history?uid=${uid}`);
        if (!res.ok) throw new Error('Error al cargar historial');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const activeCourses = data
    ? data.courses.filter(
        (c) => c.progress > 0 && c.progress < c.totalLessons && c.totalLessons > 0
      ).length
    : 0;

  // Loading state
  if (loading) {
    return (
      <>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100">
              Historial de Clases
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registro de todas las clases que has visto y tu progreso en cada una.
          </p>
        </div>

        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100">
              Historial de Clases
            </h1>
          </div>
        </div>
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </>
    );
  }

  const hasData = data && data.courses.length > 0;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100">
            Historial de Clases
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Registro de todas las clases que has visto y tu progreso en cada una.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold text-brand-heading dark:text-slate-100">
            {data?.totalCourses ?? 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cursos</p>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold text-brand-primary-text">
            {data?.completedCourses ?? 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Completados</p>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeCourses}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">En progreso</p>
        </div>
      </div>

      {/* Empty state */}
      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-semibold text-brand-body mb-1">
            Aún no tienes cursos
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            Comienza a estudiar para ver tu historial aquí.
          </p>
          <Link href="/cursos">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white">
              Explorar Cursos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data!.courses.map((course) => {
            const progressPercent =
              course.totalLessons > 0
                ? Math.round((course.progress / course.totalLessons) * 100)
                : 0;
            const isCompleted = course.progress > 0 && course.progress >= course.totalLessons && course.totalLessons > 0;

            return (
              <div
                key={course.courseId}
                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-sm transition-shadow"
              >
                {/* Estado */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                  ) : course.progress > 0 ? (
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-brand-heading dark:text-slate-100 truncate">
                    {course.courseTitle || formatCourseSlug(course.courseId)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <AccessTypeBadge type={course.accessType} />
                    <PaymentStatusBadge status={course.paymentStatus} />
                    {course.purchaseDate && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {format(new Date(course.purchaseDate), "d MMM yyyy", { locale: es })}
                      </span>
                    )}
                    {course.lastAccess && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Último acceso: {formatDistanceToNow(new Date(course.lastAccess), { addSuffix: true, locale: es })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted ? 'bg-brand-primary' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium min-w-[36px] text-right ${
                      isCompleted
                        ? 'text-brand-primary-text'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {course.totalLessons > 0
                      ? `${course.progress}/${course.totalLessons}`
                      : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}