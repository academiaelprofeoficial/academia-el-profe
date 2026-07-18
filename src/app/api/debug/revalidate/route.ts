import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// ============================================================
// /api/debug/revalidate — Force purge all Sanity cache
// Call this from browser to immediately refresh all CMS data.
// Usage: Open https://www.academiaelprofeoficial.com/api/debug/revalidate
// ============================================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const results: string[] = [];

  // 1. Revalidate by tag (catches all fetchCMS calls)
  try {
    revalidateTag("sanity");
    results.push("✅ revalidateTag('sanity') — success");
  } catch (e: unknown) {
    results.push(`❌ revalidateTag('sanity') — ${e instanceof Error ? e.message : e}`);
  }

  // 2. Revalidate specific paths
  const paths = [
    "/",
    "/cursos",
    "/cursos/utp",
    "/nosotros",
    "/soporte",
  ];

  for (const p of paths) {
    try {
      revalidatePath(p);
      results.push(`✅ revalidatePath('${p}')`);
    } catch {
      results.push(`⚠️ revalidatePath('${p}') — skipped`);
    }
  }

  return NextResponse.json(
    {
      message: "Cache purged. Refresh the page to see updated CMS data.",
      timestamp: new Date().toISOString(),
      results,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}