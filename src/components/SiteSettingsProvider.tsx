'use client';

import { createContext, useContext, useMemo } from 'react';
import type { SanitySiteSettings } from '@/lib/sanity.client';

const SiteSettingsContext = createContext<SanitySiteSettings | null>(null);

export function useSiteSettings(): SanitySiteSettings | null {
  return useContext(SiteSettingsContext);
}

export function SiteSettingsProvider({
  siteSettings,
  children,
}: {
  siteSettings: SanitySiteSettings | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => siteSettings, [siteSettings]);
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}