import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeColorsProvider } from "@/components/theme/ThemeColorsProvider";
import { AuthProvider } from "@/lib/auth-context";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { VisualEditing } from "@/components/VisualEditing";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { sanityClient } from "@/lib/sanity.client";
import { THEME_SETTINGS_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity.queries";
import type { SanityThemeSettings, SanitySiteSettings } from "@/lib/sanity.client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================================
// Metadatos SEO globales — Academia El Profe Oficial
// ============================================================
export const metadata: Metadata = {
  title: {
    default: "Academia El Profe Oficial | Clases de Ingeniería para la UTP",
    template: "%s | Academia El Profe Oficial",
  },
  description:
    "Plataforma educativa de refuerzo académico para estudiantes de la Universidad Tecnológica del Perú (UTP). Cursos de Cálculo, Mecánica, Fluidos, Estadística y más con el Prof. Kall Bruno Díaz.",
  keywords: [
    "Academia El Profe",
    "clases UTP",
    "cálculo UTP",
    "ingeniería Perú",
    "refuerzo académico",
    "Prof. Kall Bruno Díaz",
    "cursos de cálculo",
    "mecánica clásica",
    "fluidos y termodinámica",
    "estadística aplicada",
  ],
  authors: [{ name: "Prof. Kall Bruno Díaz" }],
  creator: "Prof. Kall Bruno Díaz",
  publisher: "Academia El Profe Oficial",
  metadataBase: new URL("https://academiaelprofe.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Academia El Profe Oficial | Clases de Ingeniería para la UTP",
    description:
      "Refuerza tu carrera en ingeniería con los mejores cursos de Cálculo, Mecánica, Fluidos y más. Impartido por el Prof. Kall Bruno Díaz.",
    url: "https://academiaelprofe.com",
    siteName: "Academia El Profe Oficial",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia El Profe Oficial",
    description:
      "Plataforma educativa de refuerzo académico para estudiantes UTP.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Revalidation is handled by on-demand webhook (Sanity → /api/webhook/sanity)
// No timed revalidation — CMS changes appear immediately after publish.
export const revalidate = false;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect draft mode (only active via CMS Presentation Tool /api/preview)
  let isDraftMode = false;
  try {
    const dm = await draftMode();
    isDraftMode = dm.isEnabled;
  } catch {
    // draftMode() not available (static generation)
  }

  // Fetch CMS theme colors and site settings (server-side, no flash)
  let themeData: SanityThemeSettings | null = null;
  let siteSettings: SanitySiteSettings | null = null;
  try {
    const [themeRes, settingsRes] = await Promise.all([
      sanityClient.fetch<SanityThemeSettings | null>(THEME_SETTINGS_QUERY, {}, {
        next: { tags: ["sanity"] },
      } as never),
      sanityClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS_QUERY, {}, {
        next: { tags: ["sanity"] },
      } as never),
    ]);
    themeData = themeRes;
    siteSettings = settingsRes;
  } catch {
    // Fallback to CSS defaults in globals.css
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10B981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
	      <body
	        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground pb-14 sm:pb-0`}
	      >
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}`,
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `window.addEventListener('error',function(e){if(e.message&&e.message.includes('ChunkLoadError')){location.reload()}});window.addEventListener('unhandledrejection',function(e){if(e.reason&&e.reason.message&&e.reason.message.includes('ChunkLoadError')){location.reload()}});`,
        }} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          <ThemeColorsProvider themeData={themeData}>
            <SiteSettingsProvider siteSettings={siteSettings}>
              <AuthProvider>
                {children}
                {isDraftMode && <VisualEditing />}
                <Toaster />
                {!isDraftMode && <WhatsAppButton />}
                {!isDraftMode && <MobileBottomBar />}
              </AuthProvider>
            </SiteSettingsProvider>
          </ThemeColorsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}