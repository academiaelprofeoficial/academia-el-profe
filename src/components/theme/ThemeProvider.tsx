'use client';

// ============================================================
// Proveedor de Tema — Academia El Profe Oficial
// Envuelve la aplicación con next-themes para soporte
// claro/oscuro con persistencia en localStorage.
// ============================================================

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}