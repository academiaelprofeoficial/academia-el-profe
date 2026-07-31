import { useState, useCallback, useEffect } from 'react';

export function useCulqi(onSuccess?: (token: string) => void, onError?: (error: string) => void) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (typeof window !== 'undefined' && (window as any).Culqi) {
      setIsReady(true);
    } else {
      // We rely on <Script src="https://checkout.culqi.com/js/v4" /> being on the page
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
      (window as any).culqi = () => {
        const Culqi = (window as any).Culqi;
        if (Culqi.token) {
          const token = Culqi.token.id;
          if (onSuccess) {
            onSuccess(token);
          } else {
            console.log('Token obtenido:', token);
            alert('Transacción exitosa (Token: ' + token + ').');
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

  const openCulqi = useCallback((title: string, amountPEN: number) => {
    if (typeof window !== 'undefined' && (window as any).Culqi) {
      const Culqi = (window as any).Culqi;
      Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_a3efeb3eb05c4bd1';
      Culqi.settings({
        title,
        currency: 'PEN',
        amount: Math.round(amountPEN * 100), // En céntimos
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

  return { openCulqi, isReady };
}
