'use client';

// ============================================================
// Footer — Academia El Profe Oficial
// Pie de página con información institucional, enlaces y
// créditos de FastPagePro (hardcodeado, no editable desde CMS).
// Logo desde CMS (siteSettings) con fallback a ícono.
// ============================================================

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { urlFor } from '@/lib/sanity.client';

const FOOTER_LINKS: readonly { etiqueta: string; href: string }[] = [
  { etiqueta: 'Términos y Condiciones', href: '#' },
  { etiqueta: 'Política de Privacidad', href: '#' },
  { etiqueta: 'Contáctanos', href: '/soporte' },
  { etiqueta: 'Sobre Nosotros', href: '/nosotros' },
] as const;

function FooterLogo() {
  const settings = useSiteSettings();

  const cmsLogo = settings?.logo?.asset
    ? urlFor(settings.logo).width(160).height(60).fit('clip').url()
    : null;

  if (cmsLogo) {
    return (
      <img
        src={cmsLogo}
        alt={settings?.companyName || 'Academia El Profe'}
        className="h-7 w-auto object-contain"
      />
    );
  }

  // Fallback: ícono
  return <GraduationCap className="h-4 w-4 text-brand-primary" />;
}

export function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/20 px-6 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo + copyright + créditos */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap justify-center sm:justify-start">
          <FooterLogo />
          <span>
            {anioActual} Academia El Profe Oficial. Todos los derechos reservados.
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="text-sm text-muted-foreground">
            Diseñado y desarrollado por{' '}
            <a
              href="https://www.fastpagepro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
            >
              FastPagePro
            </a>
          </span>
        </div>

        {/* Enlaces del footer */}
        <nav className="flex items-center gap-4" aria-label="Enlaces del pie de página">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.etiqueta}
              href={link.href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.etiqueta}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}