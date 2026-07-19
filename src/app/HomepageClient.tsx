'use client';

// ============================================================
// Homepage Client — Landing Page PRO
// Hero, universidades, UTP spotlight, beneficios, testimonios, estadísticas
// ✅ Framer Motion + GSAP animations (21st.dev inspired)
// ✅ Dark mode surface system with ambient glow
// ✅ UTP section with animated card → /dashboard/cursos/utp
// ✅ Section Deep Linking, Scroll Spy, Sanity CMS
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  GraduationCap,
  Monitor,
  Shield,
  Clock,
  Smartphone,
  PlayCircle,
  FileText,
  ArrowRight,
  BookOpen,
  Star,
  Zap,
  Users,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useParallax } from '@/lib/animations';
import { MATERIAS } from '@/lib/data';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { plainText, getImageUrl, urlFor } from '@/lib/sanity.client';
import type { SanityHeroSlide, SanityStat, SanityPartner, SanityTestimonial, SanitySiteSettings } from '@/lib/sanity.client';
import { LightningBackground } from '@/components/LightningBackground';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SanityData {
  heroSlides: SanityHeroSlide[] | null;
  stats: SanityStat[] | null;
  partners: SanityPartner[] | null;
  testimonials: SanityTestimonial[] | null;
  siteSettings: SanitySiteSettings | null;
}

interface Props {
  sanityData?: SanityData;
}

const SECTION_IDS = ['hero', 'universidades', 'utp', 'numeros', 'redes', 'clientes', 'beneficios'] as const;

/* ------------------------------------------------------------------ */
/*  Counter animation hook                                              */
/* ------------------------------------------------------------------ */
import { useState } from 'react';

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Stat Card — Enhanced with GSAP number morph                        */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, prefix, suffix, icon }: { label: string; value: number; prefix?: string | null; suffix?: string | null; icon?: string | null }) {
  const { count, ref } = useCountUp(value);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.5 });

  const iconMap: Record<string, React.ReactNode> = {
    'users': <Users className="h-6 w-6" />,
    'book-open': <BookOpen className="h-6 w-6" />,
    'graduation-cap': <GraduationCap className="h-6 w-6" />,
    'award': <Trophy className="h-6 w-6" />,
  };

  return (
    <motion.div
      ref={cardRef}
      className="text-center p-5 sm:p-6 rounded-2xl bg-white dark:bg-[var(--surface-2)] border border-slate-100 dark:border-[var(--surface-border)] card-glow premium-card-shimmer"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div ref={ref} className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-primary-bg text-brand-primary-text mb-3">
        {icon && iconMap[icon] || <GraduationCap className="h-6 w-6" />}
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-brand-heading mb-1">
        {prefix || ''}{count}{suffix || ''}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonial Card — Spotlight effect                                */
/* ------------------------------------------------------------------ */
function TestimonialCard({ testimonial }: { testimonial: SanityTestimonial }) {
  return (
    <motion.div
      className="bg-white dark:bg-[var(--surface-2)] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-[var(--surface-border)] flex flex-col spotlight-card card-glow"
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-brand-body dark:text-slate-300 text-sm leading-relaxed flex-1 mb-4">
        &ldquo;{plainText(testimonial.quote)}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-[var(--surface-border)]">
        <div className="h-10 w-10 rounded-full bg-brand-primary-bg flex items-center justify-center text-brand-primary-text font-bold text-sm">
          {testimonial.authorName?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-semibold text-sm text-brand-heading">{testimonial.authorName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">{testimonial.authorRole}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  HeroImageParallax — Enhanced with GSAP tilt                        */
/* ------------------------------------------------------------------ */
function HeroImageParallax({ className, desktopWidth, desktopHeight, desktopMaxW }: {
  className?: string;
  desktopWidth: number;
  desktopHeight: number;
  desktopMaxW: string;
}) {
  const parallaxRef = useParallax<HTMLDivElement>({ speed: -0.1 });
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, 
        { rotateY: -5, rotateX: 3 },
        { 
          rotateY: 5, rotateX: -3,
          ease: 'sine.inOut',
          duration: 4,
          repeat: -1,
          yoyo: true,
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={parallaxRef} className={className}>
      <div ref={imgRef} style={{ perspective: '1000px' }}>
        <Image
          src="/images/hero-profesor.webp"
          alt="Academia El Profe - Logo Oficial"
          width={desktopWidth}
          height={desktopHeight}
          className={`w-full ${desktopMaxW} mx-auto object-contain drop-shadow-2xl dark:drop-shadow-[0_0_40px_rgba(52,211,153,0.3)]`}
          priority
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GSAP Text Reveal Hook                                              */
/* ------------------------------------------------------------------ */
function useGSAPTextReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll('.reveal-word');
    if (words.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(words, { y: 40, opacity: 0, rotateX: -40 });
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(words, {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ------------------------------------------------------------------ */
/*  Magnetic Button (21st.dev style)                                   */
/* ------------------------------------------------------------------ */
function MagneticButton({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  UTP Image Section — Two full-bleed images                          */
/* ------------------------------------------------------------------ */
function UTPSection() {
  return (
    <section className="py-0 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 sm:gap-6">
          <div className="flex-1 w-full">
            <img
              src="/images/1.webp"
              alt="Cursos UTP"
              className="w-full h-auto object-contain block"
              loading="lazy"
            />
          </div>
          <div className="flex-1 w-full">
            <img
              src="/images/2.webp"
              alt="Cursos UTP"
              className="w-full h-auto object-contain block"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Social Media Section — Ultra Professional                          */
/* ------------------------------------------------------------------ */

const SOCIAL_LINKS = [
  {
    name: 'TikTok',
    handle: '@academiaelprofe20',
    url: 'https://www.tiktok.com/@academiaelprofe20?_r=1&_t=ZS-97oVpcWj285',
    glowColor: 'rgba(255, 0, 80, 0.5)',
    borderColor: 'border-[#ff0050]/20',
    hoverBorder: 'hover:border-[#ff0050]/50',
    iconBg: 'bg-gradient-to-br from-[#25f4ee] to-[#fe2c55]',
    iconShadow: 'shadow-[0_0_30px_rgba(255,0,80,0.4)]',
    hoverGlow: 'group-hover:shadow-[0_0_50px_rgba(255,0,80,0.6)]',
    tagColor: 'text-[#ff0050]',
    tagBg: 'bg-[#ff0050]/10',
    description: 'Clases cortas, tips de ingeniería y contenido educativo que no encuentras en ningún lado.',
    ctaLabel: 'Ver en TikTok',
  },
  {
    name: 'Facebook',
    handle: 'Academia El Profe',
    url: 'https://www.facebook.com/share/1KcKtAFkzV/?mibextid=wwXIfr',
    glowColor: 'rgba(24, 119, 242, 0.5)',
    borderColor: 'border-[#1877F2]/20',
    hoverBorder: 'hover:border-[#1877F2]/50',
    iconBg: 'bg-gradient-to-br from-[#1877F2] to-[#0d47a1]',
    iconShadow: 'shadow-[0_0_30px_rgba(24,119,242,0.4)]',
    hoverGlow: 'group-hover:shadow-[0_0_50px_rgba(24,119,242,0.6)]',
    tagColor: 'text-[#1877F2]',
    tagBg: 'bg-[#1877F2]/10',
    description: 'Comunidad de estudiantes, anuncios de nuevos cursos y contenido exclusivo para seguidores.',
    ctaLabel: 'Seguir en Facebook',
  },
];

function TikTokIconPro({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38.16 8.38a10.58 10.58 0 01-7.34-4.8V3h-7.4v29.42a6.2 6.2 0 01-6.2 5.58 6.2 6.2 0 01-6.2-6.2 6.2 6.2 0 016.2-6.2c.64 0 1.24.1 1.82.26v-7.54a13.64 13.64 0 00-1.82-.12A13.74 13.74 0 003.8 31.82 13.74 13.74 0 0017.54 45.56c7.6 0 13.74-6.14 13.74-13.74V18.6a17.9 17.9 0 009.72 2.84v-7.4a10.5 10.5 0 01-2.84-5.66z" fill="white"/>
    </svg>
  );
}

function FacebookIconPro({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708v-16.77h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.626 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.978 48 24z" fill="white"/>
    </svg>
  );
}

function SocialCard({ social, index }: { social: typeof SOCIAL_LINKS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const Icon = social.name === 'TikTok' ? TikTokIconPro : FacebookIconPro;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative block rounded-2xl border ${social.borderColor} ${social.hoverBorder}
          bg-white dark:bg-[var(--surface-2)] p-6 sm:p-8 transition-all duration-500
          hover:-translate-y-2 ${social.hoverGlow}
          shadow-lg hover:shadow-2xl`}
      >
        {/* Glow orb background effect */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none"
          style={{ backgroundColor: social.glowColor }}
        />

        {/* Top: Icon + Name */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl ${social.iconBg} flex items-center justify-center
                ${social.iconShadow} group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-brand-heading">{social.name}</h3>
              <p className={`text-sm ${social.tagColor} font-medium`}>{social.handle}</p>
            </div>
          </div>
          <div className={`h-10 w-10 rounded-full ${social.tagBg} flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2`}>
            <ExternalLink className={`h-4 w-4 ${social.tagColor}`} />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 relative z-10">
          {social.description}
        </p>

        {/* CTA */}
        <div className="relative z-10">
          <span className={`inline-flex items-center gap-2 text-sm font-bold ${social.tagColor} group-hover:gap-3 transition-all duration-300`}>
            {social.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        {/* Bottom decorative gradient bar */}
        <div className={`absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#ff0050] via-[#fe2c55] to-[#25f4ee] opacity-30 group-hover:opacity-80 transition-opacity duration-500 rounded-full`} />
      </a>
    </motion.div>
  );
}

function SocialMediaSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="redes" ref={ref} className="py-14 lg:py-20 scroll-mt-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/80 to-white dark:from-[var(--surface-0)] dark:via-[var(--surface-1)] dark:to-[var(--surface-0)] pointer-events-none" />
      <div className="absolute top-10 left-[15%] w-64 h-64 bg-[#ff0050]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-[15%] w-64 h-64 bg-[#1877F2]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-brand-primary-bg-light dark:bg-brand-primary-bg px-4 py-1.5 rounded-full text-sm font-semibold text-brand-primary-text mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Zap className="h-4 w-4" />
            NUESTRAS REDES SOCIALES
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-heading mb-3">
            Únete a Nuestra{' '}
            <span className="bg-gradient-to-r from-[#ff0050] via-[#fe2c55] to-[#25f4ee] bg-clip-text text-transparent">
              Comunidad
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Síguenos en redes sociales para obtener contenido exclusivo, tips de estudio y ser el primero en enterarte de nuevos cursos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {SOCIAL_LINKS.map((social, idx) => (
            <SocialCard key={social.name} social={social} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export function HomepageClient({ sanityData }: Props) {
  const { activeId: activeHash } = useScrollSpy(SECTION_IDS);
  const siteSettings = useSiteSettings();

  // Hero background video
  const heroVideoUrl = siteSettings?.heroVideo?.asset?.url || siteSettings?.heroVideoUrl;
  const heroOverlay = (siteSettings?.heroVideoOverlay ?? 60) / 100;

  const partners = sanityData?.partners?.length ? sanityData.partners : null;
  const stats = sanityData?.stats?.length ? sanityData.stats : null;
  const testimonials = sanityData?.testimonials?.length ? sanityData.testimonials : null;
  const heroSlides = sanityData?.heroSlides?.length ? sanityData.heroSlides : null;
  const currentSlide = heroSlides?.[0];

  // Lightning visible en todos los tamanos
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // GSAP stagger for hero benefits
  const benefitsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const textRevealRef = useGSAPTextReveal();

  useEffect(() => {
    const el = benefitsRef.current;
    if (!el) return;
    const items = el.querySelectorAll('.benefit-item');
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { x: -30, opacity: 0 });
      gsap.to(items, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        delay: 0.6,
        ease: 'power3.out',
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // GSAP hero title character animation
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const title = el.querySelector('.hero-title-animated');
    if (!title) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(title, 
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  // Stagger container variants (Framer Motion)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[var(--surface-0)] scroll-smooth">
      <LandingHeader />

      {/* ============================================================ */}
      {/* HERO SECTION — GSAP + Framer Motion */}
      {/* ============================================================ */}
      <section id="hero" ref={heroRef} className="min-h-screen scroll-mt-16 relative overflow-hidden flex items-center justify-center">
        {/* Lightning WebGL background — solo dark mode */}
        {isDark && (
          <div className="absolute inset-0 z-0 transition-opacity duration-500"
            style={{ opacity: 0.5 }}
          >
            <LightningBackground hue={155} speed={1.4} intensity={0.5} size={2.5} />
          </div>
        )}
        {/* Gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 z-10 pointer-events-none"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, transparent, rgb(2,6,23))'
              : 'linear-gradient(to bottom, transparent, rgb(248,250,252))'
          }}
        />
        {heroVideoUrl && (
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.7)' }}>
              <source src={heroVideoUrl} type="video/mp4" />
              <source src={heroVideoUrl} type="video/webm" />
            </video>
            <div className="absolute inset-0 bg-black" style={{ opacity: heroOverlay }} />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 items-center gap-8 lg:gap-6">
            {/* Columna izquierda — Texto */}
            <div className="space-y-6 lg:col-span-2">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
                className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-brand-primary/20"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  ✨
                </motion.span>
                <span>BIENVENIDO A</span>
              </motion.div>

              {/* Título */}
              <div className="hero-title-animated">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                  {currentSlide?.title ? (
                    <span className="text-brand-heading">{currentSlide.title}</span>
                  ) : (
                    <>
                      <span className="text-brand-heading">ACADEMIA</span>{' '}
                      <span className="gradient-text-emerald">EL PROFE</span>
                    </>
                  )}
                </h1>
              </div>

              {/* Subtítulo */}
              <motion.p
                className="text-lg text-slate-600 dark:text-slate-400 font-medium"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {currentSlide ? plainText(currentSlide.subtitle) : 'Clases grabadas de:'}
              </motion.p>

              {/* Badges de materias — Stagger */}
              <motion.div
                className="flex flex-wrap gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {MATERIAS.map((materia) => (
                  <motion.span
                    key={materia.nombre}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-1.5 bg-brand-primary-bg-light dark:bg-brand-primary-bg text-brand-primary-text px-3 py-1.5 rounded-full text-sm font-medium cursor-default border border-transparent dark:border-[var(--surface-border)]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {materia.nombre}
                  </motion.span>
                ))}
              </motion.div>

              {/* Beneficios — GSAP staggered */}
              <div ref={benefitsRef} className="space-y-3">
                <div className="benefit-item flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-primary-bg flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="h-4 w-4 text-brand-primary-text" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-heading">
                      {stats?.[0] ? `Más de ${stats[0].prefix || ''}${stats[0].value}${stats[0].suffix || ''} estudiantes` : 'Más de 500 estudiantes'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ya están aprendiendo con nosotros</p>
                  </div>
                </div>
                <div className="benefit-item flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-primary-bg flex items-center justify-center shrink-0 mt-0.5">
                    <Monitor className="h-4 w-4 text-brand-primary-text" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-heading">Clases grabadas disponibles 24/7</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Accede cuando quieras y donde quieras</p>
                  </div>
                </div>
                <div className="benefit-item flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-primary-bg flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="h-4 w-4 text-brand-primary-text" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-heading">Acceso inmediato</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Después de tu pago</p>
                  </div>
                </div>
              </div>

              {/* CTA — Magnetic Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Link href={currentSlide?.ctaLink || '/cursos'} className="block">
                  <MagneticButton className="w-full md:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white dark:text-brand-button-text font-bold text-base px-8 py-3.5 rounded-xl gap-2 transition-all inline-flex items-center justify-center shadow-xl shadow-brand-primary/20 dark:shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.5)] dark:hover:shadow-[0_0_50px_rgba(52,211,153,0.6)]">
                    <BookOpen className="h-5 w-5" />
                    {currentSlide?.ctaLabel || 'VER CURSOS'}
                    <ArrowRight className="h-5 w-5" />
                  </MagneticButton>
                </Link>
              </motion.div>
            </div>

            {/* Columna derecha — Profesor */}
            <motion.div
              className="hidden md:flex items-center justify-center lg:col-span-3"
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroImageParallax desktopWidth={560} desktopHeight={660} desktopMaxW="max-w-[560px]" />
            </motion.div>
            <motion.div
              className="flex md:hidden items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <HeroImageParallax desktopWidth={320} desktopHeight={380} desktopMaxW="max-w-[320px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* UNIVERSIDADES — Scroll animated */}
      {/* ============================================================ */}
      <section id="universidades" className="py-12 lg:py-16 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Cursos especializados para estudiantes de:
          </motion.p>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 items-center justify-items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {partners && partners.filter((p) => p.abbreviation !== 'USS').map((p) => {
              const logoUrl = p.logo?.asset
                ? urlFor(p.logo).width(300).fit('max').url()
                : null;
              return (
                <motion.div
                  key={p._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.08 }}
                  className="flex items-center justify-center p-2"
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt={p.name} className="w-auto h-auto max-w-full" style={{ maxHeight: '80px', width: 'auto', height: 'auto' }} />
                  ) : (
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                      {p.abbreviation || p.name}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* UTP SPOTLIGHT — New Section */}
      {/* ============================================================ */}
      <UTPSection />

      {/* ============================================================ */}
      {/* ESTADÍSTICAS */}
      {/* ============================================================ */}
      {stats && stats.length > 0 && (
        <section id="numeros" className="py-12 lg:py-16 scroll-mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-2xl sm:text-3xl font-extrabold text-center text-brand-heading mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Nuestros Números
            </motion.h2>
            <motion.p
              className="text-center text-slate-500 dark:text-slate-400 mb-10"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              La confianza de cientos de estudiantes nos respalda
            </motion.p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatCard
                  key={stat._id}
                  label={stat.label}
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  icon={stat.icon}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* REDES SOCIALES */}
      {/* ============================================================ */}
      <SocialMediaSection />

      {/* ============================================================ */}
      {/* TESTIMONIOS */}
      {/* ============================================================ */}
      {testimonials && testimonials.length > 0 && (
        <section id="clientes" className="py-12 lg:py-16 bg-slate-50/50 dark:bg-[var(--surface-1)] scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-2xl sm:text-3xl font-extrabold text-center text-brand-heading mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Lo que dicen nuestros estudiantes
            </motion.h2>
            <motion.p
              className="text-center text-slate-500 dark:text-slate-400 mb-10"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Resultados reales de estudiantes como tú
            </motion.p>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {testimonials.map((t) => (
                <motion.div key={t._id} variants={itemVariants}>
                  <TestimonialCard testimonial={t} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* FOOTER DE BENEFICIOS */}
      {/* ============================================================ */}
      <section id="beneficios" className="bg-brand-primary-darkest py-6 lg:py-8 scroll-mt-16 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-darkest via-transparent to-brand-primary-darkest pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              { icon: PlayCircle, title: 'Clases 100% Grabadas', sub: 'Acceso ilimitado' },
              { icon: FileText, title: 'Material en PDF', sub: 'Descargable' },
              { icon: Clock, title: 'Aprende a tu ritmo', sub: 'Sin horarios fijos' },
              { icon: Smartphone, title: 'Acceso desde cualquier dispositivo', sub: 'PC, tablet y celular' },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ring-1 ring-white/20 dark:ring-brand-primary/30 dark:shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                  <item.icon className="h-5 w-5 text-brand-primary-light-text dark:text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white dark:text-white">{item.title}</p>
                  <p className="text-xs text-brand-primary-light-text dark:text-brand-primary-light-text">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}