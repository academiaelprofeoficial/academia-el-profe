import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize a hex color string — strips invisible Unicode chars
 * (zero-width spaces, BOM, joiners, etc.) that corrupt CSS values.
 * Returns a clean 7-char hex like "#3B82F6" or the fallback.
 */
export function sanitizeHex(raw: string | undefined | null, fallback = '#10B981'): string {
  if (!raw) return fallback;
  // Strip everything that isn't 0-9, a-f, A-F, or #
  const clean = raw.replace(/[^0-9a-fA-F#]/g, '').replace(/^#/, '');
  // Must be exactly 6 hex chars
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return `#${clean.toUpperCase()}`;
  return fallback;
}
