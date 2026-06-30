'use client';

// ============================================================
// Dashboard — Lista de Deseos
// ============================================================

import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { DESEOS_USUARIO } from '@/lib/data';
import { formatoSoles } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Botón comprar desde lista de deseos (con loading + redirect a MP)
// ---------------------------------------------------------------------------

function WishListBuyButton({ cursoId }: { readonly cursoId: string }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCompra = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId,
          titulo: cursoId,
          precio: 0,
          userId: user?.uid || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Si falla, simplemente se queda en la página
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  return (
    <button
      onClick={handleCompra}
      disabled={loading}
      className="h-9 px-3 gap-1.5 text-xs font-semibold bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg flex items-center justify-center disabled:opacity-70 transition-opacity"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ShoppingCart className="h-3.5 w-3.5" />
      )}
      Comprar
    </button>
  );
}

export default function DashboardDeseosPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100">
            Lista de Deseos
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cursos que te interesan y guardaste para comprar después.
          No pierdas de vista los cursos que quieres estudiar.
        </p>
      </div>

      {/* Lista */}
      {DESEOS_USUARIO.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-semibold text-brand-body mb-1">
            Tu lista está vacía
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            Explora el catálogo y guarda los cursos que te interesen.
          </p>
          <Link href="/dashboard/cursos">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white">
              Explorar Cursos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {DESEOS_USUARIO.map((deseo) => (
            <div
              key={deseo.id}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Barra de color */}
                <div className={`${deseo.color} w-full sm:w-2 shrink-0`} />

                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {deseo.formula && (
                        <span className="text-sm font-light text-slate-400 dark:text-slate-500">
                          {deseo.formula}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-brand-heading dark:text-slate-100 text-base">
                      {deseo.cursoNombre}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Agregado el {deseo.fechaAgregado}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <span className="text-xl font-bold text-orange-500">
                      {formatoSoles(deseo.price)}
                    </span>
                  </div>

                  {/* Botones */}
                  <div className="flex items-center gap-2">
                    <Link href={`/cursos/${deseo.cursoId}/temario`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        Ver temario
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                    <WishListBuyButton cursoId={deseo.cursoId} />
                    <button
                      className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Quitar de la lista"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}