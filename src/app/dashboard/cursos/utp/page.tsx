'use client';

// ============================================================
// Dashboard – Cursos UTP (vista estudiante)
// Ruta: /dashboard/cursos/utp
// Misma estructura que /dashboard/cursos pero filtrado para UTP
// ============================================================

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Lock,
  Video,
  FileText,
  ShoppingCart,
  ListChecks,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { DASHBOARD_COURSES } from '@/lib/data';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLOR_HEX_MAP: Record<string, string> = {
  'bg-brand-primary-hover': '#059669',
  'bg-blue-600': '#2563EB',
  'bg-orange-500': '#F97316',
  'bg-purple-600': '#9333EA',
  'bg-teal-600': '#0D9488',
  'bg-red-600': '#DC2626',
  'bg-sky-600': '#0284C7',
};

function extractHex(twClass: string): string {
  return COLOR_HEX_MAP[twClass] || '#000000';
}

// ---------------------------------------------------------------------------
// Banner de estado de pago
// ---------------------------------------------------------------------------

function PaymentStatusBanner({ status, gateway }: { readonly status: string; readonly gateway?: string }) {
  const gatewayLabel = gateway === 'paypal' ? 'PayPal' : 'Mercado Pago';

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-xl border border-brand-primary/30 dark:border-brand-primary/40 bg-brand-primary-bg-light px-5 py-4"
      >
        <CheckCircle2 className="h-6 w-6 text-brand-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand-primary-text dark:text-brand-primary-light-text">
            ¡Pago exitoso via {gatewayLabel}!
          </p>
          <p className="text-xs text-brand-primary-text mt-0.5">
            Tu curso ha sido activado. Ya puedes acceder a las clases.
          </p>
        </div>
      </motion.div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-5 py-4">
        <Clock className="h-6 w-6 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pago pendiente</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Tu pago está siendo procesado. Recibirás una confirmación pronto.
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
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">Pago no completado</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            Hubo un problema con tu pago. Intenta nuevamente o usa otro método.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Botones duales de pago
// ---------------------------------------------------------------------------

function PaymentButtons({
  course,
  colorHex,
  userId,
}: {
  readonly course: (typeof DASHBOARD_COURSES)[number];
  readonly colorHex: string;
  readonly userId?: string;
}) {
  const loadingRef = useRef<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleMercadoPago = useCallback(async () => {
    const key = `${course.id}-mp`;
    if (loadingRef.current[key]) return;
    loadingRef.current[key] = true;
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: course.id, titulo: course.title, precio: course.price, userId: userId || undefined }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Error al iniciar el pago.'); return; }
      if (data.url) { window.location.href = data.url; } else { setError('No se recibió la URL de pago.'); }
    } catch { setError('Error de conexión.'); } finally { loadingRef.current[key] = false; }
  }, [course.id, course.title, course.price, userId]);

  const handlePayPal = useCallback(async () => {
    const key = `${course.id}-pp`;
    if (loadingRef.current[key]) return;
    loadingRef.current[key] = true;
    setError(null);

    try {
      const response = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: course.id, titulo: course.title, precioUSD: course.priceUSD, userId: userId || undefined }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Error con PayPal.'); return; }
      if (data.url) { window.location.href = data.url; } else { setError('No se recibió la URL de PayPal.'); }
    } catch { setError('Error de conexión.'); } finally { loadingRef.current[key] = false; }
  }, [course.id, course.title, course.priceUSD, userId]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 w-full">
        <button onClick={handleMercadoPago} disabled={!!loadingRef.current[`${course.id}-mp`]}
          className="h-9 text-[11px] font-bold tracking-wide text-white gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-brand-primary-hover hover:bg-brand-primary">
          {loadingRef.current[`${course.id}-mp`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate">{loadingRef.current[`${course.id}-mp`] ? 'Procesando...' : `PEN ${formatoSoles(course.price)}`}</span>
        </button>
        <button onClick={handlePayPal} disabled={!!loadingRef.current[`${course.id}-pp`]}
          className="h-9 text-[11px] font-bold tracking-wide gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087]">
          {loadingRef.current[`${course.id}-pp`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <img src="/images/paypal-logo.png" alt="PP" className="h-3.5 w-3.5 object-contain shrink-0" />}
          <span className="truncate">{loadingRef.current[`${course.id}-pp`] ? 'Procesando...' : `USD ${formatoUSD(course.priceUSD)}`}</span>
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500 text-center leading-tight">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Course Card — Enhanced with animations
// ---------------------------------------------------------------------------

function CourseCard({ course, isPurchased, index }: { readonly course: (typeof DASHBOARD_COURSES)[number]; readonly isPurchased: boolean; readonly index: number }) {
  const hex = extractHex(course.color);
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex flex-col rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-[var(--surface-border)] hover:shadow-xl transition-shadow premium-card-shimmer card-glow"
    >
      <div className={`${course.color} px-4 py-5 flex flex-col gap-2 min-h-[120px] relative`}>
        {isPurchased && <div className="absolute top-2 right-2"><CheckCircle2 className="h-5 w-5 text-white/90" /></div>}
        <span className="text-2xl font-light text-white/90 leading-none">{course.formula}</span>
        <h3 className="text-sm font-bold text-white leading-snug">{course.title}</h3>
        <p className="text-[11px] text-white/70 leading-snug mt-auto">{course.desc}</p>
      </div>
      <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-3 flex flex-col gap-2 border-b border-slate-100 dark:border-[var(--surface-border)]">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <Video className="h-3.5 w-3.5 shrink-0" /><span>Clases grabadas</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <FileText className="h-3.5 w-3.5 shrink-0" /><span>Material en PDF</span>
        </div>
      </div>
      <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-4 flex flex-col gap-3">
        {isPurchased ? (
          <>
            <Link href={`/cursos/${course.id}/temario`}>
              <Button className="w-full h-11 text-xs font-bold gap-2 rounded-lg text-white" style={{ backgroundColor: hex }}>
                <PlayCircle className="h-4 w-4" /> ACCEDER AL CURSO
              </Button>
            </Link>
            <p className="text-[10px] text-center text-brand-primary-text font-medium">✓ Curso activo — Acceso de por vida</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold text-orange-500">{formatoSoles(course.price)}</span>
              <span className="text-xs text-slate-400 font-medium">{formatoUSD(course.priceUSD)}</span>
            </div>
            <PaymentButtons course={course} colorHex={hex} userId={user?.uid} />
            <Link href={`/cursos/${course.id}/temario`}>
              <Button variant="outline" size="sm" className="w-full h-9 text-xs font-bold tracking-wide gap-1.5 rounded-lg" style={{ borderColor: hex, color: hex }}>
                <ListChecks className="h-3.5 w-3.5" /> TEMARIO
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function DashboardUTPContent() {
  const [busqueda, setBusqueda] = useState('');
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('status') || '';
  const paymentGateway = searchParams.get('gateway') || '';
  const { purchasedCourseIds, refreshPurchases, user } = useAuth();

  const cursosFiltrados = DASHBOARD_COURSES.filter(
    (c) => c.title.toLowerCase().includes(busqueda.toLowerCase()) || c.desc.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    if (paymentStatus === 'success') {
      refreshPurchases();
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard/cursos/utp');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, refreshPurchases]);

  return (
    <>
      {/* Header row */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cursos" className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-heading-secondary hover:bg-slate-100 dark:hover:bg-[var(--surface-3)] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100 leading-tight flex items-center gap-2 flex-wrap">
              <span>Cursos exclusivos para estudiantes de la</span>
              <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-red-600 text-white text-sm font-bold utp-pulse">UTP</span>
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center">
          <span className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-red-600 text-white text-lg font-bold shadow-lg shadow-red-600/20">
            <Zap className="h-4 w-4" /> UTP
          </span>
        </div>
      </motion.div>

      {/* Subtitle */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Lock className="h-4 w-4 shrink-0" />
        <span>Accede a todos estos cursos con tu membresía activa.</span>
      </div>

      {/* Banner de estado de pago */}
      {paymentStatus && <PaymentStatusBanner status={paymentStatus} gateway={paymentGateway} />}

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cursos UTP..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-[var(--surface-border)] bg-white dark:bg-[var(--surface-2)] text-sm text-brand-heading dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors"
        />
      </div>

      {/* Course grid */}
      {cursosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No se encontraron cursos para &quot;{busqueda}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {cursosFiltrados.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              isPurchased={purchasedCourseIds.includes(course.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function DashboardUTPPage() {
  return (
    <Suspense>
      <DashboardUTPContent />
    </Suspense>
  );
}