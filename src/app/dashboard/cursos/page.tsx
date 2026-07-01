'use client';

// ============================================================
// Dashboard – Mis Cursos (vista estudiante)
// Usa el layout compartido: sidebar viene de dashboard/layout.tsx
// Botones duales: Mercado Pago (PEN) + PayPal (USD)
// Cursos comprados se muestran desbloqueados.
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
  BookOpen,
} from 'lucide-react';
import { DASHBOARD_COURSES } from '@/lib/data';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect, useCallback, useRef } from 'react';

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
      <div className="flex items-center gap-3 rounded-xl border border-brand-primary/30 dark:border-brand-primary/40 bg-brand-primary-bg-light px-5 py-4">
        <CheckCircle2 className="h-6 w-6 text-brand-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand-primary-text dark:text-brand-primary-light-text">
            ¡Pago exitoso via {gatewayLabel}!
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
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Pago no completado
          </p>
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
// Botones duales de pago (MP + PayPal)
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
        body: JSON.stringify({
          cursoId: course.id,
          titulo: course.title,
          precio: course.price,
          userId: userId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar el pago.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No se recibió la URL de pago. Intenta nuevamente.');
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      loadingRef.current[key] = false;
    }
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
        body: JSON.stringify({
          cursoId: course.id,
          titulo: course.title,
          precioUSD: course.priceUSD,
          userId: userId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar el pago con PayPal.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No se recibió la URL de PayPal. Intenta nuevamente.');
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      loadingRef.current[key] = false;
    }
  }, [course.id, course.title, course.priceUSD, userId]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 w-full">
        {/* Botón Mercado Pago */}
        <button
          onClick={(e) => { e.stopPropagation(); handleMercadoPago(); }}
          disabled={!!loadingRef.current[`${course.id}-mp`]}
          className="h-9 text-[11px] font-bold tracking-wide text-white gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-brand-primary-hover hover:bg-brand-primary"
        >
          {loadingRef.current[`${course.id}-mp`] ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">
            {loadingRef.current[`${course.id}-mp`] ? 'Procesando...' : `PEN ${formatoSoles(course.price)}`}
          </span>
        </button>

        {/* Botón PayPal */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePayPal(); }}
          disabled={!!loadingRef.current[`${course.id}-pp`]}
          className="h-9 text-[11px] font-bold tracking-wide gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087]"
        >
          {loadingRef.current[`${course.id}-pp`] ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <img src="/images/paypal-logo.png" alt="PP" className="h-3.5 w-3.5 object-contain shrink-0" />
          )}
          <span className="truncate">
            {loadingRef.current[`${course.id}-pp`] ? 'Procesando...' : `USD ${formatoUSD(course.priceUSD)}`}
          </span>
        </button>
      </div>

      {error && (
        <p className="text-[10px] text-red-500 text-center leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Course Card
// ---------------------------------------------------------------------------

function CourseCard({
  course,
  isPurchased,
}: {
  readonly course: (typeof DASHBOARD_COURSES)[number] & { sanitySlug?: string; existsInSanity?: boolean };
  readonly isPurchased: boolean;
}) {
  const hex = extractHex(course.color);
  const { user } = useAuth();
  const temarioSlug = (course as any).sanitySlug || course.id;
  const exists = (course as any).existsInSanity !== false;

  const handleCardClick = () => {
    if (exists) {
      window.location.href = `/cursos/${temarioSlug}/temario`;
    }
  };

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-[var(--surface-border)] hover:shadow-lg transition-shadow premium-card-shimmer card-glow ${exists ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleCardClick}
    >
      {/* --- Colored header --- */}
      <div className={`${course.color} px-4 py-5 flex flex-col gap-2 min-h-[120px] relative`}>
        {isPurchased && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="h-5 w-5 text-white/90" />
          </div>
        )}
        <span className="text-2xl font-light text-white/90 leading-none">
          {course.formula}
        </span>
        <h3 className="text-sm font-bold text-white leading-snug">
          {course.title}
        </h3>
        <p className="text-[11px] text-white/70 leading-snug mt-auto">
          {course.desc}
        </p>
      </div>

      {/* --- Body --- */}
      <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-3 flex flex-col gap-2 border-b border-slate-100 dark:border-[var(--surface-border)] flex-1">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <Video className="h-3.5 w-3.5 shrink-0" />
          <span>Clases grabadas</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span>Material en PDF</span>
        </div>
      </div>

      {/* --- Footer --- */}
      <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-4 flex flex-col gap-3 mt-auto">
        {isPurchased ? (
          <>
            {/* CURSO COMPRADO — Acceder directamente */}
            <Link href={`/cursos/${course.id}/temario`}>
              <Button
                className="w-full h-11 text-xs font-bold gap-2 rounded-lg text-white"
                style={{ backgroundColor: hex }}
              >
                <PlayCircle className="h-4 w-4" />
                ACCEDER AL CURSO
              </Button>
            </Link>
            <p className="text-[10px] text-center text-brand-primary-text font-medium">
              ✓ Curso activo — Acceso de por vida
            </p>
          </>
        ) : (
          <>
            {/* CURSO BLOQUEADO — Mostrar precios y botones de pago */}
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold text-orange-500">
                {formatoSoles(course.price)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {formatoUSD(course.priceUSD)}
              </span>
            </div>

            <PaymentButtons course={course} colorHex={hex} userId={user?.uid} />

            <Link href={`/cursos/${course.id}/temario`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs font-bold tracking-wide gap-1.5 rounded-lg"
                style={{ borderColor: hex, color: hex }}
              >
                <ListChecks className="h-3.5 w-3.5" />
                TEMARIO
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function DashboardCursosContent() {
  const [busqueda, setBusqueda] = useState('');
  const [sanityPrices, setSanityPrices] = useState<Record<string, { price: number; priceUSD: number; exists: boolean }>>({});
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('status') || '';
  const paymentGateway = searchParams.get('gateway') || '';
  const { purchasedCourseIds, refreshPurchases, user } = useAuth();

  // Map DASHBOARD_COURSES slugs to Sanity slugs (for courses with different names)
  const SANITY_SLUG_MAP: Record<string, string> = {
    'estatica': 'mecanica-estatica',
    'calculo-vectorial': 'calculo-vectorial',
    'fisica-1': 'fisica-1',
    'fisica-2': 'fisica-2',
  };

  // Fetch Sanity prices on mount
  useEffect(() => {
    fetch('/api/sanity-courses')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, { price: number; priceUSD: number; exists: boolean }> = {};
          for (const c of data) {
            if (c.slug && c.pricePEN) map[c.slug] = { price: c.pricePEN, priceUSD: c.priceUSD || 0, exists: true };
          }
          setSanityPrices(map);
        }
      })
      .catch(() => {});
  }, []);

  // Merge Sanity prices into DASHBOARD_COURSES and check existence
  const mergedCourses = DASHBOARD_COURSES.map((dc) => {
    const sanitySlug = SANITY_SLUG_MAP[dc.id] || dc.id;
    const sp = sanityPrices[sanitySlug];
    return {
      ...dc,
      sanitySlug,
      existsInSanity: !!sp,
      price: sp?.price ?? dc.price,
      priceUSD: sp?.priceUSD ?? dc.priceUSD,
    };
  });

  // Only show courses that exist in Sanity (or have prices from default)
  const cursosFiltrados = mergedCourses.filter(
    (c) =>
      (c.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.desc.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Limpiar el ?status= de la URL y refrescar compras
  useEffect(() => {
    if (paymentStatus === 'success') {
      // Refrescar las compras para mostrar el curso como activo
      refreshPurchases();
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard/cursos');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, refreshPurchases]);

  return (
    <>
      {/* Header row */}
	      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
	        <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100 leading-tight">
	          <span className="block sm:inline">
	            Mis Cursos
	          </span>
	          <span className="inline-flex sm:inline-flex items-center gap-2 ml-2">
	            <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-brand-primary text-white text-sm font-bold">
	              {purchasedCourseIds.length} activos
	            </span>
	          </span>
	        </h1>

	        <div className="hidden sm:flex items-center">
	          <Link href="/cursos" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-hover transition-colors">
	            <BookOpen className="h-4 w-4" /> Catálogo
	          </Link>
	        </div>
	      </div>

	      {/* Subtitle */}
	      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
	        <Lock className="h-4 w-4 shrink-0" />
	        <span>Tus cursos adquiridos. Accede a las clases, materiales y certificados.</span>
	      </div>

      {/* Banner de estado de pago */}
      {paymentStatus && (
        <PaymentStatusBanner status={paymentStatus} gateway={paymentGateway} />
      )}

      {/* Barra de búsqueda */}
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
          {cursosFiltrados.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isPurchased={purchasedCourseIds.includes(course.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function DashboardCursosPage() {
  return (
    <Suspense>
      <DashboardCursosContent />
    </Suspense>
  );
}