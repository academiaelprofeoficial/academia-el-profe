import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder, type ImageUrlBuilder } from "@sanity/image-url";

function createSanityClient(options?: { perspective?: "published" | "previewDrafts" }): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set");
  const isDraft = options?.perspective === "previewDrafts";
  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2025-01-01",
    useCdn: !isDraft,
    perspective: isDraft ? "previewDrafts" : "published",
    token: isDraft ? process.env.SANITY_API_READ_TOKEN : undefined,
    // Stega ONLY for draft/preview — never on public published content
    stega: isDraft ? { enabled: true, studioUrl: "/admin/cms" } : { enabled: false },
  });
}

let _publishedClient: SanityClient | null = null;
function getPublishedClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return null;
  if (!_publishedClient) _publishedClient = createSanityClient({ perspective: "published" });
  return _publishedClient;
}

function getDraftClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return null;
  return createSanityClient({ perspective: "previewDrafts" });
}

export function getClientForDraft(isDraft: boolean): SanityClient | null {
  return isDraft ? getDraftClient() : getPublishedClient();
}

export const sanityClient = {
  fetch: async <T = unknown>(query: string): Promise<T> => {
    const client = getPublishedClient();
    if (!client) return [] as unknown as T;
    return client.fetch<T>(query);
  },
} as Pick<SanityClient, "fetch">;

export function urlFor(source: Parameters<ImageUrlBuilder["image"]>[0]) {
  const client = getPublishedClient();
  if (!client) return { url: () => "", width: () => ({ fit: () => ({ url: () => "" }) }), height: () => ({ fit: () => ({ url: () => "" }) }) } as unknown as ReturnType<ImageUrlBuilder["image"]>;
  return createImageUrlBuilder(client).image(source);
}

// === TYPES ===
export interface SanityImage { asset?: { _ref: string; _type: string; _id?: string; url?: string }; alt?: string; caption?: string; hotspot?: { x: number; y: number; height: number; width: number }; crop?: { top: number; bottom: number; left: number; right: number }; }
export interface PortableTextBlock { _type: string; _key: string; children: Array<{ text: string; marks: string[] }>; style?: string; markDefs?: Array<{ _key: string; _type: string; href?: string }>; listItem?: string; level?: number; }

export interface SanityHeroSlide { _id: string; title: string; subtitle?: PortableTextBlock[]; backgroundImage?: SanityImage | null; ctaLabel?: string; ctaLink?: string; ctaType?: "primary" | "secondary" | "whatsapp"; order?: number; }
export interface SanityStat { _id: string; label: string; value: number; suffix?: string; prefix?: string; icon?: string; order?: number; }
export interface SanityPartner { _id: string; name: string; abbreviation?: string; logo?: SanityImage | null; url?: string; order?: number; }
export interface SanityVideoAsset { asset?: { _id: string; url?: string; mimeType?: string; size?: number }; }
export interface SanitySharedVideo { _id: string; title?: string; videoFile?: SanityVideoAsset; videoUrl?: string; webmUrl?: string; duration?: string; }
export interface SanityClassVideo { _key?: string; title?: string; description?: string; video?: SanityVideoAsset; videoUrl?: string; sharedVideo?: SanitySharedVideo; duration?: string; isFree?: boolean; order?: number; group?: string; }
export interface SanityTopicMaterial { title?: string; file?: SanityVideoAsset; order?: number; isFree?: boolean; }
export interface SanityTopic { _key?: string; title: string; description?: string; classes?: number; classVideos?: SanityClassVideo[]; materials?: SanityTopicMaterial[]; }
export interface SanityCourse { _id: string; title: string; slug: string; coverImage?: SanityImage | null; category?: string; description?: PortableTextBlock[]; professor?: string; topics?: SanityTopic[]; pricePEN?: number; priceUSD?: number; totalClasses?: number; totalHours?: string; level?: string; featured?: boolean; order?: number; courseType?: 'free' | 'paid'; courseVideo?: SanityVideoAsset; videoUrl?: string; }
export interface SanityTeamMember { _id: string; name: string; role: string; photo?: SanityImage | null; bio?: PortableTextBlock[]; email?: string; linkedinUrl?: string; order?: number; }
export interface SanityTestimonial { _id: string; authorName: string; authorRole?: string; quote?: PortableTextBlock[]; photo?: SanityImage | null; rating?: number; featured?: boolean; order?: number; }
export interface SanitySiteSettings { _id: string; companyName?: string; slogan?: string; tagline?: string; logo?: SanityImage | null; logoWhite?: SanityImage | null; ogImage?: SanityImage | null; heroVideo?: SanityVideoAsset; heroVideoUrl?: string; heroVideoOverlay?: number; whatsapp?: string; whatsappMessage?: string; whatsappVisible?: boolean; phone?: string; email?: string; tiktokUrl?: string; instagramUrl?: string; youtubeUrl?: string; facebookUrl?: string; seoTitle?: string; seoDescription?: string; }
export interface SanityPageContent { _id: string; pageId: string; pageTitle?: string; heroTitle?: string; heroSubtitle?: PortableTextBlock[]; heroImage?: SanityImage | null; ctaLabel?: string; ctaLink?: string; bodyContent?: Array<PortableTextBlock | { _type: 'image'; asset?: { _ref: string; _type: string }; hotspot?: any; crop?: any }>; seoTitle?: string; seoDescription?: string; }

export interface SanityThemeColors {
  primaryColor?: string;
  primaryHoverColor?: string;
  headingColor?: string;
  textColor?: string;
  linkColor?: string;
  buttonColor?: string;
  buttonHoverColor?: string;
  buttonTextColor?: string;
  secondaryColor?: string;
}

export interface SanityThemeSettings {
  _id: string;
  preset?: string;
  colorsSection?: SanityThemeColors;
}

export function plainText(blocks: PortableTextBlock[] | undefined | null): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks.map((b) => b._type === "block" && b.children ? b.children.map((c) => c.text).join("") : "").join("\n").trim();
}

export function getImageUrl(image: SanityImage | null | undefined, width = 800, height = 600): string | null {
  if (!image || !image.asset) return null;
  try { return urlFor(image).width(width).height(height).fit("crop").url(); } catch { return null; }
}