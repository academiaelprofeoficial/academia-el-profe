import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

// POST /api/admin/unhide-courses — sets hidden=false on ALL courses
export async function POST() {
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
    const token = process.env.SANITY_API_READ_TOKEN;

    if (!projectId) {
      return NextResponse.json({ error: "SANITY_PROJECT_ID not set" }, { status: 500 });
    }

    const client = createClient({
      projectId,
      dataset,
      apiVersion: "2025-01-01",
      useCdn: false,
      token: token || undefined,
    });

    // Fetch all courses (including hidden ones)
    const courses = await client.fetch<
      Array<{ _id: string; title: string; hidden?: boolean }>
    >(`*[_type == "course"] { _id, title, hidden }`);

    const results: Array<{ _id: string; title: string; wasHidden: boolean; success: boolean }> = [];

    for (const course of courses) {
      try {
        await client.patch(course._id).set({ hidden: false }).commit();
        results.push({
          _id: course._id,
          title: course.title,
          wasHidden: course.hidden === true,
          success: true,
        });
      } catch (err) {
        results.push({
          _id: course._id,
          title: course.title,
          wasHidden: course.hidden === true,
          success: false,
        });
      }
    }

    const hiddenCount = results.filter((r) => r.wasHidden).length;
    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      totalCourses: courses.length,
      hiddenFound: hiddenCount,
      unhidden: successCount,
      courses: results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error unhiding courses:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/admin/unhide-courses — preview which courses are hidden (no write)
export async function GET() {
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
    const token = process.env.SANITY_API_READ_TOKEN;

    if (!projectId) {
      return NextResponse.json({ error: "SANITY_PROJECT_ID not set" }, { status: 500 });
    }

    const client = createClient({
      projectId,
      dataset,
      apiVersion: "2025-01-01",
      useCdn: false,
      token: token || undefined,
    });

    const courses = await client.fetch<
      Array<{ _id: string; title: string; slug: string; hidden?: boolean; group?: string }>
    >(`*[_type == "course"] | order(order asc) { _id, title, "slug": slug.current, hidden, group }`);

    return NextResponse.json({
      total: courses.length,
      hidden: courses.filter((c) => c.hidden === true),
      visible: courses.filter((c) => c.hidden !== true),
      all: courses,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}