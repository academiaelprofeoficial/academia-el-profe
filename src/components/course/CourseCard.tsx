'use client';

// ============================================================
// Tarjeta de Curso — Academia El Profe Oficial
// Card de curso colorido con metadatos, precio en soles
// y botones de acción (Comprar Ahora / Temario).
// ============================================================

import Link from 'next/link';
import {
  Video,
  FileText,
  Lock,
  Star,
  Users,
  FunctionSquare,
  Sigma,
  TrendingUp,
  Infinity,
  Atom,
  Waves,
  BarChart3,
  Grid3x3,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatoSoles } from '@/lib/formato';
import type { Course } from '@/types';
import { cn } from '@/lib/utils';

/** Mapa de íconos por nombre de categoría */
const ICONOS_CURSO: Record<string, React.ComponentType<{ className?: string }>> = {
  FunctionSquare,
  Sigma,
  TrendingUp,
  Infinity,
  Atom,
  Waves,
  BarChart3,
  Grid3x3,
};

interface CourseCardProps {
  readonly curso: Course;
  readonly onVerTemario?: (curso: Course) => void;
}

export function CourseCard({ curso, onVerTemario }: CourseCardProps) {
  const Icono = ICONOS_CURSO[curso.categoria.icono] || BookOpen;

  return (
    <div
      className={cn(
        'group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        curso.categoria.color,
        curso.categoria.colorHover
      )}
    >
      {/* Capa de bloqueo si el curso está cerrado */}
      {curso.estaBloqueado && (
        <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <Lock className="h-10 w-10 text-white/80 drop-shadow-lg" />
        </div>
      )}

      <div className="p-6 flex flex-col justify-between min-h-[280px] text-white">
        {/* Encabezado del card */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Icono className="h-12 w-12 text-white/90" />
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
              <span className="text-xs font-semibold text-white/90">
                {curso.calificacion}
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-1 leading-tight">
            {curso.titulo}
          </h3>
          <p className="text-sm text-white/80 leading-snug line-clamp-2">
            {curso.subtitulo}
          </p>
        </div>

        {/* Metadatos */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-4 text-xs text-white/75">
            {curso.tieneClasesGrabadas && (
              <span className="flex items-center gap-1">
                <Video className="h-3.5 w-3.5" />
                Clases grabadas
              </span>
            )}
            {curso.tieneMaterialPDF && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Material en PDF
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {curso.numeroEstudiantes.toLocaleString('es-PE')}
            </span>
          </div>

          {/* Precio */}
          <div className="text-lg font-bold">
            {formatoSoles(curso.precio)}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-1">
            <Link href={`/cursos/${curso.slug}`} className="flex-1">
              <Button
                className={cn(
                  'w-full text-xs font-bold h-9 rounded-lg border-0',
                  'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                )}
              >
                {curso.estaBloqueado ? 'Comprar Ahora' : 'Ver Curso'}
              </Button>
            </Link>
            <Button
              variant="outline"
              className={cn(
                'text-xs font-bold h-9 rounded-lg border-white/30',
                'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
              )}
              onClick={() => onVerTemario?.(curso)}
            >
              Temario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}