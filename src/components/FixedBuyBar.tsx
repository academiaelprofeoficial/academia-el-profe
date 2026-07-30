'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Loader2, QrCode } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { QrPaymentModal } from '@/components/QrPaymentModal';

interface FixedBuyBarProps {
  readonly pricePEN: number;
  readonly priceUSD: number;
  readonly slug: string;
  readonly title: string;
  readonly safeTitle: string;
  readonly whatsapp: string;
  readonly whatsappMessage: string;
  readonly isFreeCourse: boolean;
  readonly hasFullAccess: boolean;
  readonly loadingPay: Record<string, boolean>;
  readonly onMP: () => void;
  readonly onPayPal: () => void;
}

export function FixedBuyBar({
  pricePEN,
  priceUSD,
  slug,
  title,
  safeTitle,
  whatsapp,
  whatsappMessage,
  isFreeCourse,
  hasFullAccess,
  loadingPay,
  onMP,
  onPayPal,
}: FixedBuyBarProps) {
  const [purchased, setPurchased] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    document.body.style.paddingBottom = '80px';
    return () => { document.body.style.paddingBottom = '0px'; };
  }, []);

  if (isFreeCourse) return null;

  const showPay = !purchased && !hasFullAccess;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#0A192F',
        borderTop: '3px solid #F5A623',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.8)',
        padding: '10px 15px',
        margin: 0,
        boxSizing: 'border-box',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {/* Checkout Button */}
          {showPay && (
            <button
              onClick={() => { onMP(); setPurchased(true); }}
              disabled={loadingPay[`${slug}-mp`]}
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 6px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                color: '#fff',
                cursor: 'pointer',
                opacity: loadingPay[`${slug}-mp`] ? 0.6 : 1,
                background: 'linear-gradient(135deg, #00A650, #008a44)',
                boxShadow: '0 4px 10px rgba(0, 166, 80, 0.4)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {loadingPay[`${slug}-mp`] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-sm">💳</span>
              )}
              <span>Comprar (S/ {pricePEN.toLocaleString('es-PE')})</span>
            </button>
          )}

          {/* QR Payment */}
          {showPay && (
            <button
              onClick={() => setShowQr(true)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 6px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                color: '#fff',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.4)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap' as const,
              }}
            >
              <QrCode className="h-4 w-4" />
              <span>QR</span>
            </button>
          )}

          {/* WhatsApp — always visible */}
          <a
            href={`https://wa.me/51922737951?text=${encodeURIComponent('Hola, quiero información sobre el curso: ' + title)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: showPay ? 0.8 : 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 6px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '12px',
              color: '#fff',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #25D366, #1da851)',
              boxShadow: '0 4px 10px rgba(37, 211, 102, 0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap' as const,
            }}
          >
            <WhatsAppIcon size={18} fill="white" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* QR Payment Modal */}
      <QrPaymentModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        courseTitle={title}
        pricePEN={pricePEN}
        priceUSD={priceUSD}
        slug={slug}
      />
    </>
  );
}