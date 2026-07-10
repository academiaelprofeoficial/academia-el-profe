'use client';

// ============================================================
// Modal de Temario Detallado — Fase 2
// Muestra el temario completo en un modal con Temas
// expandibles, indicador de progreso y badges de estado.
// ============================================================

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Video,
  FileText,
  Lock,
  PlayCircle,
  CheckCircle2,
  BookOpen,
  Circle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatoSoles } from '@/lib/formato';
import { cn } from '@/lib/utils';
import type { Course, TemarioItem } from '@/types';

interface TemarioModalProps {
  readonly curso: Course | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function TemarioModal({ curso, open, onOpenChange }: TemarioModalProps) {
  const [moduloExpandido, setModuloExpandido] = useState<string | null>(null);

  if (!curso) return null;

  const totalLecciones = curso.temario.length;
  const leccionesGratuitas = curso.temario.filter((t) => t.esGratuito).length;
  const leccionesBloqueadas = totalLecciones - leccionesGratuitas;
  const procentajeGratis = Math.round((leccionesGratuitas / totalLecciones) * 100);

  const toggleModulo = (moduloId: string) => {
    setModuloExpandido((prev) => (prev === moduloId ? null : moduloId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 max-h-[85vh] overflow-hidden">
        {/* Cabecera con color de categoría */}
        <div className={cn('p-6 pb-4 text-white', curso.categoria.color)}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Temario Completo
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm mt-1">
              {curso.titulo} — {curso.subtitulo}
            </DialogDescription>
          </DialogHeader>

          {/* Estadísticas rápidas */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-white/85">
            <span className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full">
              <Video className="h-3.5 w-3.5" />
              {totalLecciones} lecciones
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              {curso.numeroHoras} horas
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {leccionesGratuitas} gratuitas
            </span>
          </div>
        </div>

        {/* Barra de progreso de contenido gratuito */}
        <div className="px-6 py-3 bg-muted/50 border-b border-border/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              Contenido disponible sin compra
            </span>
            <span className="font-semibold text-brand-primary-text">
              {procentajeGratis}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full transition-all duration-500"
              style={{ width: `${procentajeGratis}%` }}
            />
          </div>
        </div>

        {/* Lista de lecciones */}
        <ScrollArea className="max-h-[45vh]">
          <div className="p-4">
            {/* Tema 1: Introducción (lecciones gratuitas) */}
            <ModuloTemario
              titulo="Tema 1: Introducción"
              subtitulo="Contenido gratuito de acceso libre"
              lecciones={curso.temario.filter((t) => t.esGratuito)}
              estaExpandido={moduloExpandido === 'intro'}
              onToggle={() => toggleModulo('intro')}
              colorModulo="emerald"
            />

            <div className="py-2">
              <Separator />
            </div>

            {/* Tema 2: Contenido completo (lecciones bloqueadas) */}
            {leccionesBloqueadas > 0 && (
              <ModuloTemario
                titulo="Tema 2: Contenido Completo"
                subtitulo={`${leccionesBloqueadas} lecciones — Requiere compra`}
                lecciones={curso.temario.filter((t) => !t.esGratuito)}
                estaExpandido={moduloExpandido === 'completo'}
                onToggle={() => toggleModulo('completo')}
                colorModulo="amber"
              />
            )}
          </div>
        </ScrollArea>

        {/* Pie del modal — CTA de compra */}
        <div className="p-4 border-t border-border/40 bg-muted/30">
          {curso.estaBloqueado ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Desbloquea todo el contenido
                </p>
                <p className="text-xs text-muted-foreground">
                  Acceso de por vida + certificado incluido
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-lg font-bold px-4 py-1.5 bg-brand-primary text-white border-0"
              >
                {formatoSoles(curso.precio)}
              </Badge>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-brand-primary-text font-medium">
                ¡Ya tienes acceso a este curso!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Subcomponente: Tema de Temario Expandible
// ============================================================

interface ModuloTemarioProps {
  readonly titulo: string;
  readonly subtitulo: string;
  readonly lecciones: readonly TemarioItem[];
  readonly estaExpandido: boolean;
  readonly onToggle: () => void;
  readonly colorModulo: 'emerald' | 'amber';
}

function ModuloTemario({
  titulo,
  subtitulo,
  lecciones,
  estaExpandido,
  onToggle,
  colorModulo,
}: ModuloTemarioProps) {
  const colorMap = {
    emerald: {
      borde: 'border-brand-primary',
      bg: 'bg-brand-primary-bg-light dark:bg-brand-primary-darkest/20',
      texto: 'text-brand-primary-text',
      icono: 'text-brand-primary',
    },
    amber: {
      borde: 'border-amber-300 dark:border-amber-700',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      texto: 'text-amber-700 dark:text-amber-400',
      icono: 'text-amber-500',
    },
  };

  const colores = colorMap[colorModulo];

  return (
    <div className={cn('rounded-xl border', colores.borde, colores.bg)}>
      {/* Cabecera del Tema — clic para expandir/colapsar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={estaExpandido}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-lg',
              colorModulo === 'emerald'
                ? 'bg-brand-primary-bg'
                : 'bg-amber-100 dark:bg-amber-900/50'
            )}
          >
            <BookOpen className={cn('h-4 w-4', colores.icono)} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{titulo}</p>
            <p className="text-xs text-muted-foreground">{subtitulo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-2 py-0.5 border',
              colores.borde,
              colores.texto
            )}
          >
            {lecciones.length} lecciones
          </Badge>
          {estaExpandido ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Lecciones expandibles */}
      {estaExpandido && (
        <div className="px-4 pb-3 space-y-1">
          {lecciones.map((leccion) => (
            <LeccionItem
              key={leccion.id}
              leccion={leccion}
              colorModulo={colorModulo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Subcomponente: Ítem Individual de Lección
// ============================================================

interface LeccionItemProps {
  readonly leccion: TemarioItem;
  readonly colorModulo: 'emerald' | 'amber';
}

function LeccionItem({ leccion, colorModulo }: LeccionItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-background/50 transition-colors group">
      {/* Ícono de estado */}
      {leccion.esGratuito ? (
        <PlayCircle className="h-4 w-4 text-brand-primary shrink-0" />
      ) : (
        <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
      )}

      {/* Número de lección */}
      <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">
        {String(leccion.numero).padStart(2, '0')}
      </span>

      {/* Título */}
      <span
        className={cn(
          'text-sm flex-1 min-w-0 truncate',
          leccion.esGratuito
            ? 'text-foreground font-medium'
            : 'text-muted-foreground'
        )}
      >
        {leccion.titulo}
      </span>

      {/* Duración */}
      <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {leccion.duracion}
      </span>

      {/* Badge de estado */}
      {leccion.esGratuito ? (
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0 border-brand-primary text-brand-primary-text dark:border-brand-primary dark:text-brand-primary-text shrink-0"
        >
          Gratis
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0 border-muted text-muted-foreground shrink-0"
        >
          Premium
        </Badge>
      )}
    </div>
  );
}