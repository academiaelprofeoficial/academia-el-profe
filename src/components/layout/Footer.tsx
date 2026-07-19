'use client';

// ============================================================
// Footer — Academia El Profe Oficial
// Pie de página profesional con logo, enlaces, redes sociales.
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

  return <GraduationCap className="h-4 w-4 text-brand-primary" />;
}

// ============================================================
// SVG Icons — brand-accurate for TikTok and Facebook
// ============================================================

function TikTokIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.17V11.7a4.83 4.83 0 01-3.77-1.57V6.69h3.77z" fill="currentColor"/>
    </svg>
  );
}

function FacebookIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/>
    </svg>
  );
}

function YouTubeIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function Footer() {
  const settings = useSiteSettings();
  const anioActual = new Date().getFullYear();

  const socials = [
    { url: settings?.tiktokUrl, icon: TikTokIcon, label: 'TikTok', color: 'hover:text-[#ff0050]' },
    { url: settings?.facebookUrl, icon: FacebookIcon, label: 'Facebook', color: 'hover:text-[#1877F2]' },
    { url: settings?.instagramUrl, icon: InstagramIcon, label: 'Instagram', color: 'hover:text-[#E4405F]' },
    { url: settings?.youtubeUrl, icon: YouTubeIcon, label: 'YouTube', color: 'hover:text-[#FF0000]' },
  ].filter(s => s.url);

  return (
    <footer className="border-t border-border/40 bg-muted/20 px-6 py-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
        {/* Top row: Logo + Social Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap justify-center sm:justify-start">
            <FooterLogo />
            <span className="text-xs text-muted-foreground/60">
              © {anioActual} {settings?.companyName || 'Academia El Profe Oficial'}. Todos los derechos reservados.
            </span>
          </div>

          {/* Social Media Icons */}
          {socials.length > 0 && (
            <div className="flex items-center gap-1">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`p-2 rounded-full text-muted-foreground/70 transition-all duration-200 ${s.color} hover:scale-110 hover:bg-muted/60 active:scale-95`}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border/30" />

        {/* Bottom row: Links + Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
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

          <span className="text-[11px] text-muted-foreground/50">
            Diseñado por{' '}
            <a
              href="https://www.fastpagepro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary/60 hover:text-brand-primary transition-colors"
            >
              FastPagePro
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}