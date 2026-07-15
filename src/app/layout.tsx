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
import { ScreenRecordButton } from "@/components/ScreenRecordButton";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { GlowingParticles } from "@/components/GlowingParticles";
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
    default: "Academia El Profe | Cursos Universitarios",
    template: "%s | Academia El Profe",
  },
  description:
    "Cursos universitarios de Cálculo 1,2,3, Física 1,2 , Estática, Termodinámica y más. Clases grabadas, material en PDF y acceso inmediato para estudiantes de universidades de todo el Perú.",
  keywords: [
    "Academia El Profe",
    "cursos universitarios",
    "cálculo diferencial",
    "cálculo integral",
    "física universitaria",
    "estática",
    "cursos UTP",
    "clases de ingeniería",
    "Prof. Kall Bruno Díaz",
    "refuerzo académico",
  ],
  authors: [{ name: "Prof. Kall Bruno Díaz" }],
  creator: "Prof. Kall Bruno Díaz",
  publisher: "Academia El Profe Oficial",
  metadataBase: new URL("https://academiaelprofe.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Academia El Profe | Cursos Universitarios",
    description:
      "ACADEMIA EL PROFE : CURSOS UNIVERSITARIOS. Cursos de Cálculo, Física, Estática, Química y más. Clases grabadas, material PDF descargable y certificado al finalizar.",
    url: "https://academiaelprofe.com",
    siteName: "Academia El Profe",
    locale: "es_PE",
    type: "website",
    images: [{ url: "/og-image.webp", width: 1200, height: 630, type: "image/webp", alt: "Academia El Profe Oficial — Cursos de Ingeniería UTP" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia El Profe | Cursos Universitarios",
    description:
      "ACADEMIA EL PROFE : CURSOS UNIVERSITARIOS. Cursos online con clases grabadas, material PDF y certificado.",
    images: ["/og-image.webp"],
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

// Viewport for iOS PWA safe area
export const viewport = {
  width: 'device-width' as const,
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover' as const,
};

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
        {/* Preconnect for Core Web Vitals */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10B981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Stale cache killer — clears ALL caches on first visit of each session.
            This runs BEFORE any JS chunks load, so it works even from stale cached HTML.
            Uses sessionStorage flag to only run once per session. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if('caches' in window){var K='aep_cache_cleared';if(!sessionStorage.getItem(K)){sessionStorage.setItem(K,'1');caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}).then(function(){var u=new URL(location.href);u.searchParams.set('_fresh',Date.now());location.replace(u.toString())}).catch(function(){})}}}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
                      <body
                        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground pb-[76px] lg:pb-0`}
                      >
        {/* Reading progress bar */}
        <div id="reading-progress" className="fixed top-0 left-0 h-[3px] z-[10000] transition-all duration-150" style={{ background: 'linear-gradient(90deg, #10B981, #059669)', width: '0%' }} />
        <script dangerouslySetInnerHTML={{
          __html: `window.addEventListener('scroll',function(){var w=document.getElementById('reading-progress');if(w){var p=(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight))*100;w.style.width=Math.min(p,100)+'%'}},{passive:true})`,
        }} />
        {/* SW registration: force update + skip waiting + listen for SW_UPDATED reload */}
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.type==='SW_UPDATED'){var u=new URL(location.href);u.searchParams.set('_swu',Date.now());location.replace(u.toString())}});window.addEventListener('load',function(){navigator.serviceWorker.getRegistration().then(function(r){if(r)r.update()});navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(function(reg){function s(w){try{w.postMessage({type:'SKIP_WAITING'})}catch(e){}}if(reg.waiting)s(reg.waiting);reg.addEventListener('updatefound',function(){var nw=reg.installing;if(nw)nw.addEventListener('statechange',function(){if(nw.state==='installed')s(nw)})})}).catch(function(){})})}`,
        }} />
        {/* Chunk error recovery: clear ALL caches + reload with cache-bust URL + prevent loop */}
        <script dangerouslySetInnerHTML={{
          __html: `var _rl=false;function ffr(){if(_rl)return;_rl=true;if('caches' in window){caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}).then(function(){var u=new URL(location.href);u.searchParams.set('_nc',Date.now());location.replace(u.toString())}).catch(function(){location.reload()})}else{location.reload()}}window.addEventListener('error',function(e){if(e.message&&(e.message.includes('ChunkLoadError')||e.message.includes('Loading chunk')||e.message.includes('Failed to fetch dynamically imported module')||e.message.includes('Script error.'))){ffr()}});window.addEventListener('unhandledrejection',function(e){var m=e.reason&&e.reason.message?e.reason.message:'';if(m&&(m.includes('ChunkLoadError')||m.includes('Loading chunk')||m.includes('Failed to fetch dynamically imported module'))){ffr()}});`,
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
                <ParticlesBackground />
                <GlowingParticles />
                {children}
                {isDraftMode && <VisualEditing />}
                <Toaster />
                {!isDraftMode && <WhatsAppButton />}
                {!isDraftMode && <MobileBottomBar />}
                <ScreenRecordButton />
              </AuthProvider>
            </SiteSettingsProvider>
          </ThemeColorsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}