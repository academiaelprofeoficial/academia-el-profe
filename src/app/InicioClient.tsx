'use client';

// ============================================================
// Client Component — Inicio con Fase 2
// Homepage con cards de curso, temario modal y purchase overlay.
// ============================================================

import { useState, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { CourseCard } from '@/components/course/CourseCard';
import { TemarioModal } from '@/components/course/TemarioModal';
import { PurchaseOverlay } from '@/components/course/PurchaseOverlay';
import { CURSOS_MOCK } from '@/lib/data';
import type { Course } from '@/types';

export function InicioClient() {
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

  return (
    <section>
      {/* Encabezado de sección */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Cursos exclusivos para estudiantes de la{' '}
            <span className="text-brand-primary">UTP</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">
          Refuerza tu carrera en ingeniería con clases grabadas, material en PDF
          y el respaldo del Prof. Kall Bruno Díaz. Accede al contenido que
          necesitas para aprobar con nota.
        </p>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 lg:gap-6">
        {CURSOS_MOCK.map((curso) => (
          <CourseCard
            key={curso.id}
            curso={curso}
            onVerTemario={handleVerTemario}
          />
        ))}
      </div>

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