'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/*  useScrollReveal                                                    */
/*  Animates a ref element when it enters the viewport via ScrollTrigger */
/* ------------------------------------------------------------------ */

interface ScrollRevealOptions {
  /** Animation direction */
  from?: { y?: number; x?: number; opacity?: number; scale?: number };
  to?: { y?: number; x?: number; opacity?: number; scale?: number };
  /** Delay in seconds */
  delay?: number;
  /** ScrollTrigger start position (default: "top 85%") */
  start?: string;
  /** Toggle actions (default: "play none none none") */
  toggleActions?: string;
  /** Duration in seconds (default: 0.8) */
  duration?: number;
  /** Ease function (default: "power3.out") */
  ease?: string;
  /** Markers for debugging */
  markers?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    from = { y: 40, opacity: 0 },
    to = { y: 0, opacity: 1 },
    delay = 0,
    start = 'top 85%',
    toggleActions = 'play none none none',
    duration = 0.8,
    ease = 'power3.out',
    markers = false,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial state
    gsap.set(el, from);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      toggleActions,
      onEnter: () => {
        gsap.to(el, {
          ...to,
          duration,
          delay,
          ease,
        });
      },
      markers,
    });

    return () => {
      trigger.kill();
    };
  }, [from, to, delay, start, toggleActions, duration, ease, markers]);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  useStaggerChildren                                                 */
/*  Staggers animation on child elements of a container                */
/* ------------------------------------------------------------------ */

interface StaggerChildrenOptions {
  /** CSS selector for children (default: "> *") */
  childSelector?: string;
  /** Stagger delay between each child (default: 0.1) */
  stagger?: number;
  /** ScrollTrigger start position (default: "top 85%") */
  start?: string;
  /** Duration per child (default: 0.7) */
  duration?: number;
  /** Delay before first child (default: 0) */
  delay?: number;
  /** Ease function (default: "power3.out") */
  ease?: string;
  /** Y offset for from state (default: 30) */
  y?: number;
  /** Initial opacity (default: 0) */
  fromOpacity?: number;
}

export function useStaggerChildren<T extends HTMLElement = HTMLDivElement>(
  options: StaggerChildrenOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    childSelector = '> *',
    stagger = 0.1,
    start = 'top 85%',
    duration = 0.7,
    delay = 0,
    ease = 'power3.out',
    y = 30,
    fromOpacity = 0,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.querySelectorAll(childSelector);
    if (children.length === 0) return;

    // Set initial state on all children
    gsap.set(children, { y, opacity: fromOpacity });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to(children, {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease,
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [childSelector, stagger, start, duration, delay, ease, y, fromOpacity]);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  useParallax                                                        */
/*  Subtle parallax effect on scroll for a ref element                 */
/* ------------------------------------------------------------------ */

interface ParallaxOptions {
  /** Speed multiplier (default: -0.15). Negative = moves up. */
  speed?: number;
  /** ScrollTrigger start (default: "top bottom") */
  start?: string;
  /** ScrollTrigger end (default: "bottom top") */
  end?: string;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
) {
  const ref = useRef<T>(null);
  const { speed = -0.15, start = 'top bottom', end = 'bottom top' } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const distance = Math.abs(speed) * 100;

    const tween = gsap.fromTo(
      el,
      { y: speed > 0 ? -distance : distance },
      {
        y: speed > 0 ? distance : -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed, start, end]);

  return ref;
}