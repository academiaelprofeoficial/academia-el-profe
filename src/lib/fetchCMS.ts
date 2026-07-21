import { draftMode } from "next/headers";
import { getClientForDraft } from "@/lib/sanity.client";

export async function fetchCMS<T>(query: string): Promise<T | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return null;
    let isDraft = false;
    try { const dm = await draftMode(); isDraft = dm.isEnabled; } catch {}
    const client = getClientForDraft(isDraft);
    if (!client) return null;
    // Tag all CMS fetches so the Sanity webhook can purge them instantly.
    // revalidate: 60 = fallback: auto-refresh every 60s even without webhook.
    const data = await client.fetch<T>(query, {}, {
      next: { tags: ["sanity"], revalidate: 60 },
    } as never);
    return data ?? null;
  } catch (error) { console.warn("[CMS] Fetch failed:", error); return null; }
}