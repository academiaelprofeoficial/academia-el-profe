'use client';

// ============================================================
// Client Component — Catálogo de Cursos con Fase 2
// Búsqueda, filtros, temario modal y overlay de compra.
// ============================================================

import { useState, useCallback } from 'react';
import { BookOpen, SearchX } from 'lucide-react';
import { SearchFilter } from '@/components/course/SearchFilter';
import { CourseCard } from '@/components/course/CourseCard';
import { TemarioModal } from '@/components/course/TemarioModal';
import { PurchaseOverlay } from '@/components/course/PurchaseOverlay';
import { CURSOS_MOCK } from '@/lib/data';
import type { Course } from '@/types';

export function CursosCatalogoClient() {
  const [cursosVisibles, setCursosVisibles] = useState<readonly Course[]>(
    () => [...CURSOS_MOCK]
  );
  const [temarioAbierto, setTemarioAbierto] = useState(false);
  const [cursoTemario, setCursoTemario] = useState<Course | null>(null);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [cursoCompra, setCursoCompra] = useState<Course | null>(null);

  const handleVerTemario = useCallback((curso: Course) => {
    setCursoTemario(curso);
    setTemarioAbierto(true);
  }, []);

  const handleComprar = useCallback((curso: Course) => {
    setCursoCompra(curso);
    setCompraAbierta(true);
  }, []);

  const handleResults = useCallback((cursos: readonly Course[]) => {
    setCursosVisibles(cursos);
  }, []);

  return (
    <section>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-brand-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Catálogo de Cursos
          </h1>
        </div>
        <p className="text-muted-foreground text-sm lg:text-base">
          Todos los cursos disponibles para tu formación en ingeniería.
        </p>
      </div>

      {/* Búsqueda y Filtros */}
      <SearchFilter onResults={handleResults} className="mb-6" />

      {/* Grid de cursos filtrados */}
      {cursosVisibles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 lg:gap-6">
          {cursosVisibles.map((curso) => (
            <CourseCard
              key={curso.id}
              curso={curso}
              onVerTemario={handleVerTemario}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <SearchX className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            No se encontraron cursos
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Intenta ajustar los filtros o buscar con otros términos para
            encontrar lo que necesitas.
          </p>
        </div>
      )}

      {/* Modal de Temario */}
      <TemarioModal
        curso={cursoTemario}
        open={temarioAbierto}
        onOpenChange={setTemarioAbierto}
      />

      {/* Overlay de Compra */}
      <PurchaseOverlay
        curso={cursoCompra}
        open={compraAbierta}
        onOpenChange={setCompraAbierta}
      />
    </section>
  );
}