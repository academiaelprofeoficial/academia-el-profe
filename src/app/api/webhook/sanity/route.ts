import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// ============================================================
// Sanity Webhook — On-demand Revalidation
// Called by Sanity on every create/update/delete of any document.
// Immediately purges Next.js cache so the live site shows fresh data.
//
// SETUP in Sanity Dashboard:
//   Project Settings → API → Webhooks → Create Webhook
//   URL:  https://www.academiaelprofeoficial.com/api/webhook/sanity
//   Method: POST
//   Auth: Bearer token = your SANITY_REVALIDATE_SECRET
//   Events: Create, Update, Delete (all document types)
//   Dataset: production
//   Filter: (optional) leave empty for all types
// ============================================================

const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

// All public-facing page paths
const ALL_PATHS = [
  "/",
  "/cursos",
  "/nosotros",
  "/soporte",
  "/iniciar-sesion",
  "/registrarse",
];

export async function POST(request: Request) {
  // 1. Read body once
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body", revalidated: false },
      { status: 400 }
    );
  }

  // 2. Verify secret (Sanity sends it in the body or as Bearer token)
  const bodySecret = body.secret as string | undefined;
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
  const secret = bodySecret || authHeader;

  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: "Invalid secret", revalidated: false },
      { status: 401 }
    );
  }

  // 3. Determine document type and slug for targeted revalidation
  const docType = (body._type as string) || "";
  const slug =
    typeof body.slug === "string"
      ? body.slug
      : (body.slug?.current as string) || "";
  const pageId = (body.pageId as string) || "";

  // 4. Build list of paths to revalidate
  const paths = [...ALL_PATHS];

  if (docType === "course" && slug) {
    // Course detail
    paths.push(`/cursos/${slug}`);
    // Temario
    paths.push(`/cursos/${slug}/temario`);
    // Old clase pages (backward compat)
    paths.push(`/cursos/${slug}/clase`);
    // Revalidate all lesson pages for this course
    // Use a wildcard-like approach: revalidate the base path
    // Since we can't use wildcards, we revalidate common patterns
    for (let i = 1; i <= 200; i++) {
      paths.push(`/cursos/${slug}/lecciones/${i}`);
    }
  }

  if (docType === "pageContent" && pageId) {
    paths.push(`/${pageId}`);
  }

  // 5. Revalidate tag (catch-all for anything using revalidateTag("sanity"))
  try {
    revalidateTag("sanity");
  } catch {
    // Tag may not be registered — ignore
  }

  // 6. Revalidate each path
  const revalidatedPaths: string[] = [];
  for (const path of paths) {
    try {
      revalidatePath(path);
      revalidatedPaths.push(path);
    } catch {
      // Path might not be a valid route — skip
    }
  }

  console.log(
    `[Sanity Webhook] Revalidated ${revalidatedPaths.length} paths for ${docType}${slug ? `:${slug}` : ""}`
  );

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    docType,
    slug,
    pathsRevalidated: revalidatedPaths,
  });
}