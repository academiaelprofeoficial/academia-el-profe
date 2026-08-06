import { useState, useCallback, useEffect, useRef } from 'react';

export interface CulqiCheckoutData {
  cursoId: string;
  titulo: string;
  precio: number;
  userId?: string;
  userEmail?: string;
}

export function useCulqi(
  onSuccess?: (token: string) => void,
  onError?: (error: string) => void
) {
  const [isReady, setIsReady] = useState(false);
  const checkoutDataRef = useRef<CulqiCheckoutData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Culqi) {
      setIsReady(true);
    } else {
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).Culqi) {
          setIsReady(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).culqi = async () => {
        const Culqi = (window as any).Culqi;
        if (Culqi.token) {
          const token = Culqi.token.id;
          
          if (onSuccess) {
            onSuccess(token);
          } else {
            // Default behavior: Process token via our backend
            const checkoutData = checkoutDataRef.current;
            if (!checkoutData) {
              alert('Error interno: No se encontraron los datos del curso.');
              Culqi.close();
              return;
            }

            setIsProcessing(true);
            try {
              const res = await fetch('/api/checkout/culqi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tokenId: token,
                  cursoId: checkoutData.cursoId,
                  titulo: checkoutData.titulo,
                  precio: checkoutData.precio,
                  userId: checkoutData.userId,
                  userEmail: checkoutData.userEmail,
                }),
              });

              const data = await res.json();
              if (res.ok && data.success) {
                // Charge successful, redirect to dashboard
                window.location.href = '/dashboard/cursos?status=success&gateway=culqi';
              } else {
                const errorMsg = data.error || 'Hubo un error al procesar el pago.';
                if (onError) onError(errorMsg);
                else alert(errorMsg);
              }
            } catch (error) {
              console.error('Error al procesar Culqi:', error);
              const fallbackMsg = 'Hubo un error de conexión al procesar el pago.';
              if (onError) onError(fallbackMsg);
              else alert(fallbackMsg);
            } finally {
              setIsProcessing(false);
              Culqi.close();
            }
          }
        } else {
          console.error(Culqi.error);
          if (onError) {
            onError(Culqi.error?.user_message || 'Hubo un error con la tarjeta.');
          } else {
            alert(Culqi.error?.user_message || 'Hubo un error con la tarjeta.');
          }
        }
      };
    }
  }, [onSuccess, onError]);

  const openCulqi = useCallback((data: CulqiCheckoutData) => {
    if (typeof window !== 'undefined' && (window as any).Culqi) {
      checkoutDataRef.current = data;
      const Culqi = (window as any).Culqi;
      Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_a3efeb3eb05c4bd1';
      Culqi.settings({
        title: data.titulo,
        currency: 'PEN',
        amount: Math.round(data.precio * 100), // En céntimos
      });
      Culqi.options({
        lang: 'auto',
        modal: true,
        installments: false,
      });
      Culqi.open();
    } else {
      alert('La pasarela de pago aún se está cargando o hubo un error.');
    }
  }, []);

  return { openCulqi, isReady, isProcessing };
}
