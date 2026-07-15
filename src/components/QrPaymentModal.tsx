'use client';

import { useState, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Check } from 'lucide-react';

interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  pricePEN: number;
  priceUSD: number;
  slug: string;
}

export function QrPaymentModal({
  isOpen,
  onClose,
  courseTitle,
  pricePEN,
  priceUSD,
  slug,
}: QrPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const WHATSAPP_NUMBER = '51922737951';
  const paymentMessage = `Hola, realicé el pago por transferencia/QR del curso "${courseTitle}" (S/ ${pricePEN.toLocaleString('es-PE')}). Adjunto comprobante.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(paymentMessage)}`;

  // QR encodes the WhatsApp confirmation URL with course details
  const qrData = whatsappUrl;

  const handleDownload = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pago-qr-${slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [slug]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(whatsappUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = whatsappUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [whatsappUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">
          Pago con QR
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5">
          Escanea o descarga el QR y realiza tu transferencia
        </p>

        {/* Course info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {courseTitle}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              S/ {pricePEN.toLocaleString('es-PE')}
            </span>
            {priceUSD > 0 && (
              <span className="text-sm text-slate-400">
                ~${priceUSD.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div
          ref={qrRef}
          className="flex justify-center mb-5 bg-white p-4 rounded-xl"
        >
          <QRCodeCanvas
            value={qrData}
            size={220}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        {/* Instructions */}
        <div className="space-y-2 mb-5">
          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-emerald-500 font-bold mt-0.5">1.</span>
            <span>Escanea el QR o descarga la imagen</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-emerald-500 font-bold mt-0.5">2.</span>
            <span>Realiza la transferencia desde tu banco, Yape o Plin</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-emerald-500 font-bold mt-0.5">3.</span>
            <span>Envía el comprobante por WhatsApp para activar tu acceso</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {/* Send receipt via WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #25D366, #1da851)',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white"/>
            </svg>
            Enviar comprobante por WhatsApp
          </a>

          {/* Download QR + Copy link row */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar QR
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}