import { draftMode } from "next/headers";
import { createClient } from "@sanity/client";
import { validatePreviewUrl } from "@sanity/preview-url-secret";

export async function GET(request: Request) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) {
    return new Response("Sanity project ID not configured", { status: 500 });
  }

  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2025-01-01",
    token: process.env.SANITY_API_READ_TOKEN,
    useCdn: false,
    perspective: "previewDrafts",
  });

  // Validate the preview secret with Sanity
  const validation = await validatePreviewUrl(client, request.url);

  if (!validation.isValid) {
    return new Response("Invalid preview URL", { status: 401 });
  }

  // Enable Next.js draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the pathname specified by the presentation tool
  const url = new URL(request.url);
  const redirectTo = validation.redirectTo || url.searchParams.get("sanity-preview-pathname") || "/";

  return new Response(null, {
    status: 307,
    headers: { Location: redirectTo },
  });
}