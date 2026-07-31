'use client';

// ============================================================
// Overlay de Compra — Con integración real a Culqi
// Modal de compra con resumen del curso, beneficios incluidos,
// y ejecución de la pasarela Culqi para pagos en PEN.
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/auth-context';
import {
  CreditCard,
  Shield,
  Clock,
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
  const [loadingCulqi, setLoadingCulqi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Resetear estado cuando se abre/cierra el modal
  const handleOpenChange = (nuevoEstado: boolean) => {
    if (!nuevoEstado) {
      setLoadingCulqi(false);
      setError(null);
    }
    onOpenChange(nuevoEstado);
  };

  // Setup global culqi handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).culqi = () => {
        const Culqi = (window as any).Culqi;
        if (Culqi.token) {
          const token = Culqi.token.id;
          // Esto se conectará al backend cuando se tenga la pasarela aprobada
          console.log('Token obtenido:', token);
          alert('Transacción en modo de prueba exitosa (Token: ' + token + '). La pasarela está en proceso de revisión.');
        } else {
          console.error(Culqi.error);
          setError(Culqi.error?.user_message || 'Hubo un error con la tarjeta.');
        }
      };
    }
  }, []);

  const handleCulqi = useCallback(() => {
    if (!curso) return;
    setLoadingCulqi(true);
    setError(null);

    if (typeof window !== 'undefined' && (window as any).Culqi) {
      const Culqi = (window as any).Culqi;
      Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_a3efeb3eb05c4bd1';
      Culqi.settings({
        title: 'Academia El Profe',
        currency: 'PEN',
        amount: Math.round(curso.precio * 100), // En céntimos
      });
      Culqi.options({
        lang: 'auto',
        modal: true,
        installments: false,
      });
      Culqi.open();
      setLoadingCulqi(false);
    } else {
      setError('No se pudo cargar la pasarela de pagos. Por favor, refresca la página.');
      setLoadingCulqi(false);
    }
  }, [curso]);

  if (!curso) return null;

  if (!curso) return null;

  const beneficios = [
    { icono: Video, texto: `${curso.numeroLecciones} clases grabadas en HD` },
    { icono: FileText, texto: 'Material descargable en PDF' },
    { icono: Clock, texto: 'Acceso de por vida' },
    { icono: Users, texto: `${curso.numeroEstudiantes?.toLocaleString('es-PE') ?? '0'} estudiantes ya inscritos` },
  ];

  return (
    <>
      <Script src="https://checkout.culqi.com/js/v4" strategy="lazyOnload" />
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
              <DialogTitle className="text-xl sm:text-2xl text-white font-bold mb-1">
                {curso.titulo}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm">
                Aprende de forma práctica y domina los conceptos paso a paso.
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
              Pago seguro procesado mediante la pasarela peruana Culqi.
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

          {/* Garantía y botón de compra */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Shield className="h-4 w-4 text-brand-primary shrink-0" />
              <span>
                Compra segura. Tu pago está protegido y tu
                acceso se activa inmediatamente después de la aprobación.
              </span>
            </div>

            {/* Botón Culqi Unificado */}
            <Button
              className={cn(
                'h-12 text-sm font-bold rounded-xl gap-2 w-full',
                'bg-brand-primary hover:bg-brand-primary-hover text-white',
                'disabled:opacity-70 disabled:cursor-not-allowed'
              )}
              onClick={handleCulqi}
              disabled={loadingCulqi}
            >
              {loadingCulqi ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Pagar con Tarjeta (Culqi) - {formatoSoles(curso.precio)}</span>
                </>
              )}
            </Button>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <p className="text-center text-[11px] text-muted-foreground">
              Al comprar aceptas nuestros términos y condiciones de uso.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}