'use client';

// ============================================================
// Cursos UTP — Página pública (sin auth, sin dashboard)
// Ruta: /cursos/utp
// Muestra los mismos cursos que /dashboard/cursos/utp pero público
// ============================================================

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import {
  Video,
  FileText,
  ShoppingCart,
  ListChecks,
  Search,
  Loader2,
  ArrowLeft,
  Zap,
  BookOpen,
} from 'lucide-react';
import { DASHBOARD_COURSES } from '@/lib/data';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import type { SanityCourse } from '@/lib/sanity.client';

// ----------------------------------------------------------------
// Color helpers
// ----------------------------------------------------------------

const COLOR_HEX_MAP: Record<string, string> = {
  'bg-brand-primary-hover': '#059669',
  'bg-emerald-600': '#059669',
  'bg-blue-600': '#2563EB',
  'bg-orange-500': '#F97316',
  'bg-purple-600': '#9333EA',
  'bg-teal-600': '#0D9488',
  'bg-red-600': '#DC2626',
  'bg-sky-600': '#0284C7',
};

function extractHex(twClass: string): string {
  return COLOR_HEX_MAP[twClass] || '#10B981';
}

// ----------------------------------------------------------------
// Merge DASHBOARD_COURSES with Sanity data (prices from CMS)
// ----------------------------------------------------------------

// Slug mapping: DASHBOARD_COURSES slug → Sanity slug
const SANITY_SLUG_MAP: Record<string, string> = {
  'estatica': 'mecanica-estatica',
  'calculo-vectorial': 'calculo-vectorial',
  'fisica-1': 'fisica-1',
  'fisica-2': 'fisica-2',
};

interface MergedCourse {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly formula: string;
  readonly color: string;
  readonly price: number;
  readonly priceUSD: number;
  readonly slug: string;
  readonly existsInSanity: boolean;
}

function mergeCourses(sanityCourses: SanityCourse[] | null): MergedCourse[] {
  const sanitySlugs = new Set((sanityCourses || []).map((s) => s.slug));
  return DASHBOARD_COURSES.map((dc) => {
    const sanity = sanityCourses?.find((s) => s.slug === dc.id);
    const sanitySlug = SANITY_SLUG_MAP[dc.id] || dc.id;
    const exists = sanitySlugs.has(sanitySlug) || !!sanity;
    return {
      id: dc.id,
      title: dc.title,
      desc: dc.desc,
      formula: dc.formula,
      color: dc.color,
      price: sanity?.pricePEN ?? dc.price,
      priceUSD: sanity?.priceUSD ?? dc.priceUSD,
      slug: sanitySlug,
      existsInSanity: exists,
    };
  });
}

// ----------------------------------------------------------------
// Payment Buttons
// ----------------------------------------------------------------

function PaymentButtons({
  course,
  userId,
}: {
  readonly course: MergedCourse;
  readonly userId?: string;
}) {
  const loadingRef = useRef<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleMercadoPago = async () => {
    const key = `${course.id}-mp`;
    if (loadingRef.current[key]) return;
    loadingRef.current[key] = true;
    setError(null);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: course.id, titulo: course.title, precio: course.price, userId: userId || undefined }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Error al iniciar el pago.'); return; }
      if (d.url) window.location.href = d.url;
      else setError('No se recibió la URL de pago.');
    } catch { setError('Error de conexión.'); } finally { loadingRef.current[key] = false; }
  };

  const handlePayPal = async () => {
    const key = `${course.id}-pp`;
    if (loadingRef.current[key]) return;
    loadingRef.current[key] = true;
    setError(null);
    try {
      const r = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: course.id, titulo: course.title, precioUSD: course.priceUSD, userId: userId || undefined }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Error con PayPal.'); return; }
      if (d.url) window.location.href = d.url;
      else setError('No se recibió la URL de PayPal.');
    } catch { setError('Error de conexión.'); } finally { loadingRef.current[key] = false; }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 w-full">
        <button onClick={(e) => { e.stopPropagation(); handleMercadoPago(); }} disabled={!!loadingRef.current[`${course.id}-mp`]}
          className="h-9 text-[11px] font-bold tracking-wide text-white gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-brand-primary-hover hover:bg-brand-primary">
          {loadingRef.current[`${course.id}-mp`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate">{loadingRef.current[`${course.id}-mp`] ? 'Procesando...' : `PEN ${formatoSoles(course.price)}`}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); handlePayPal(); }} disabled={!!loadingRef.current[`${course.id}-pp`]}
          className="h-9 text-[11px] font-bold tracking-wide gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087]">
          {loadingRef.current[`${course.id}-pp`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <img src="/images/paypal-logo.png" alt="PP" className="h-3.5 w-3.5 object-contain shrink-0" />}
          <span className="truncate">{loadingRef.current[`${course.id}-pp`] ? 'Procesando...' : `USD ${formatoUSD(course.priceUSD)}`}</span>
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500 text-center leading-tight">{error}</p>}
    </div>
  );
}

// ----------------------------------------------------------------
// Course Card
// ----------------------------------------------------------------

function CourseCard({ course, isPurchased, index }: { readonly course: MergedCourse; readonly isPurchased: boolean; readonly index: number }) {
  const hex = extractHex(course.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => {
        if (course.existsInSanity) window.location.href = `/cursos/${course.slug}/temario`;
      }}
      className={`flex flex-col rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-[var(--surface-border)] hover:shadow-xl transition-shadow premium-card-shimmer card-glow ${course.existsInSanity ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`${course.color} px-4 py-5 flex flex-col gap-2 min-h-[120px] relative`} style={{ backgroundColor: hex }}>
        {isPurchased && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">✓ Activo</span>
          </div>
        )}
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
            <Link href={`/cursos/${course.slug}/temario`}>
              <Button className="w-full h-11 text-xs font-bold gap-2 rounded-lg text-white" style={{ backgroundColor: hex }}>
                <BookOpen className="h-4 w-4" /> ACCEDER AL CURSO
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
            <PaymentButtons course={course} userId={undefined} />
            <Link href={`/cursos/${course.slug}/temario`}>
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

// ----------------------------------------------------------------
// Main Content
// ----------------------------------------------------------------

function CursosUTPContent({ sanityCourses }: { readonly sanityCourses: SanityCourse[] | null }) {
  const [busqueda, setBusqueda] = useState('');
  const { purchasedCourseIds } = useAuth();

  const courses = mergeCourses(sanityCourses);
  const cursosFiltrados = courses.filter(
    (c) => c.title.toLowerCase().includes(busqueda.toLowerCase()) || c.desc.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Link href="/cursos" className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-heading-secondary hover:bg-slate-100 dark:hover:bg-[var(--surface-3)] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-white leading-tight flex items-center gap-2 flex-wrap">
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
      <motion.p
        className="text-sm text-brand-body dark:text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Cursos alineados con el pensum académico de la Universidad Tecnológica del Perú. Contenido 100% actualizado.
      </motion.p>

      {/* Search */}
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

      {/* Grid */}
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
    </div>
  );
}

// ----------------------------------------------------------------
// Exported Page (with layout)
// ----------------------------------------------------------------

export function CursosUTPPageClient({ sanityCourses }: { readonly sanityCourses: SanityCourse[] | null }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[var(--surface-0)]">
      <LandingHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <CursosUTPContent sanityCourses={sanityCourses} />
        </div>
      </main>
      <Footer />
    </div>
  );
}


