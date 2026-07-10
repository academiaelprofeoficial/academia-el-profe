// ============================================================
// GET /api/admin/videos
// Lista TODOS los videos de la biblioteca (videoLibrary) con
// información de qué cursos los usan.
// Query params: ?search=term&tag=tagname
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity.client';

const VIDEOS_WITH_USAGE_QUERY = `
*[_type == "videoLibrary"] | order(title asc) {
  _id,
  title,
  description,
  videoFile { asset-> { _id, url, mimeType, size } },
  videoUrl,
  webmUrl,
  duration,
  thumbnail { asset-> { _id, url }, alt },
  tags,
  _createdAt,
  _updatedAt
}
`;

const COURSES_USING_VIDEO_QUERY = (videoId: string) => `
*[_type == "course" && topics[].classVideos[].sharedVideo._ref == "${videoId}"] {
  _id,
  title,
  "slug": slug.current,
  topics[] {
    title,
    classVideos[] {
      title,
      "usesVideo": sharedVideo._ref == "${videoId}"
    }
  }
}
`;

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search') || '';
    const tag = request.nextUrl.searchParams.get('tag') || '';

    // Fetch all videos from library
    const videos: any[] = await sanityClient.fetch(VIDEOS_WITH_USAGE_QUERY);

    // For each video, find which courses use it
    const videosWithUsage = await Promise.all(
      videos.map(async (video) => {
        let usageInfo: Array<{
          courseId: string;
          courseTitle: string;
          courseSlug: string;
          topicTitle: string;
          classTitle: string;
        }> = [];

        try {
          const courses = await sanityClient.fetch(COURSES_USING_VIDEO_QUERY, { videoId: video._id });

          for (const course of courses) {
            for (const topic of course.topics || []) {
              for (const cv of topic.classVideos || []) {
                if (cv.usesVideo) {
                  usageInfo.push({
                    courseId: course._id,
                    courseTitle: course.title,
                    courseSlug: course.slug,
                    topicTitle: topic.title,
                    classTitle: cv.title,
                  });
                }
              }
            }
          }
        } catch {}

        // Get unique course count
        const uniqueCourses = new Set(usageInfo.map(u => u.courseId));

        return {
          _id: video._id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          webmUrl: video.webmUrl,
          duration: video.duration,
          thumbnailUrl: video.thumbnail?.asset?.url || null,
          thumbnailAlt: video.thumbnail?.alt || null,
          tags: video.tags || [],
          hasFile: !!video.videoFile?.asset?.url,
          fileSize: video.videoFile?.asset?.size || 0,
          mimeType: video.videoFile?.asset?.mimeType || null,
          createdAt: video._createdAt,
          updatedAt: video._updatedAt,
          courseCount: uniqueCourses.size,
          usages: usageInfo,
        };
      })
    );

    // Filter by search
    let filtered = videosWithUsage;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(s) ||
          v.description?.toLowerCase().includes(s) ||
          v.tags?.some((t: string) => t.toLowerCase().includes(s))
      );
    }

    // Filter by tag
    if (tag) {
      filtered = filtered.filter((v) => v.tags?.includes(tag));
    }

    // Collect all unique tags
    const allTags = [...new Set(videosWithUsage.flatMap((v) => v.tags || []))].sort();

    return NextResponse.json({
      videos: filtered,
      total: filtered.length,
      allTags,
    });
  } catch (error) {
    console.error('[AdminVideos] Error:', error);
    return NextResponse.json({ error: 'Error al obtener videos.' }, { status: 500 });
  }
}