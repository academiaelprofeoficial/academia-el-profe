import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity.client";
import { ALL_COURSES_QUERY } from "@/lib/sanity.queries";
import type { SanityCourse } from "@/lib/sanity.client";

// GET /api/sanity-courses — returns basic course data with CMS prices
export async function GET() {
  try {
    const courses = await sanityClient.fetch<SanityCourse[]>(ALL_COURSES_QUERY);
    const data = courses.map((c) => ({
      slug: c.slug,
      title: c.title,
      pricePEN: c.pricePEN || 0,
      priceUSD: c.priceUSD || 0,
    }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Sanity courses:", error);
    return NextResponse.json([], { status: 200 });
  }
}
