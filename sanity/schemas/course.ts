// @ts-nocheck
import { defineType, defineField } from "sanity";
import { titleField, slugField, imageField, descriptionField, orderField, featuredField } from "../lib/schema-master";

export default defineType({
  name: "course", title: "Curso", type: "document",
  fieldsets: [
    { name: "info", title: "ℹ️ Información Principal", options: { collapsible: false } },
    { name: "detail", title: "📋 Temas y Clases del Curso", options: { collapsible: true, collapsed: false } },
    { name: "promo", title: "🎬 Video de Promoción", options: { collapsible: true, collapsed: false } },
    { name: "pricing", title: "💰 Precios", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    titleField("Nombre del Curso"),
    slugField("title"),
    defineField({ ...imageField("Imagen de Portada", true), name: "coverImage", title: "Imagen de Portada", description: "Se recomienda 800x500px" }),
    defineField({ name: "category", title: "Categoría", type: "string", options: { list: [
      { title: "Cálculo", value: "calculo" },
      { title: "Mecánica", value: "mecanica" },
      { title: "Fluidos", value: "fluidos" },
      { title: "Termodinámica", value: "termodinamica" },
      { title: "Estadística", value: "estadistica" },
      { title: "Ecuaciones Diferenciales", value: "ecuaciones" },
      { title: "Otros", value: "otros" },
    ], layout: "radio" } }),
    descriptionField("Descripción del Curso"),
    defineField({ name: "professor", title: "Profesor", type: "string", initialValue: "Prof. Kall Bruno Díaz" }),

    // === TEMAS (AHORA INCLUYEN VIDEOS Y MATERIALES ANIDADOS) ===
    defineField({
      name: "topics", title: "Temas del Curso", fieldset: "detail", type: "array",
      description: "Cada tema puede contener sus propias clases (videos) y materiales descargables.",
      of: [{
        type: "object", title: "Tema",
        groups: [
          { name: "info", title: "Información" },
          { name: "videos", title: "Clases (Videos)" },
          { name: "materials", title: "Materiales" },
        ],
        fields: [
          // --- Información del tema ---
          { name: "title", title: "Nombre del Tema", group: "info", type: "string", validation: (Rule: any) => Rule.required().max(100) },
          { name: "description", title: "Descripción", group: "info", type: "text", rows: 2 },
          { name: "classes", title: "Número de Clases", group: "info", type: "number" },

          // --- Clases del tema (videos anidados) ---
          {
            name: "classVideos", title: "🎬 Clases del Tema", group: "videos", type: "array",
            description: "Agrega los videos de clase para este tema. Se mostrarán desplegables dentro del módulo.",
            of: [{
              type: "object", title: "Video de Clase",
              fields: [
                { name: "isFree", title: "🔓 Clase Gratuita o Bloqueada de Pago", type: "boolean", initialValue: false, description: "Activa para que esta clase sea gratuita (visible sin comprar)." },
                { name: "title", title: "Título de la Clase", type: "string", validation: (Rule: any) => Rule.required().max(150) },
                { name: "description", title: "Descripción", type: "text", rows: 2 },
                { name: "video", title: "Archivo de Video", type: "file", options: { accept: "video/*" }, description: "MP4, MOV o WebM." },
                { name: "videoUrl", title: "URL Externa (opcional)", type: "url", description: "YouTube, Vimeo u otra URL." },
                { name: "sharedVideo", title: "Video de Biblioteca (Reutilizable)", type: "reference", to: [{ type: "videoLibrary" }], description: "Selecciona un video de la biblioteca para reutilizarlo sin duplicar." },
                { name: "duration", title: "Duración", type: "string", description: "Ej: 45:30" },
                { name: "group", title: "Grupo (PC1/PC2/PC3/Portafolio)", type: "string", description: "Para cursos UTP. Dejar vacío para cursos normales." },
                { name: "order", title: "Orden", type: "number", initialValue: 100 },
              ],
              preview: {
                select: { title: "title", isFree: "isFree", duration: "duration" },
                prepare({ title, isFree, duration }: any) {
                  return {
                    title: title || "Video sin título",
                    subtitle: (isFree ? "🔓 Gratis" : "🔒 De pago") + (duration ? ` — ${duration}` : ""),
                  };
                },
              },
            }],
          },

          // --- Materiales del tema (PDF, Word, etc.) ---
          {
            name: "materials", title: "📄 Materiales del Tema", group: "materials", type: "array",
            description: "Sube archivos PDF, Word u otros documentos para este tema.",
            of: [{
              type: "object", title: "Material",
              fields: [
                { name: "isFree", title: "🔓 Material Gratuito o Bloqueado de Pago", type: "boolean", initialValue: false, description: "Activa para que sea gratuito." },
                { name: "title", title: "Título del Material", type: "string", validation: (Rule: any) => Rule.required().max(150) },
                { name: "file", title: "Archivo", type: "file", options: { accept: ".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt" } },
                { name: "order", title: "Orden", type: "number", initialValue: 100 },
              ],
              preview: {
                select: { title: "title", isFree: "isFree" },
                prepare({ title, isFree }: any) {
                  return { title: title || "Material", subtitle: isFree ? "🔓 Gratis" : "🔒 De pago" };
                },
              },
            }],
          },
        ],
        preview: {
          select: { title: "title", subtitle: "description", classCount: "classVideos.length", materialCount: "materials.length" },
          prepare({ title, subtitle, classCount, materialCount }: any) {
            const parts = [];
            if (classCount > 0) parts.push(`${classCount} clases`);
            if (materialCount > 0) parts.push(`${materialCount} materiales`);
            return { title: title || "Tema", subtitle: subtitle || parts.join(" · ") || "Sin contenido" };
          },
        },
      }],
    }),

    // === VIDEO DE PROMOCIÓN (a nivel de curso) ===
    defineField({
      name: "courseVideo",
      title: "Video de Promoción del Curso",
      fieldset: "promo",
      type: "file",
      description: "Sube un video de presentación del curso (MP4, MOV, WebM).",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "videoUrl",
      title: "URL de Video Externo (opcional)",
      fieldset: "promo",
      type: "url",
      description: "Pega aquí un enlace de YouTube, Vimeo o cualquier URL de video como alternativa.",
      validation: (Rule: any) => Rule.uri({ allowRelative: false }),
    }),

    // === PRECIOS ===
    defineField({ name: "pricePEN", title: "Precio Regular (S/)", fieldset: "pricing", type: "number", description: "Precio regular en soles peruanos" }),
    defineField({ name: "priceUSD", title: "Precio Regular ($)", fieldset: "pricing", type: "number", description: "Precio regular en dólares" }),
    defineField({ name: "offerPricePEN", title: "Precio Oferta (S/)", fieldset: "pricing", type: "number", description: "Precio en oferta en soles. Dejar vacío o en 0 para no mostrar oferta." }),
    defineField({ name: "offerPriceUSD", title: "Precio Oferta ($)", fieldset: "pricing", type: "number", description: "Precio en oferta en dólares. Dejar vacío o en 0 para no mostrar oferta." }),
    defineField({ name: "studentCount", title: "Alumnos Inscritos", fieldset: "pricing", type: "number", initialValue: 0, description: "Número de alumnos inscritos. Se incrementa automáticamente con cada compra." }),

    // === UTP STRUCTURE ===
    defineField({
      name: "courseStructure",
      title: "Estructura del Curso",
      type: "string",
      options: {
        list: [
          { title: "Temas (por defecto)", value: "topics" },
          { title: "UTP: PC1, PC2, PC3, Portafolio", value: "utp_pcs" },
        ],
        layout: "radio",
      },
      description: "Estructura UTP muestra PC1/PC2/PC3/Portafolio como pestañas principales.",
    }),
    defineField({ name: "totalClasses", title: "Total de Clases", type: "number" }),
    defineField({ name: "totalHours", title: "Duración Total (horas)", type: "string" }),
    defineField({ name: "level", title: "Nivel", type: "string", options: { list: [
      { title: "Básico", value: "basico" },
      { title: "Intermedio", value: "intermedio" },
      { title: "Avanzado", value: "avanzado" },
    ], layout: "radio" } }),

    // === TIPO DE CURSO ===
    defineField({
      name: "courseType",
      title: "Tipo de Curso",
      fieldset: "pricing",
      type: "string",
      initialValue: "paid",
      options: {
        list: [
          { title: "Gratuito", value: "free" },
          { title: "De Pago", value: "paid" },
        ],
        layout: "radio",
      },
      description: "Los cursos gratuitos permiten acceso completo. Los de pago requieren compra.",
    }),
    featuredField("Curso Destacado", "Activa para mostrarlo en secciones principales del sitio."),
    orderField(),
  ],
  preview: {
    select: { title: "title", category: "category", media: "coverImage", featured: "featured" },
    prepare({ title, category, media, featured }: any) {
      return { title: featured ? `⭐ ${title}` : title, subtitle: category || "Sin categoría", media };
    },
  },
});
