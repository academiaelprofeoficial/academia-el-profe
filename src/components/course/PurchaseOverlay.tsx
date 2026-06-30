'use client';

// ============================================================
// Overlay de Compra — Con integración real a Mercado Pago y PayPal
// Modal de compra con resumen del curso, precios PEN + USD,
// beneficios incluidos, y redirección a la pasarela elegida.
// ============================================================

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  CreditCard,
  CheckCircle2,
  Shield,
  Clock,
  Award,
  Video,
  FileText,
  Users,
  Star,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { cn } from '@/lib/utils';
import type { Course } from '@/types';

interface PurchaseOverlayProps {
  readonly curso: Course | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function PurchaseOverlay({
  curso,
  open,
  onOpenChange,
}: PurchaseOverlayProps) {
  const [loadingMP, setLoadingMP] = useState(false);
  const [loadingPP, setLoadingPP] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Resetear estado cuando se abre/cierra el modal
  const handleOpenChange = (nuevoEstado: boolean) => {
    if (!nuevoEstado) {
      setLoadingMP(false);
      setLoadingPP(false);
      setError(null);
    }
    onOpenChange(nuevoEstado);
  };

  const handleMercadoPago = useCallback(async () => {
    if (!curso) return;
    setLoadingMP(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: curso.slug,
          titulo: curso.titulo,
          precio: curso.precio,
          userId: user?.uid || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar el pago.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No se recibió la URL de pago. Intenta nuevamente.');
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setLoadingMP(false);
    }
  }, [curso]);

  const handlePayPal = useCallback(async () => {
    if (!curso) return;
    setLoadingPP(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: curso.slug,
          titulo: curso.titulo,
          precioUSD: curso.precioUSD,
          userId: user?.uid || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar el pago con PayPal.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No se recibió la URL de PayPal. Intenta nuevamente.');
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setLoadingPP(false);
    }
  }, [curso]);

  if (!curso) return null;

  const beneficios = [
    { icono: Video, texto: `${curso.numeroLecciones} clases grabadas en HD` },
    { icono: FileText, texto: 'Material descargable en PDF' },
    { icono: Clock, texto: 'Acceso de por vida' },
    { icono: Award, texto: 'Certificado al completar' },
    { icono: Users, texto: `${curso.numeroEstudiantes.toLocaleString('es-PE')} estudiantes ya inscritos` },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Cabecera con color de categoría */}
        <div className={cn('p-6 pb-5 text-white relative', curso.categoria.color)}>
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 text-xs"
            >
              {curso.categoria.nombre}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              <span className="text-sm font-semibold">{curso.calificacion}</span>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {curso.titulo}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm mt-1">
              {curso.subtitulo}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Precios principales */}
        <div className="px-6 py-5 bg-muted/30 border-b border-border/40">
          <div className="flex items-baseline gap-4 mb-1">
            <span className="text-3xl font-extrabold text-foreground">
              {formatoSoles(curso.precio)}
            </span>
            <span className="text-lg font-bold text-slate-500">
              {formatoUSD(curso.precioUSD)}
            </span>
            <span className="text-sm text-muted-foreground">pago único</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pago seguro procesado por Mercado Pago (Soles) o PayPal (Dólares).
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1 italic">
            *International payments are processed in USD via PayPal. Automatic currency conversion applies.
          </p>
        </div>

        {/* Beneficios incluidos */}
        <div className="px-6 py-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            ¿Qué incluye tu compra?
          </h4>
          <div className="space-y-2.5">
            {beneficios.map((beneficio, idx) => {
              const Icono = beneficio.icono;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-brand-primary-bg-light dark:bg-brand-primary-darkest/50 shrink-0">
                    <Icono className="h-3.5 w-3.5 text-brand-primary-text" />
                  </div>
                  <span className="text-sm text-foreground">{beneficio.texto}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Garantía y botones de compra duales */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Shield className="h-4 w-4 text-brand-primary shrink-0" />
            <span>
              Compra segura. Tu pago está protegido y tu
              acceso se activa inmediatamente después de la aprobación.
            </span>
          </div>

          {/* Grid dual: Mercado Pago + PayPal */}
          <div className="grid grid-cols-2 gap-3">
            {/* Botón Mercado Pago */}
            <Button
              className={cn(
                'h-12 text-xs font-bold rounded-xl gap-2 w-full',
                'bg-brand-primary hover:bg-brand-primary-hover text-white',
                'disabled:opacity-70 disabled:cursor-not-allowed'
              )}
              onClick={handleMercadoPago}
              disabled={loadingMP || loadingPP}
            >
              {loadingMP ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span className="truncate">PEN {formatoSoles(curso.precio)}</span>
                </>
              )}
            </Button>

            {/* Botón PayPal */}
            <Button
              className={cn(
                'h-12 text-xs font-bold rounded-xl gap-2 w-full',
                'bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087]',
                'disabled:opacity-70 disabled:cursor-not-allowed'
              )}
              onClick={handlePayPal}
              disabled={loadingMP || loadingPP}
            >
              {loadingPP ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <img src="/images/paypal-logo.png" alt="PP" className="h-4 w-4 object-contain" />
                  <span className="truncate">USD {formatoUSD(curso.precioUSD)}</span>
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            Al comprar aceptas nuestros términos y condiciones de uso.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}