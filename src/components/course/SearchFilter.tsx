'use client';

// ============================================================
// Barra de Búsqueda y Filtros — Fase 2
// Búsqueda en tiempo real, filtros por categoría/precio/estado,
// y ordenamiento. Todo client-side con los cursos mock.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  FunctionSquare,
  Sigma,
  TrendingUp,
  Infinity,
  Atom,
  Waves,
  BarChart3,
  Grid3x3,
  BookOpen,
  ArrowUpDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIAS, CURSOS_MOCK } from '@/lib/data';
import type { Course } from '@/types';
import { cn } from '@/lib/utils';

/** Mapa de íconos por nombre de categoría */
const ICONOS_CATEGORIA: Record<string, React.ComponentType<{ className?: string }>> = {
  FunctionSquare,
  Sigma,
  TrendingUp,
  Infinity,
  Atom,
  Waves,
  BarChart3,
  Grid3x3,
};

interface SearchFilterProps {
  readonly onResults: (cursos: readonly Course[]) => void;
  readonly className?: string;
}

/** Opciones de ordenamiento */
const OPCIONES_ORDENAR = [
  { valor: 'relevancia', etiqueta: 'Relevancia' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'popularidad', etiqueta: 'Más populares' },
  { valor: 'calificacion', etiqueta: 'Mejor calificados' },
  { valor: 'nombre', etiqueta: 'Nombre A-Z' },
] as const;

type EstadoFiltro = 'todos' | 'bloqueado' | 'desbloqueado';

export function SearchFilter({ onResults, className }: SearchFilterProps) {
  const [query, setQuery] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos');
  const [rangoPrecio, setRangoPrecio] = useState('todos');
  const [ordenamiento, setOrdenamiento] = useState('relevancia');
  const [showFilters, setShowFilters] = useState(false);

  const cursosFiltrados = useMemo(() => {
    let resultados = [...CURSOS_MOCK];

    // Filtro de búsqueda textual
    if (query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      resultados = resultados.filter(
        (c) =>
          c.titulo.toLowerCase().includes(q) ||
          c.subtitulo.toLowerCase().includes(q) ||
          c.categoria.nombre.toLowerCase().includes(q) ||
          c.descripcion.toLowerCase().includes(q)
      );
    }

    // Filtro por categoría
    if (categoriaSeleccionada !== 'todas') {
      resultados = resultados.filter(
        (c) => c.categoria.slug === categoriaSeleccionada
      );
    }

    // Filtro por estado (bloqueado/desbloqueado)
    if (estadoFiltro === 'bloqueado') {
      resultados = resultados.filter((c) => c.estaBloqueado);
    } else if (estadoFiltro === 'desbloqueado') {
      resultados = resultados.filter((c) => !c.estaBloqueado);
    }

    // Filtro por rango de precio
    if (rangoPrecio === 'menor-100') {
      resultados = resultados.filter((c) => c.precio < 100);
    } else if (rangoPrecio === '100-120') {
      resultados = resultados.filter((c) => c.precio >= 100 && c.precio <= 120);
    } else if (rangoPrecio === 'mayor-120') {
      resultados = resultados.filter((c) => c.precio > 120);
    }

    // Ordenamiento
    switch (ordenamiento) {
      case 'precio-asc':
        resultados.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        resultados.sort((a, b) => b.precio - a.precio);
        break;
      case 'popularidad':
        resultados.sort((a, b) => b.numeroEstudiantes - a.numeroEstudiantes);
        break;
      case 'calificacion':
        resultados.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case 'nombre':
        resultados.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
        break;
      default: // relevancia: mantiene el orden original
        break;
    }

    return resultados;
  }, [query, categoriaSeleccionada, estadoFiltro, rangoPrecio, ordenamiento]);

  const numeroResultados = cursosFiltrados.length;
  const totalCursos = CURSOS_MOCK.length;
  const filtrosActivos =
    (categoriaSeleccionada !== 'todas' ? 1 : 0) +
    (estadoFiltro !== 'todos' ? 1 : 0) +
    (rangoPrecio !== 'todos' ? 1 : 0);

  const limpiarFiltros = useCallback(() => {
    setCategoriaSeleccionada('todas');
    setEstadoFiltro('todos');
    setRangoPrecio('todos');
    setOrdenamiento('relevancia');
    setQuery('');
  }, []);

  // Enviar resultados al componente padre cada vez que cambien
  useMemo(() => {
    onResults(cursosFiltrados);
  }, [cursosFiltrados, onResults]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Fila principal: búsqueda + botón filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, categoría o descripción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-10 bg-muted/50"
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Botón de filtros avanzados */}
          <Button
            variant="outline"
            size="default"
            className={cn(
              'h-10 gap-2',
              filtrosActivos > 0 &&
                'border-brand-primary text-brand-primary-text bg-brand-primary-bg-light'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {filtrosActivos > 0 && (
              <Badge
                variant="secondary"
                className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-brand-primary text-white"
              >
                {filtrosActivos}
              </Badge>
            )}
          </Button>

          {/* Ordenamiento */}
          <Select value={ordenamiento} onValueChange={setOrdenamiento}>
            <SelectTrigger className="h-10 w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {OPCIONES_ORDENAR.map((op) => (
                <SelectItem key={op.valor} value={op.valor}>
                  {op.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Filtros avanzados
            </h3>
            {filtrosActivos > 0 && (
              <button
                onClick={limpiarFiltros}
                className="text-xs text-brand-primary-text hover:underline font-medium"
              >
                Limpiar todo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Filtro por categoría */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Categoría
              </label>
              <Select
                value={categoriaSeleccionada}
                onValueChange={setCategoriaSeleccionada}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {CATEGORIAS.map((cat) => {
                    const CatIcon = ICONOS_CATEGORIA[cat.icono] || BookOpen;
                    return (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        <span className="flex items-center gap-2">
                          <CatIcon className="h-3.5 w-3.5" />
                          {cat.nombre}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Estado
              </label>
              <Select
                value={estadoFiltro}
                onValueChange={(v) => setEstadoFiltro(v as EstadoFiltro)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5" />
                      Todos los cursos
                    </span>
                  </SelectItem>
                  <SelectItem value="desbloqueado">
                    <span className="flex items-center gap-2">
                      <Unlock className="h-3.5 w-3.5" />
                      Accesibles
                    </span>
                  </SelectItem>
                  <SelectItem value="bloqueado">
                    <span className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      Bloqueados
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por rango de precio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Precio
              </label>
              <Select value={rangoPrecio} onValueChange={setRangoPrecio}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los precios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los precios</SelectItem>
                  <SelectItem value="menor-100">Menor a S/ 100</SelectItem>
                  <SelectItem value="100-120">S/ 100 – S/ 120</SelectItem>
                  <SelectItem value="mayor-120">Mayor a S/ 120</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chips de filtros activos */}
          {filtrosActivos > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
              {categoriaSeleccionada !== 'todas' && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-xs cursor-pointer hover:bg-destructive/10"
                  onClick={() => setCategoriaSeleccionada('todas')}
                >
                  {CATEGORIAS.find((c) => c.slug === categoriaSeleccionada)?.nombre}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {estadoFiltro !== 'todos' && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-xs cursor-pointer hover:bg-destructive/10"
                  onClick={() => setEstadoFiltro('todos')}
                >
                  {estadoFiltro === 'bloqueado' ? 'Bloqueados' : 'Accesibles'}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {rangoPrecio !== 'todos' && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-xs cursor-pointer hover:bg-destructive/10"
                  onClick={() => setRangoPrecio('todos')}
                >
                  {rangoPrecio === 'menor-100' && 'Menor a S/ 100'}
                  {rangoPrecio === '100-120' && 'S/ 100 – S/ 120'}
                  {rangoPrecio === 'mayor-120' && 'Mayor a S/ 120'}
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Indicador de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {query.length > 0 || filtrosActivos > 0 ? (
            <>
              <span className="font-medium text-foreground">
                {numeroResultados}
              </span>{' '}
              {numeroResultados === 1 ? 'curso encontrado' : 'cursos encontrados'}{' '}
              de {totalCursos}
            </>
          ) : (
            <>
              Mostrando{' '}
              <span className="font-medium text-foreground">{totalCursos}</span>{' '}
              cursos disponibles
            </>
          )}
        </p>
      </div>
    </div>
  );
}