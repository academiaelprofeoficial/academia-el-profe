// @ts-nocheck
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import {
  HomeIcon, CogIcon, BookIcon, StackIcon,
  UsersIcon, BarChartIcon, DashboardIcon,
  DocumentIcon, CommentIcon, StarIcon,
} from "@sanity/icons";
import { schemaTypes } from "./sanity/schema";
import { STUDIO_TITLE, BRAND_COLORS } from "./sanity/lib/constants";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.academiaelprofeoficial.com";

export default defineConfig({
  name: "academia-el-profe-cms",
  title: STUDIO_TITLE,
  projectId,
  dataset,
  basePath: "/admin/cms",
  releases: { enabled: false },
  plugins: [
    structureTool({
      structure: (S) => {
        return S.list().title("Panel de Control").items([
          S.listItem().title("Inicio").icon(DashboardIcon).id("home-group").child(
            S.list().title("Inicio").items([
              S.listItem().title("Hero (Slides)").icon(StackIcon).id("hero-slides").child(
                S.documentTypeList("heroSlide").title("Slides del Hero").defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
              S.listItem().title("Estadísticas").icon(BarChartIcon).id("stats-list").child(
                S.documentTypeList("stat").title("Estadísticas").defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
              S.listItem().title("Universidades").icon(UsersIcon).id("partners-list").child(
                S.documentTypeList("partner").title("Universidades / Socios").defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
              S.listItem().title("Testimonios").icon(CommentIcon).id("testimonials-list").child(
                S.documentTypeList("testimonial").title("Testimonios").defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
            ]),
          ),
          S.listItem().title("Cursos").icon(BookIcon).id("courses-group").child(
            S.list().title("Cursos").items([
              S.listItem().title("Cursos Generales").icon(BookIcon).id("general-courses-list").child(
                S.documentTypeList("course").title("Cursos Generales").filter('_type == "course" && group != "utp"'),
              ),
              S.listItem().title("Cursos UTP").icon(BookIcon).id("utp-courses-list").child(
                S.documentTypeList("course").title("Cursos UTP").filter('_type == "course" && (group == "utp" || group == "ambos")'),
              ),
              S.listItem().title("Todos los Cursos").icon(StackIcon).id("all-courses-list").child(
                S.documentTypeList("course").title("Todos los Cursos"),
              ),
              S.listItem().title("Biblioteca de Videos").icon(StackIcon).id("video-library-list").child(
                S.documentTypeList("videoLibrary").title("Videos Reutilizables"),
              ),
            ]),
          ),
          S.listItem().title("Equipo").icon(StarIcon).id("team-group").child(
            S.documentTypeList("teamMember").title("Equipo").defaultOrdering([{ field: "order", direction: "asc" }]),
          ),
          S.listItem().title("Páginas del Sitio").icon(DocumentIcon).id("pages-group").child(
            S.documentTypeList("pageContent").title("Páginas Editables").defaultOrdering([{ field: "pageTitle", direction: "asc" }]),
          ),
          S.listItem().title("Configuración del Sitio").icon(CogIcon).id("settings-group").child(
            S.list().title("Configuración").items([
              S.listItem().title("Datos del Sitio").icon(HomeIcon).id("site-settings-editor").child(
                S.document().schemaType("siteSettings").documentId("siteSettings").title("Configuración"),
              ),
              S.listItem().title("Personalizacion de Colores").icon(CogIcon).id("theme-settings-editor").child(
                S.document().schemaType("themeSettings").documentId("themeSettings").title("Tema y Colores"),
              ),
            ]),
          ),
        ]);
      },
    }),
    presentationTool({
      previewUrl: {
        origin: `${siteUrl}/admin/cms`,
        preview: siteUrl,
        previewMode: {
          enable: "/api/preview",
        },
      },
      documentLocations: {
        heroSlide: {
          select: { title: "title", order: "order" },
          resolve: (doc) => ({ href: "/#hero", label: doc?.title || "Hero Slide" }),
        },
        stat: {
          select: { label: "label" },
          resolve: (doc) => ({ href: "/#numeros", label: doc?.label || "Estadística" }),
        },
        partner: {
          select: { name: "name" },
          resolve: (doc) => ({ href: "/#universidades", label: doc?.name || "Universidad" }),
        },
        testimonial: {
          select: { authorName: "authorName" },
          resolve: (doc) => ({ href: "/#clientes", label: doc?.authorName || "Testimonio" }),
        },
        course: {
          select: { title: "title", slug: "slug.current", group: "group" },
          resolve: (doc) => {
            const slug = doc?.slug?.current || "";
            const label = doc?.title || "Curso";
            const locations = [
              { href: `/cursos/${slug}`, label: `${label} — Detalle` },
              { href: `/cursos/${slug}/temario`, label: `${label} — Temario` },
            ];
            if (doc?.group === "utp" || doc?.group === "ambos") {
              locations.push({ href: "/cursos/utp", label: `${label}` });
            }
            return locations;
          },
        },
        teamMember: {
          select: { name: "name" },
          resolve: (doc) => ({ href: "/#nosotros", label: doc?.name || "Equipo" }),
        },
        siteSettings: {
          select: { companyName: "companyName" },
          resolve: (doc) => ({ href: "/", label: doc?.companyName || "Configuración del Sitio" }),
        },
        themeSettings: {
          select: { preset: "preset" },
          resolve: (doc) => ({ href: "/", label: doc?.preset ? `Tema: ${doc.preset}` : "Personalización de Colores" }),
        },
        pageContent: {
          select: { pageId: "pageId", pageTitle: "pageTitle" },
          resolve: (doc) => ({ href: `/${doc?.pageId || ""}`, label: doc?.pageTitle || "Página" }),
        },
      },
    }),
  ],
  schema: { types: schemaTypes },
  document: { unsavedChanges: { warning: "Tienes cambios sin guardar. ¿Seguro que quieres salir?" } },
  form: { image: { directUploads: true } },
  theme: { "--brand-primary": BRAND_COLORS.primary, "--brand-accent": BRAND_COLORS.accent, "--brand-dark": BRAND_COLORS.dark } as React.CSSProperties,
});