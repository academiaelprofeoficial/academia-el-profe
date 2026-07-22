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
  Users,
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
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { AnimatedSection } from '@/components/AnimatedSection';
import { PurchaseOverlay } from '@/components/course/PurchaseOverlay';
import { CURSOS_LANDING, COLOR_MAP, CURSOS_MOCK } from '@/lib/data';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { cn, sanitizeHex } from '@/lib/utils';
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
  const { user, purchasedCourseIds, isGoogleUser } = useAuth();
  const [cursoCompra, setCursoCompra] = useState<Course | null>(null);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // CMS data is authoritative. Mock only provides cosmetic display hints (colorKey, formulaIcon).
  const displayCourses = useMemo(() => {
    if (!sanityCourses || sanityCourses.length === 0) return [];
    return sanityCourses
      .map((sc) => {
      const mock = CURSOS_LANDING.find((m) => m.id === sc.slug);
      return {
        id: sc.slug,
        title: sc.title,
        description: plainText(sc.description) || '',
        modules: sc.topics?.length || 0,
        price: sc.pricePEN || 0,
        priceUSD: sc.priceUSD || 0,
        cardColor: sc.cardColor || '#10B981',
        colorKey: mock?.colorKey || 'emerald',
        formulaIcon: mock?.formulaIcon || 'BookOpen',
        formula: mock?.formula || '',
        coverImage: getImageUrl(sc.coverImage, 400, 250) || '',
        studentCount: sc.studentCount || 0,
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
          userEmail: user?.email || undefined,
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
          userEmail: user?.email || undefined,
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
              // Use cardColor hex from Sanity for all styling
              const hex = sanitizeHex(curso.cardColor);
              const darken = (h: string, amt: number) => {
                const num = parseInt(h.replace('#',''), 16);
                const r = Math.max(0, (num >> 16) - amt);
                const g = Math.max(0, ((num >> 8) & 0xff) - amt);
                const b = Math.max(0, (num & 0xff) - amt);
                return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
              };
              const bgColor = hex;
              const hoverBg = darken(hex, 30);
              const textColor = darken(hex, 40);
              const colors = COLOR_MAP[curso.colorKey] || COLOR_MAP.emerald;
              const FormulaIcon = FORMULA_ICONS[curso.formulaIcon] || BookOpen;
              const isLoadingMP = !!loadingMap[`${curso.id}-mp`];
              const isLoadingPP = !!loadingMap[`${curso.id}-pp`];
              const isPurchased = purchasedCourseIds.includes(curso.id);

              return (
                <AnimatedSection key={curso.id} delay={idx * 0.08} direction="up" className="h-full">
                <motion.div
                  id={`curso-${curso.id}`}
                  className="flex flex-col h-full rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-[var(--surface-border)] hover:shadow-xl transition-shadow premium-card-shimmer card-glow cursor-pointer"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => handleVerTemario(curso)}
                >
                  {/* HEADER: colored background with formula + title + description */}
                  <div className="px-4 py-5 flex flex-col gap-2 min-h-[120px] relative" style={{ backgroundColor: bgColor }}>
                    <span className="absolute top-2 right-3 text-[10px] font-black tracking-[0.25em] text-white/20 select-none pointer-events-none uppercase">Premium</span>
                    {isPurchased && (
                      <span className="absolute top-2 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[9px] font-bold text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        Comprado
                      </span>
                    )}
                    <span className="text-2xl font-light text-white/90 leading-none">
                      {curso.formula || <FormulaIcon className="h-7 w-7 text-white/90" />}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{curso.title}</h3>
                    <p className="text-[11px] text-white/70 leading-snug mt-auto">{curso.description || 'Curso completo con clases grabadas y material descargable.'}</p>
                  </div>

                  {/* BODY: features list — flex-1 para igualar alturas */}
                  <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-3 flex flex-col gap-2 border-b border-slate-100 dark:border-[var(--surface-border)] flex-1">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: textColor }} />
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
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                      <Users className="h-3.5 w-3.5 shrink-0" style={{ color: textColor }} />
                      <span>{curso.studentCount > 0 ? `${curso.studentCount} alumnos inscritos` : 'Primeros en inscribirse'}</span>
                    </div>
                  </div>

                  {/* FOOTER: price + payment buttons + temario — mt-auto para alinear abajo */}
                  <div className="bg-white dark:bg-[var(--surface-2)] px-4 py-4 flex flex-col gap-3 mt-auto">
                    {isPurchased ? (
                      <>
                        {/* CURSO COMPRADO — Acceder directamente */}
                        <Link
                          href={`/cursos/${curso.id}/temario`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-10 text-xs font-bold tracking-wide gap-2 rounded-lg flex items-center justify-center transition-all text-white"
                          style={{ backgroundColor: bgColor }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = hoverBg; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = bgColor; }}
                        >
                          <PlayCircle className="h-4 w-4" />
                          ACCEDER AL CURSO
                        </Link>
                        <p className="text-[10px] text-center text-brand-primary font-medium">
                          ✓ Comprado — Acceso de por vida
                        </p>
                      </>
                    ) : user ? (
                      isGoogleUser ? (
                      /* ---- GOOGLE AUTHENTICATED: botones de pago ---- */
                      <>
                        <div className="flex items-baseline gap-3">
                          <span className="text-xl font-bold text-orange-500">{formatoSoles(curso.price)}</span>
                          <span className="text-xs text-slate-400 font-medium">{formatoUSD(curso.priceUSD)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 w-full">
                          <button
                            disabled={isLoadingMP || isLoadingPP}
                            onClick={(e) => { e.stopPropagation(); handleMercadoPagoDirect(curso); }}
                            className="h-9 text-[11px] font-bold tracking-wide text-white gap-1 rounded-lg flex items-center justify-center transition-all disabled:opacity-70"
                            style={{ backgroundColor: bgColor }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = hoverBg; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = bgColor; }}
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
                          style={{ borderColor: bgColor, color: textColor }}
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                          TEMARIO
                        </button>
                      </>
                    ) : (
                      /* ---- LOGUEADO PERO NO CON GOOGLE: exigir Google ---- */
                      <>
                        <div className="flex items-baseline gap-3">
                          <span className="text-xl font-bold text-orange-500">{formatoSoles(curso.price)}</span>
                          <span className="text-xs text-slate-400 font-medium">{formatoUSD(curso.priceUSD)}</span>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 px-3 py-2.5 text-center">
                          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">
                            Debes iniciar sesión con Google para comprar
                          </p>
                          <p className="text-[10px] text-amber-600/80 dark:text-amber-500/60">
                            Tu cuenta actual no está vinculada con Google
                          </p>
                        </div>

                        <Link
                          href="/iniciar-sesion"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-10 text-xs font-bold tracking-wide text-white gap-2 rounded-lg flex items-center justify-center transition-all"
                          style={{ backgroundColor: bgColor }}
                        >
                          <LogIn className="h-4 w-4" />
                          INICIAR SESIÓN CON GOOGLE
                        </Link>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleVerTemario(curso); }}
                          className="w-full h-9 text-xs font-bold tracking-wide gap-1.5 rounded-lg flex items-center justify-center border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          style={{ borderColor: bgColor, color: textColor }}
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                          VER TEMARIO
                        </button>
                      </>
                    )
                    ) : (
                      /* ---- INVITADO: "Iniciar sesión para comprar" ---- */
                      <>
                        <div className="flex items-baseline gap-3">
                          <span className="text-xl font-bold text-orange-500">{formatoSoles(curso.price)}</span>
                          <span className="text-xs text-slate-400 font-medium">{formatoUSD(curso.priceUSD)}</span>
                        </div>

                        <Link
                          href="/iniciar-sesion"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-10 text-xs font-bold tracking-wide text-white gap-2 rounded-lg flex items-center justify-center transition-all"
                          style={{ backgroundColor: bgColor }}
                        >
                          <LogIn className="h-4 w-4" />
                          INICIAR SESIÓN PARA COMPRAR
                        </Link>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleVerTemario(curso); }}
                          className="w-full h-9 text-xs font-bold tracking-wide gap-1.5 rounded-lg flex items-center justify-center border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          style={{ borderColor: bgColor, color: textColor }}
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                          VER TEMARIO
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
                </AnimatedSection>
              );
            })}

            {/* ============================================================ */}
            {/* TARJETA UTP — imagen personalizada */}
            <Link href="/cursos/utp" id="utp-enfoque" className="md:col-span-2 lg:col-span-2 block group">
              <img
                src="/images/boton-utp.webp"
                alt="Cursos UTP"
                className="w-full h-auto object-contain rounded-2xl transition-transform duration-200 group-hover:scale-[1.02] group-hover:shadow-xl"
                loading="lazy"
              />
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