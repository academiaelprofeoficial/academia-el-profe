// @ts-nocheck
import { defineType, defineField } from "sanity";

export default defineType({
  name: "pageContent",
  title: "Contenido de Página",
  type: "document",
  fieldsets: [
    { name: "hero", title: "🎯 Sección Superior (Hero)", options: { collapsible: true, collapsed: false } },
    { name: "body", title: "📝 Contenido Principal", options: { collapsible: true, collapsed: false } },
    { name: "seo", title: "🔍 SEO", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: "pageId", title: "Identificador de Página", type: "string", description: "Ej: cursos, nosotros, soporte, temario. No usar espacios.", validation: (Rule: any) => Rule.required().regex(/^[a-z0-9-]+$/) }),
    defineField({ name: "pageTitle", title: "Título de la Página", type: "string", validation: (Rule: any) => Rule.required().max(120) }),

    // Hero
    defineField({ name: "heroTitle", title: "Título del Hero", fieldset: "hero", type: "string", description: "Título principal de la sección superior" }),
    defineField({ name: "heroSubtitle", title: "Subtítulo del Hero", fieldset: "hero", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "heroImage", title: "Imagen de Fondo del Hero", fieldset: "hero", type: "image", options: { hotspot: true } }),
    defineField({ name: "ctaLabel", title: "Etiqueta del Botón CTA", fieldset: "hero", type: "string", description: "Ej: VER CURSOS, CONTÁCTANOS" }),
    defineField({ name: "ctaLink", title: "Enlace del Botón CTA", fieldset: "hero", type: "string", description: "Ej: /cursos, /soporte" }),

    // Body
    defineField({ name: "bodyContent", title: "Contenido de la Página", fieldset: "body", type: "array", of: [
      { type: "block" },
      { type: "image", options: { hotspot: true } },
    ], description: "Contenido principal editable con texto e imágenes." }),

    // SEO
    defineField({ name: "seoTitle", title: "Título SEO", fieldset: "seo", type: "string", description: "Título para buscadores (máx 60 caracteres)", validation: (Rule: any) => Rule.max(60) }),
    defineField({ name: "seoDescription", title: "Descripción SEO", fieldset: "seo", type: "text", rows: 3, description: "Descripción para buscadores (máx 160 caracteres)", validation: (Rule: any) => Rule.max(160) }),
  ],
  preview: { select: { pageTitle: "pageTitle", pageId: "pageId" }, prepare({ pageTitle, pageId }) { return { title: pageTitle || pageId, subtitle: `Página: /${pageId}` }; } },
});