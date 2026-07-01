'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    document.body.style.paddingBottom = '80px';
    return () => { document.body.style.paddingBottom = '0px'; };
  }, []);

  if (isFreeCourse) return null;

  const showPay = !purchased && !hasFullAccess;

  return (
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
        gap: '12px',
      }}>
        {/* MP */}
        {showPay && (
          <button
            onClick={() => { onMP(); setPurchased(true); }}
            disabled={loadingPay[`${slug}-mp`] || loadingPay[`${slug}-pp`]}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 8px',
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
              <span>💳</span>
            )}
            <span>S/ {pricePEN.toLocaleString('es-PE')}</span>
          </button>
        )}

        {/* PayPal */}
        {showPay && (
          <button
            onClick={() => { onPayPal(); setPurchased(true); }}
            disabled={loadingPay[`${slug}-mp`] || loadingPay[`${slug}-pp`]}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 8px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              color: '#fff',
              cursor: 'pointer',
              opacity: loadingPay[`${slug}-pp`] ? 0.6 : 1,
              background: 'linear-gradient(135deg, #0070BA, #005c9e)',
              boxShadow: '0 4px 10px rgba(0, 112, 186, 0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {loadingPay[`${slug}-pp`] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <img src="/images/paypal-logo.png" alt="PP" style={{ height: 18, width: 18 }} />
            )}
            <span>${priceUSD.toFixed(2)}</span>
          </button>
        )}

        {/* WhatsApp — always visible */}
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage + ' ' + title)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: showPay ? 1 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 8px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '13px',
            color: '#fff',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #25D366, #1da851)',
            boxShadow: '0 4px 10px rgba(37, 211, 102, 0.4)',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap' as const,
          }}
        >
          <span>📲</span>
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
