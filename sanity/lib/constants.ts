// @ts-nocheck
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Academia El Profe Oficial";
export const STUDIO_TITLE = `${COMPANY_NAME} — CMS`;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://academiaelprofeoficial.com");
export const BRAND_COLORS = { primary: "#10b981", accent: "#059669", dark: "#064e3b" } as const;