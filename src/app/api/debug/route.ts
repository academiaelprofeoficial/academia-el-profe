import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

// ============================================================
// /api/debug — Diagnostic Endpoint
// Returns JSON with: Sanity connection, env vars (masked),
// sample course data, cache info, webhook status.
// Open in browser to see what's failing.
// ============================================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
  };

  // ---- 1. ENV VARS (masked) ----
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;
  const apiReadToken = process.env.SANITY_API_READ_TOKEN;

  results.env = {
    NEXT_PUBLIC_SANITY_PROJECT_ID: projectId ? `${projectId.slice(0, 4)}***` : "❌ NOT SET",
    NEXT_PUBLIC_SANITY_DATASET: dataset || "❌ NOT SET (defaults to production)",
    SANITY_REVALIDATE_SECRET: revalidateSecret ? "✅ SET" : "❌ NOT SET — webhook will reject all requests",
    SANITY_API_READ_TOKEN: apiReadToken ? `✅ SET (${apiReadToken.slice(0, 6)}***)` : "⚠️ NOT SET (draft mode won't work)",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "❌ NOT SET",
    NEXT_PUBLIC_FIREBASE_...: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ SET" : "❌ NOT SET",
  };

  // ---- 2. SANITY CONNECTION TEST ----
  if (projectId) {
    try {
      const client = createClient({
        projectId,
        dataset: dataset || "production",
        apiVersion: "2025-01-01",
        useCdn: false, // bypass CDN to get live data
      });

      // Quick query to test connection
      const start = Date.now();
      const testData = await client.fetch<{
        allCourses: Array<{ _id: string; title: string; slug: { current: string }; cardColor: string; group: string }>;
        siteSettings: Array<{ _id: string; companyName: string }>;
      }>(`{
        "allCourses": *[_type == "course" && !hidden] | order(order asc) {
          _id,
          title,
          "slug": slug.current,
          cardColor,
          group
        }[0..5],
        "siteSettings": *[_type == "siteSettings"][0] {
          _id,
          companyName
        }
      }`);
      const latency = Date.now() - start;

      results.sanity = {
        status: "✅ CONNECTED",
        latency_ms: latency,
        useCdn: false,
        perspective: "published",
        courseCount: testData.allCourses?.length || 0,
        courses: (testData.allCourses || []).map((c) => ({
          title: c.title,
          slug: c.slug?.current,
          cardColor: c.cardColor,
          cardColorClean: c.cardColor?.replace(/[^0-9a-fA-F#]/g, ""),
          cardColorHasInvisible: c.cardColor !== c.cardColor?.replace(/[^0-9a-fA-F#]/g, ""),
          group: c.group,
        })),
        siteSettings: testData.siteSettings?.companyName || "❌ NOT FOUND",
      };
    } catch (err: unknown) {
      results.sanity = {
        status: "❌ CONNECTION FAILED",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } else {
    results.sanity = { status: "❌ SKIPPED — no project ID" };
  }

  // ---- 3. WEBHOOK STATUS ----
  results.webhook = {
    endpoint: "/api/webhook/sanity",
    secretConfigured: !!revalidateSecret,
    instructions: revalidateSecret
      ? "Webhook secret is set. Verify the webhook is configured in Sanity Dashboard → Settings → API → Webhooks."
      : "⚠️ SANITY_REVALIDATE_SECRET is not set. Add it to .env and configure the webhook in Sanity.",
    sanityWebhookUrl: "https://www.academiaelprofeoficial.com/api/webhook/sanity",
    howToFix: "Go to https://www.sanity.io/manage → your project → API → Webhooks → Create new webhook → URL: https://www.academiaelprofeoficial.com/api/webhook/sanity",
  };

  // ---- 4. CACHE INFO ----
  results.cache = {
    fetchCMS_uses: "next: { tags: ['sanity'] } — cached until webhook revalidates",
    problem: "If the Sanity webhook is NOT configured or NOT firing, the cache NEVER expires",
    fix: "Either (A) configure the Sanity webhook, or (B) set revalidate: 60 for 60s auto-refresh",
  };

  // ---- 5. QUICK FIX: Force revalidate button ----
  results.action = {
    message: "Open /api/debug/revalidate to force purge cache NOW",
  };

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}