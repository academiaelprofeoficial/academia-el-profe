'use client';

// ============================================================
// ThemeColorsProvider — Dynamic CMS-driven color system
// Fetches theme colors from Sanity and injects CSS variables
// into :root. SSR-safe: uses useEffect for DOM manipulation.
// Falls back to default green academy theme if no CMS data.
// ============================================================

import { useEffect, useRef } from 'react';
import { sanityClient } from '@/lib/sanity.client';
import { THEME_SETTINGS_QUERY } from '@/lib/sanity.queries';
import type { SanityThemeSettings, SanityThemeColors } from '@/lib/sanity.client';

/** Default theme values (Green Academy — matches current emerald theme) */
const DEFAULT_THEME = {
  primaryColor: '#10B981',
  primaryHoverColor: '#059669',
  headingColor: '#1E293B',
  textColor: '#475569',
  linkColor: '#059669',
  buttonColor: '#10B981',
  buttonHoverColor: '#059669',
  buttonTextColor: '#FFFFFF',
  secondaryColor: '#3B82F6',
};

/** Preset themes for quick selection */
const THEME_PRESETS: Record<string, Record<string, string>> = {
  'green-academy': {
    primaryColor: '#10B981', primaryHoverColor: '#059669',
    headingColor: '#1E293B', textColor: '#475569', linkColor: '#059669',
    buttonColor: '#10B981', buttonHoverColor: '#059669',
    buttonTextColor: '#FFFFFF', secondaryColor: '#3B82F6',
  },
  'blue-corporate': {
    primaryColor: '#3B82F6', primaryHoverColor: '#2563EB',
    headingColor: '#0F172A', textColor: '#475569', linkColor: '#2563EB',
    buttonColor: '#3B82F6', buttonHoverColor: '#2563EB',
    buttonTextColor: '#FFFFFF', secondaryColor: '#8B5CF6',
  },
  'red-premium': {
    primaryColor: '#EF4444', primaryHoverColor: '#DC2626',
    headingColor: '#1E293B', textColor: '#475569', linkColor: '#DC2626',
    buttonColor: '#EF4444', buttonHoverColor: '#DC2626',
    buttonTextColor: '#FFFFFF', secondaryColor: '#F59E0B',
  },
  'purple-education': {
    primaryColor: '#8B5CF6', primaryHoverColor: '#7C3AED',
    headingColor: '#1E1B4B', textColor: '#4C4675', linkColor: '#7C3AED',
    buttonColor: '#8B5CF6', buttonHoverColor: '#7C3AED',
    buttonTextColor: '#FFFFFF', secondaryColor: '#EC4899',
  },
  'dark-elegant': {
    primaryColor: '#A78BFA', primaryHoverColor: '#8B5CF6',
    headingColor: '#F8FAFC', textColor: '#CBD5E1', linkColor: '#C4B5FD',
    buttonColor: '#8B5CF6', buttonHoverColor: '#7C3AED',
    buttonTextColor: '#FFFFFF', secondaryColor: '#F472B6',
  },
};

/** Default CSS variable values (Green Academy — matches current emerald theme) */
const DEFAULTS = {
  '--brand-primary': '#10B981',
  '--brand-primary-hover': '#059669',
  '--brand-primary-text': '#065F46',
  '--brand-primary-bg': '#D1FAE5',
  '--brand-primary-bg-light': '#ECFDF5',
  '--brand-primary-darkest': '#064E3B',
  '--brand-primary-light-text': '#6EE7B7',
  '--brand-heading': '#1E293B',
  '--brand-heading-secondary': '#334155',
  '--brand-body': '#475569',
  '--brand-link': '#059669',
  '--brand-button': '#10B981',
  '--brand-button-hover': '#059669',
  '--brand-button-text': '#FFFFFF',
  '--brand-secondary': '#3B82F6',
};

/** Dark mode overrides */
const DARK_DEFAULTS = {
  '--brand-primary': '#34D399',
  '--brand-primary-hover': '#10B981',
  '--brand-primary-text': '#6EE7B7',
  '--brand-primary-bg': 'rgba(16, 185, 129, 0.15)',
  '--brand-primary-bg-light': 'rgba(16, 185, 129, 0.08)',
  '--brand-primary-darkest': '#022C22',
  '--brand-primary-light-text': '#A7F3D0',
  '--brand-heading': '#F8FAFC',
  '--brand-heading-secondary': '#E2E8F0',
  '--brand-body': '#CBD5E1',
  '--brand-link': '#34D399',
  '--brand-button': '#34D399',
  '--brand-button-hover': '#10B981',
  '--brand-button-text': '#022C22',
  '--brand-secondary': '#60A5FA',
};

/**
 * Convert hex color to HSL for generating light/dark variants
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 50 };
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToString(h: number, s: number, l: number, a: number = 1): string {
  if (a < 1) return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Generate derived color variants from a primary hex color.
 * Returns CSS variable map for :root (light mode).
 */
function generateColorVars(colors: SanityThemeColors): Record<string, string> {
  const primary = colors.primaryColor || DEFAULT_THEME.primaryColor;
  const hover = colors.primaryHoverColor || DEFAULT_THEME.primaryHoverColor;
  const { h, s } = hexToHSL(primary);

  return {
    '--brand-primary': primary,
    '--brand-primary-hover': hover,
    // Dark text variant for on light backgrounds
    '--brand-primary-text': colors.linkColor || hslToString(h, Math.min(s + 10, 100), 30),
    // Light background variants
    '--brand-primary-bg': hslToString(h, s, 90),
    '--brand-primary-bg-light': hslToString(h, s, 96),
    // Darkest variant (footer/benefit bars)
    '--brand-primary-darkest': hslToString(h, Math.min(s + 10, 100), 15),
    // Light text on dark backgrounds
    '--brand-primary-light-text': hslToString(h, s, 75),
    // Semantic colors from CMS
    '--brand-heading': colors.headingColor || DEFAULT_THEME.headingColor,
    '--brand-heading-secondary': hslToString(hexToHSL(colors.headingColor || DEFAULT_THEME.headingColor).h, 20, 35),
    '--brand-body': colors.textColor || DEFAULT_THEME.textColor,
    '--brand-link': colors.linkColor || colors.primaryHoverColor || DEFAULT_THEME.linkColor,
    '--brand-button': colors.buttonColor || primary,
    '--brand-button-hover': colors.buttonHoverColor || hover,
    '--brand-button-text': colors.buttonTextColor || DEFAULT_THEME.buttonTextColor,
    '--brand-secondary': colors.secondaryColor || DEFAULT_THEME.secondaryColor,
  };
}

/**
 * Generate dark mode color variants.
 */
function generateDarkColorVars(colors: SanityThemeColors): Record<string, string> {
  const primary = colors.primaryColor || DEFAULT_THEME.primaryColor;
  const hover = colors.primaryHoverColor || DEFAULT_THEME.primaryHoverColor;
  const { h, s } = hexToHSL(primary);

  return {
    '--brand-primary': hslToString(h, Math.min(s, 90), 65),
    '--brand-primary-hover': hslToString(h, Math.min(s, 90), 55),
    '--brand-primary-text': hslToString(h, Math.min(s, 85), 75),
    '--brand-primary-bg': hslToString(h, s, 50, 0.15),
    '--brand-primary-bg-light': hslToString(h, s, 50, 0.08),
    '--brand-primary-darkest': hslToString(h, Math.min(s + 10, 100), 10),
    '--brand-primary-light-text': hslToString(h, Math.min(s, 85), 82),
    // Heading and text for dark mode
    '--brand-heading': colors.headingColor
      ? hslToString(hexToHSL(colors.headingColor).h, 15, 95)
      : '#F8FAFC',
    '--brand-heading-secondary': colors.headingColor
      ? hslToString(hexToHSL(colors.headingColor).h, 10, 85)
      : '#E2E8F0',
    '--brand-body': colors.textColor
      ? hslToString(hexToHSL(colors.textColor).h, 10, 75)
      : '#CBD5E1',
    '--brand-link': hslToString(h, Math.min(s, 85), 65),
    '--brand-button': hslToString(h, Math.min(s, 90), 65),
    '--brand-button-hover': hslToString(h, Math.min(s, 90), 55),
    '--brand-button-text': hslToString(h, Math.min(s + 10, 100), 10),
    '--brand-secondary': colors.secondaryColor
      ? hslToString(hexToHSL(colors.secondaryColor).h, Math.min(s, 85), 70)
      : '#60A5FA',
  };
}

interface ThemeColorsProviderProps {
  themeData?: SanityThemeSettings | null;
  children: React.ReactNode;
}

export function ThemeColorsProvider({ themeData, children }: ThemeColorsProviderProps) {
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const darkStyleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Resolve colors: CMS data → preset fallback → hard defaults
    const preset = themeData?.preset || 'green-academy';
    const cmsColors = themeData?.colorsSection;
    const presetData = THEME_PRESETS[preset];
    const presetColors: SanityThemeColors = presetData
      ? {
          primaryColor: presetData.primaryColor,
          primaryHoverColor: presetData.primaryHoverColor,
          headingColor: presetData.headingColor,
          textColor: presetData.textColor,
          linkColor: presetData.linkColor,
          buttonColor: presetData.buttonColor,
          buttonHoverColor: presetData.buttonHoverColor,
          buttonTextColor: presetData.buttonTextColor,
          secondaryColor: presetData.secondaryColor,
        }
      : {};

    // Merge: CMS individual colors override preset colors
    const resolvedColors: SanityThemeColors = {
      ...presetColors,
      ...cmsColors,
    };

    const lightVars = generateColorVars(resolvedColors);
    const darkVars = generateDarkColorVars(resolvedColors);

    // Create or update light mode style tag
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.id = 'cms-theme-light';
      document.head.appendChild(style);
      styleRef.current = style;
    }

    const lightCSS = `:root {\n${Object.entries(lightVars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}`;
    styleRef.current.textContent = lightCSS;

    // Create or update dark mode style tag
    if (!darkStyleRef.current) {
      const style = document.createElement('style');
      style.id = 'cms-theme-dark';
      document.head.appendChild(style);
      darkStyleRef.current = style;
    }

    const darkCSS = `.dark {\n${Object.entries(darkVars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}`;
    darkStyleRef.current.textContent = darkCSS;

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
      if (darkStyleRef.current) {
        darkStyleRef.current.remove();
        darkStyleRef.current = null;
      }
    };
  }, [themeData]);

  return <>{children}</>;
}