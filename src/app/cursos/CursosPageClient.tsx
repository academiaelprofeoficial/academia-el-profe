'use client';

// ============================================================
// Cursos Page Client — Nuevo Diseño
// Grid PC (3 cols) + Lista Móvil (1 col horizontal)
// Tarjetas con fórmula, módulos, precios PEN+USD, botones duales.
// Tarjeta UTP enfocada (2 cols en PC).
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  FileText,
  Clock,
  Shield,
  PlayCircle,
  ShoppingCart,
  ListChecks,
  FunctionSquare,
  Sigma,
  TrendingUp,
  MoveUpRight,
  Atom,
  Magnet,
  Triangle,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Headphones,
  Lock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { AnimatedSection } from '@/components/AnimatedSection';
import { PurchaseOverlay } from '@/components/course/PurchaseOverlay';
import { CURSOS_LANDING, COLOR_MAP, CURSOS_MOCK } from '@/lib/data';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { cn } from '@/lib/utils';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import type { CourseLanding, Course } from '@/types';
import { useAuth } from '@/lib/auth-context';
import type { SanityCourse } from '@/lib/sanity.client';
import { plainText, getImageUrl } from '@/lib/sanity.client';

/** Mapa de íconos de fórmula */
const FORMULA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FunctionSquare,
  Sigma,
  TrendingUp,
  MoveUpRight,
  Atom,
  Magnet,
  Triangle,
};

export function CursosPageClient({ sanityCourses }: { sanityCourses: SanityCourse[] | null }) {
  const { user } = useAuth();
  const [cursoCompra, setCursoCompra] = useState<Course | null>(null);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // CMS data is authoritative. Mock only provides cosmetic display hints (colorKey, formulaIcon).
  const displayCourses = useMemo(() => {
    if (!sanityCourses || sanityCourses.length === 0) return [];
    return sanityCourses.map((sc) => {
      const mock = CURSOS_LANDING.find((m) => m.id === sc.slug);
      return {
        id: sc.slug,
        title: sc.title,
        description: plainText(sc.description) || '',
        modules: sc.topics?.length || 0,
        price: sc.pricePEN || 0,
        priceUSD: sc.priceUSD || 0,
        colorKey: mock?.colorKey || 'emerald',
        formulaIcon: mock?.formulaIcon || 'BookOpen',
        formula: mock?.formula || '',
        coverImage: getImageUrl(sc.coverImage, 400, 250) || '',
        _sanityId: sc._id,
      };
    });
  }, [sanityCourses]);

  /* Scroll Spy */
  const sectionIds = useMemo(
    () => ['titulo-cursos', 'utp-enfoque', ...displayCourses.map((c) => `curso-${c.id}`)] as const,
    [displayCourses]
  );
  const { activeId } = useScrollSpy(sectionIds);

  const handleVerTemario = useCallback((cursoLanding: { id: string }) => {
    window.location.href = `/cursos/${cursoLanding.id}/temario`;
  }, []);

  const handleComprar = useCallback((cursoId: string) => {
    const cursoMock = CURSOS_MOCK.find((c) => c.slug === cursoId) || null;
    setCursoCompra(cursoMock);
    setCompraAbierta(true);
  }, []);

  // Compra directa PayPal desde la tarjeta (sin abrir modal)
  const handlePayPalDirect = useCallback(async (cursoLanding: { id: string; title: string; priceUSD: number }) => {
    const key = `${cursoLanding.id}-pp`;
    if (loadingMap[key]) return;
    setLoadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: cursoLanding.id,
          titulo: cursoLanding.title,
          precioUSD: cursoLanding.priceUSD,
          userId: user?.uid || undefined,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  }, [loadingMap]);

  // Compra directa MP desde la tarjeta (sin abrir modal)
  const handleMercadoPagoDirect = useCallback(async (cursoLanding: { id: string; title: string; price: number }) => {
    const key = `${cursoLanding.id}-mp`;
    if (loadingMap[key]) return;
    setLoadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: cursoLanding.id,
          titulo: cursoLanding.title,
          precio: cursoLanding.price,
          userId: user?.uid || undefined,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  }, [loadingMap]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <LandingHeader />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* TÍTULO Y BENEFICIOS */}
        {/* ============================================================ */}
        <div id="titulo-cursos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-8 scroll-mt-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
              <span className="text-brand-heading">Nuestros</span>{' '}
              <span className="text-brand-primary">Cursos</span>
            </h1>
            <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Elige el curso que quieres estudiar y accede de inmediato a todas las
              clases grabadas.
            </p>
          </div>

          {/* Badges de beneficios */}
          <div className="hidden md:flex items-center justify-center gap-6 mb-10">
            {[
              { icono: PlayCircle, texto: 'Clases 100% Grabadas' },
              { icono: FileText, texto: 'Material en PDF' },
              { icono: Clock, texto: 'Acceso de por vida' },
              { icono: Shield, texto: 'Pago seguro y protegido' },
            ].map((b) => {
              const Icono = b.icono;
              return (
                <div key={b.texto} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Icono className="h-4 w-4 text-brand-primary" />
                  <span className="text-sm font-medium">{b.texto}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* GRID DE CURSOS — PC (3 cols) / Móvil (1 col, filas horizontales) */}
        {/* ============================================================ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {/* Grid PC: 3 cols. Móvil: 1 col */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {displayCourses.map((curso, idx) => {
              const colors = COLOR_MAP[curso.colorKey] || COLOR_MAP.emerald;
              const FormulaIcon = FORMULA_ICONS[curso.formulaIcon] || BookOpen;
              const isLoadingMP = !!loadingMap[`${curso.id}-mp`];
              const isLoadingPP = !!loadingMap[`${curso.id}-pp`];

              return (
                <AnimatedSection key={curso.id} delay={idx * 0.08} direction="up">
                <motion.div
                  id={`curso-${curso.id}`}
                  className="flex flex-col rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-[var(--surface-border)] hover:shadow-xl transition-shadow premium-card-shimmer card-glow cursor-pointer"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => handleVerTemario(curso)}
                >
                  {/* HEADER: colored background with formula + title + description */}
                  <div className={`${colors.bg} px-4 py-5 flex flex-col gap-2 min-h-[120px] relative`}>
                    <span className="absolute top-2 right-3 text-[10px] font-black tracking-[0.25em] text-white/20 select-none pointer-events-none uppercase">Premium</span>
                    <span className="text-2xl font-light text-white/90 leading-none">
                      {curso.formula || <FormulaIcon className="h-7 w-7 text-white/90" />}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{curso.title}</h3>
                    <p className="text-[11px] text-white/70 leading-snug mt-auto">{curso.description || 'Curso completo con clases grabadas y material descargable.'}</p>
                  </div>

                  {/* BODY: features list */}
                  <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-3 flex flex-col gap-2 border-b border-slate-100 dark:border-[var(--surface-border)]">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <CheckCircle2 className={cn('h-3.5 w-3.5 shrink-0', colors.text)} />
                      <span>{curso.modules} temas</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span>Material en PDF</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>Acceso permanente</span>
                    </div>
                  </div>

                  {/* FOOTER: price + payment buttons + temario */}
                  <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-4 flex flex-col gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xl font-bold text-orange-500">{formatoSoles(curso.price)}</span>
                      <span className="text-xs text-slate-400 font-medium">{formatoUSD(curso.priceUSD)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        disabled={isLoadingMP || isLoadingPP}
                        onClick={(e) => { e.stopPropagation(); handleMercadoPagoDirect(curso); }}
                        className={cn(
                          'h-9 text-[11px] font-bold tracking-wide text-white gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70',
                          colors.bg,
                          colors.hover
                        )}
                      >
                        {isLoadingMP ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">
                          {isLoadingMP ? 'Procesando...' : `PEN ${formatoSoles(curso.price)}`}
                        </span>
                      </button>
                      <button
                        disabled={isLoadingMP || isLoadingPP}
                        onClick={(e) => { e.stopPropagation(); handlePayPalDirect(curso); }}
                        className="h-9 text-[11px] font-bold tracking-wide gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087]"
                      >
                        {isLoadingPP ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <img src="/images/paypal-logo.png" alt="PP" className="h-3.5 w-3.5 object-contain shrink-0" />
                        )}
                        <span className="truncate">
                          {isLoadingPP ? 'Procesando...' : `USD ${formatoUSD(curso.priceUSD)}`}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleVerTemario(curso); }}
                      className="w-full h-9 text-xs font-bold tracking-wide gap-1.5 rounded-lg flex items-center justify-center border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      style={{
                        borderColor: curso.colorKey === 'emerald' ? '#10B981' : curso.colorKey === 'blue' ? '#3B82F6' : curso.colorKey === 'orange' ? '#F97316' : curso.colorKey === 'purple' ? '#8B5CF6' : curso.colorKey === 'teal' ? '#14B8A6' : curso.colorKey === 'red' ? '#EF4444' : '#0EA5E9',
                        color: curso.colorKey === 'emerald' ? '#059669' : curso.colorKey === 'blue' ? '#2563EB' : curso.colorKey === 'orange' ? '#EA580C' : curso.colorKey === 'purple' ? '#7C3AED' : curso.colorKey === 'teal' ? '#0D9488' : curso.colorKey === 'red' ? '#DC2626' : '#0284C7',
                      }}
                    >
                      <ListChecks className="h-3.5 w-3.5" />
                      TEMARIO
                    </button>
                  </div>
                </motion.div>
                </AnimatedSection>
              );
            })}

            {/* ============================================================ */}
            {/* TARJETA UTP ENFOCADA (2 cols en PC, 1 col en móvil) */}
            {/* ============================================================ */}
            <Link href="/cursos/utp" id="utp-enfoque" className="md:col-span-2 lg:col-span-2 block group">
              <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 p-5 md:p-6 transition-all duration-200 group-hover:border-red-400 dark:group-hover:border-red-700 group-hover:shadow-lg group-hover:shadow-red-500/10 cursor-pointer">
                {/* Diseño PC */}
                <div className="hidden md:flex items-center gap-6">
                  {/* Logo UTP */}
                  <div className="shrink-0">
                    <div className="h-20 w-20 rounded-2xl bg-red-600 flex items-center justify-center">
                      <span className="text-white font-extrabold text-xl">UTP</span>
                    </div>
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-brand-heading mb-1">
                      Enfocado en la Universidad Tecnológica del Perú (UTP)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Todos nuestros cursos están alineados con el pensum académico de
                      la UTP para ayudarte a aprobar tus exámenes y avanzar con éxito.
                    </p>
                  </div>

                  {/* Viñetas */}
                  <div className="shrink-0 space-y-2.5">
                    {[
                      'Contenido 100% actualizado',
                      'Basado en el temario oficial UTP',
                      'Dictado por El Profe, especialistas en UTP',
                      'Miles de estudiantes ya aprobaron',
                    ].map((texto) => (
                      <div key={texto} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {texto}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Flecha indicadora PC */}
                  <div className="shrink-0 ml-2">
                    <MoveUpRight className="h-6 w-6 text-red-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Diseño Móvil */}
                <div className="md:hidden flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-extrabold text-sm">UTP</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-brand-heading leading-tight">
                      Enfocado en la Universidad Tecnológica del Perú (UTP)
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-500 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FOOTER STATS (móvil) */}
        {/* ============================================================ */}
        <div className="md:hidden bg-slate-50 dark:bg-slate-900/50 py-6 space-y-4">
          <div className="flex items-start gap-3 px-4">
            <div className="h-8 w-8 rounded-full bg-brand-primary-bg flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-brand-primary-text" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-heading">
                Más de 500 estudiantes ya están aprendiendo con nosotros
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4">
            <div className="h-8 w-8 rounded-full bg-brand-primary-bg flex items-center justify-center shrink-0">
              <Headphones className="h-4 w-4 text-brand-primary-text" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-heading">
                Soporte directo{' '}
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  Te ayudamos siempre
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4">
            <div className="h-8 w-8 rounded-full bg-brand-primary-bg flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-brand-primary-text" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-heading">
                Compra 100% segura{' '}
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  Tus datos protegidos
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Overlay de Compra */}
      <PurchaseOverlay
        curso={cursoCompra}
        open={compraAbierta}
        onOpenChange={setCompraAbierta}
      />
      <Footer />
    </div>
  );
}