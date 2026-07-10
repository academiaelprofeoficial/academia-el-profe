'use client';

// ============================================================
// Aula Virtual — Versión DESBLOQUEADA (alumno compró el curso)
// Layout 3 columnas PC (1 + 3 + 1) / 1 columna + tabs móvil
// Estructura UTP: PC1, PC2, PC3, Portafolio
// Pixel-perfect fidelidad al mockup del cliente.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ThumbsUp,
  Download,
  Headset,
  Eye,
  ChevronDown,
  ChevronRight,
  Phone,
  Circle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  UTP_EVALUACIONES,
  COMENTARIOS_MOCK,
  CURSOS_LANDING,
} from '@/lib/data';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import type { UTPEvaluacion, ComentarioMock } from '@/lib/data';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const AVATAR_COLORS = [
  'bg-brand-primary',
  'bg-pink-500',
  'bg-blue-500',
] as const;

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name.charAt(0).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AulaVirtualClientProps {
  readonly slug: string;
  readonly id: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AulaVirtualClient({
  slug,
  id,
}: AulaVirtualClientProps) {
  const [activeEvaluacion, setActiveEvaluacion] = useState<string>('pc1');
  const [expandedEval, setExpandedEval] = useState<string>('pc1');
  const [activeTab, setActiveTab] = useState<'clase' | 'lista'>('clase');
  const [comentario, setComentario] = useState('');

  const cursoLanding = CURSOS_LANDING.find((c) => c.id === slug);
  const currentEval = UTP_EVALUACIONES.find((e) => e.id === activeEvaluacion) ?? UTP_EVALUACIONES[0];
  const currentTema = currentEval.temas[0];

  /* Scroll Spy — evaluaciones y zonas principales del aula */
  const aulaSectionIds = useMemo(
    () => ['aula-player', 'aula-material', 'aula-comentarios', ...UTP_EVALUACIONES.map((e) => `aula-eval-${e.id}`)] as const,
    []
  );
  const { activeId } = useScrollSpy(aulaSectionIds);

  /* ---- Anti-piracy ---- */
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, []);

  /* ================================================================ */
  /*  Shared sub-components                                            */
  /* ================================================================ */

  /* ---------- Sidebar: Evaluación Accordion ---------- */
  const evaluacionAccordion = (evaluacion: UTPEvaluacion) => {
    const isExpanded = expandedEval === evaluacion.id;
    const isActive = activeEvaluacion === evaluacion.id;
    const pendingCount = evaluacion.temas.filter((t) => !t.completado).length;

    return (
      <div key={evaluacion.id} className="border-b border-slate-100 last:border-b-0">
        {/* --- Eval header --- */}
        <button
          onClick={() => setExpandedEval(isExpanded ? '' : evaluacion.id)}
          className="w-full flex items-center gap-2.5 px-1 py-3 text-left group"
        >
          <span
            className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white shrink-0 ${evaluacion.bgTw}`}
          >
            {evaluacion.temas.length}
          </span>
          <span className="flex-1 text-sm font-bold text-brand-heading">
            {evaluacion.label}
          </span>
          {!isExpanded && (
            <span className="text-xs text-slate-400">
              [{pendingCount}]
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* --- Temas list (expanded) --- */}
        {isExpanded && (
          <div className="pb-2 space-y-0.5 ml-3 pl-3 border-l-2 border-slate-100">
            {evaluacion.temas.map((tema) => {
              const isTemarioActive = isActive && tema.numero === 1;
              return (
                <button
                  key={tema.numero}
                  onClick={() => {
                    setActiveEvaluacion(evaluacion.id);
                    setActiveTab('clase');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                    isTemarioActive
                      ? 'bg-blue-50 text-brand-heading font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tema.completado ? (
                    <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                  <span className="flex-1 truncate text-[13px]">{tema.titulo}</span>
                  {isTemarioActive && (
                    <Eye className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ---------- Colored eval tabs ---------- */
  const evalTabs = (
    <div className="flex flex-wrap gap-2 mb-5">
      {UTP_EVALUACIONES.map((evaluacion) => (
        <button
          key={evaluacion.id}
          onClick={() => {
            setActiveEvaluacion(evaluacion.id);
            setExpandedEval(evaluacion.id);
            setActiveTab('clase');
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeEvaluacion === evaluacion.id
              ? `${evaluacion.bgTw} text-white shadow-sm`
              : `${evaluacion.bgLightTw} ${evaluacion.textTw} hover:opacity-80`
          }`}
        >
          <span>{evaluacion.label}</span>
        </button>
      ))}
    </div>
  );

  /* ---------- Video Player (unlocked) ---------- */
  const videoPlayer = (
    <div id="aula-player" className="scroll-mt-16">
      <VideoPlayer
        titulo={currentTema?.titulo}
      />
    </div>
  );

  /* ---------- Comments Section ---------- */
  const commentsSection = (
    <div id="aula-comentarios" className="mt-6 lg:mt-8 scroll-mt-16">
      <h3 className="text-base font-bold text-brand-heading mb-4">
        Comentarios (12)
      </h3>

      {/* Input */}
      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
          M
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Textarea
            placeholder="Escribe tu comentario..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="resize-none min-h-[56px] text-sm border-slate-200 focus:border-brand-primary"
          />
          <div className="flex justify-end">
            <button
              className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors ${
                comentario.trim()
                  ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!comentario.trim()}
            >
              Publicar
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {COMENTARIOS_MOCK.map((c: ComentarioMock) => (
          <div key={c.id} className="flex gap-3">
            <div
              className={`w-8 h-8 rounded-full ${avatarColor(c.autor)} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
            >
              {initials(c.autor)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-brand-heading">
                  {c.autor}
                </span>
                <span className="text-xs text-slate-500">{c.tiempo}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {c.texto}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Responder
                </button>
                <div className="flex items-center gap-1 text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{c.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ver más */}
      <button className="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">
        Ver 9 comentarios más &or;
      </button>
    </div>
  );

  /* ---------- PDF Materials Column ---------- */
  const pdfMaterials = (
    <div id="aula-material" className="scroll-mt-16">
      <h3 className="text-sm font-bold text-brand-heading mb-4">
        Material de la clase
      </h3>

      {/* PDF preview card */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {/* PDF preview content - simulating a document preview */}
        <div className="bg-slate-50 p-4 sm:p-5 space-y-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
              PDF
            </span>
          </div>

          <h4 className="text-sm font-bold text-brand-heading leading-tight">
            LÍMITES POR DEFINICIÓN
          </h4>

          <div className="space-y-2.5 text-[11px] text-slate-500 leading-relaxed">
            <div>
              <p className="font-semibold text-brand-heading-secondary text-xs mb-0.5">1. Definición de límite</p>
              <p>Sea f(x) una función definida en un intervalo abierto que contiene a c, excepto quizás en c mismo. Decimos que lim (x&rarr;c) f(x) = L si para todo &epsilon; &gt; 0, existe un &delta; &gt; 0 tal que |f(x) - L| &lt; &epsilon; cuando 0 &lt; |x - c| &lt; &delta;.</p>
            </div>
            <div>
              <p className="font-semibold text-brand-heading-secondary text-xs mb-0.5">2. Límites laterales</p>
              <p>Límite por la derecha: lim (x&rarr;c+) f(x) = L. Límite por la izquierda: lim (x&rarr;c-) f(x) = L.</p>
            </div>
            <div>
              <p className="font-semibold text-brand-heading-secondary text-xs mb-0.5">3. Propiedades de los límites</p>
              <p>Suma, diferencia, producto y cociente de límites...</p>
            </div>
            <div>
              <p className="font-semibold text-brand-heading-secondary text-xs mb-0.5">4. Ejemplos</p>
              <p>Aplicaciones prácticas y ejercicios resueltos...</p>
            </div>
          </div>
        </div>

        {/* PDF footer: file name + download */}
        <div className="p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-heading truncate">
              Limites por definición.pdf
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              PDF &middot; 25 páginas
            </p>
          </div>
          <button className="shrink-0 w-10 h-10 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="pb-20 lg:pb-0">
      {/* ============================================================== */}
      {/*  PC LAYOUT — 3 columnas (1 + 3 + 1)                             */}
      {/* ============================================================== */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-6">
        {/* ---- Columna 1: Sidebar de evaluaciones ---- */}
        <aside className="col-span-1 space-y-5">
          {/* Back link */}
          <Link
            href="/dashboard/cursos"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-heading transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis cursos
          </Link>

          {/* Course badge */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-brand-primary-bg-light text-brand-primary-text text-xs font-semibold px-2.5 py-1.5 rounded-lg">
              <span className="font-mono text-sm">{cursoLanding?.formula ?? 'f(x)'}</span>
              {cursoLanding?.title ?? 'CÁLCULO 2'}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Integrales, técnicas de integración y aplicaciones.
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">Tu progreso</span>
              <span className="text-xs font-medium text-slate-600">65% completado</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all"
                style={{ width: '65%' }}
              />
            </div>
          </div>

          {/* Content menu */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              CONTENIDO DEL CURSO
            </h3>
            <div className="border-t border-slate-100 pt-1">
              {UTP_EVALUACIONES.map((ev) => evaluacionAccordion(ev))}
            </div>
          </div>

          {/* Help box */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-primary-bg-light">
                <Headset className="h-4 w-4 text-brand-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-heading">
                  ¿Necesitas ayuda?
                </p>
                <p className="text-[11px] text-slate-500">
                  Nuestro equipo está listo para apoyarte.
                </p>
              </div>
            </div>
            <button className="w-full h-9 text-xs font-semibold rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white transition-colors flex items-center justify-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Contactar soporte
            </button>
          </div>
        </aside>

        {/* ---- Columna 2: Video + Comentarios ---- */}
        <div className="col-span-3">
          {/* Eval tabs */}
          {evalTabs}

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-1 text-sm">
            <span className="text-slate-500">{currentEval.label} &gt; Tema 1</span>
          </div>

          {/* Title + badge */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-heading">
              {currentTema.titulo}
            </h1>
            <span className="bg-brand-primary-bg text-brand-primary-text text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Clase completada
            </span>
          </div>

          {/* Video player */}
          {videoPlayer}

          {/* Comments */}
          {commentsSection}
        </div>

        {/* ---- Columna 3: Materiales ---- */}
        <aside className="col-span-1">
          {pdfMaterials}
        </aside>
      </div>

      {/* ============================================================== */}
      {/*  MOBILE LAYOUT — 1 columna con tab switcher                      */}
      {/* ============================================================== */}
      <div className="lg:hidden">
        {/* Header compacto */}
        <Link
          href="/dashboard/cursos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-heading transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis cursos
        </Link>

        {/* Course badge */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 bg-brand-primary-bg-light text-brand-primary-text text-xs font-semibold px-2.5 py-1.5 rounded-lg">
            <span className="font-mono text-sm">{cursoLanding?.formula ?? 'f(x)'}</span>
            {cursoLanding?.title ?? 'CÁLCULO 2'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Tu progreso</span>
            <span className="text-xs font-medium text-slate-600">65% completado</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            className={`flex-1 pb-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'clase'
                ? 'text-brand-primary-text border-b-2 border-brand-primary'
                : 'text-slate-400'
            }`}
            onClick={() => setActiveTab('clase')}
          >
            Clase actual
          </button>
          <button
            className={`flex-1 pb-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'lista'
                ? 'text-brand-primary-text border-b-2 border-brand-primary'
                : 'text-slate-400'
            }`}
            onClick={() => setActiveTab('lista')}
          >
            Lista de clases
          </button>
        </div>

        {/* ----- Tab: Clase actual ----- */}
        {activeTab === 'clase' && (
          <>
            {/* Eval tabs (mobile) */}
            {evalTabs}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-1 text-sm">
              <span className="text-slate-500">{currentEval.label} &gt; Tema 1</span>
            </div>

            {/* Title */}
            <h1 className="text-lg font-bold text-brand-heading mb-1">
              {currentTema.titulo}
            </h1>
            <span className="bg-brand-primary-bg text-brand-primary-text text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 mb-4">
              <CheckCircle2 className="h-3 w-3" />
              Clase completada
            </span>

            {/* Video */}
            {videoPlayer}

            {/* PDF materials (horizontal card) */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-brand-heading mb-3">
                Material de la clase
              </h3>
              <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-3">
                <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded shrink-0">
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-brand-heading">
                    Limites por definición
                  </p>
                  <p className="text-xs text-slate-400">PDF &middot; 25 páginas</p>
                </div>
                <button className="w-9 h-9 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center shrink-0 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments */}
            {commentsSection}
          </>
        )}

        {/* ----- Tab: Lista de clases ----- */}
        {activeTab === 'lista' && (
          <div className="space-y-3">
            {UTP_EVALUACIONES.map((ev) => (
              <div key={ev.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white ${ev.bgTw}`}>
                    {ev.temas.length}
                  </span>
                  <span className="text-sm font-bold text-brand-heading">{ev.label}</span>
                </div>
                <div className="space-y-0.5 ml-4 pl-3 border-l-2 border-slate-100 mb-4">
                  {ev.temas.map((tema) => {
                    const isTemarioActive = activeEvaluacion === ev.id && tema.numero === 1;
                    return (
                      <button
                        key={tema.numero}
                        onClick={() => {
                          setActiveEvaluacion(ev.id);
                          setActiveTab('clase');
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                          isTemarioActive
                            ? 'bg-blue-50 text-brand-heading font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {tema.completado ? (
                          <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                        )}
                        <span className="flex-1 truncate text-[13px]">{tema.titulo}</span>
                        {isTemarioActive && (
                          <Eye className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      </div>
  );
}

