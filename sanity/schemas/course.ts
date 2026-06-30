// @ts-nocheck
import { defineType, defineField } from "sanity";
import { titleField, slugField, imageField, descriptionField, orderField, featuredField } from "../lib/schema-master";
import { TopicSelectInput } from "../components/TopicSelectInput";

export default defineType({
  name: "course", title: "Curso", type: "document",
  fieldsets: [
    { name: "info", title: "ℹ️ Información Principal", options: { collapsible: false } },
    { name: "detail", title: "📋 Temas y Clases del Curso", options: { collapsible: true, collapsed: false } },
    { name: "videos", title: "🎬 Videos del Curso", options: { collapsible: true, collapsed: false } },
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

    // === TEMAS ===
    defineField({ name: "topics", title: "Temas del Curso", fieldset: "detail", type: "array", of: [{ type: "object", title: "Tema", fields: [
      { name: "title", title: "Nombre del Tema", type: "string", validation: (Rule: any) => Rule.required().max(100) },
      { name: "description", title: "Descripción", type: "text", rows: 2 },
      { name: "classes", title: "Número de Clases", type: "number" },
    ], preview: { select: { title: "title", subtitle: "description" } } }] }),

    // === VIDEOS ===
    defineField({
      name: "courseVideo",
      title: "Video de Promoción del Curso",
      fieldset: "videos",
      type: "file",
      description: "Sube un video de presentación del curso (MP4, MOV, WebM). Se optimiza automáticamente.",
      options: {
        accept: "video/*",
      },
    }),
    defineField({
      name: "videoUrl",
      title: "URL de Video Externo (opcional)",
      fieldset: "videos",
      type: "url",
      description: "Pega aquí un enlace de YouTube, Vimeo o cualquier URL de video como alternativa al archivo subido.",
      validation: (Rule: any) => Rule.uri({ allowRelative: false }),
    }),
    defineField({
      name: "classVideos",
      title: "Videos de Clases",
      fieldset: "videos",
      type: "array",
      description: "Sube los videos de cada clase del curso. Puedes agregar todos los que necesites.",
      of: [{ type: "object", title: "Video de Clase", fields: [
        { name: "topic", title: "📌 Tema al que Pertenece", type: "string", description: "PRIMERO selecciona el tema del curso al que pertenece esta clase. Aparecerá desplegado bajo ese módulo en el temario.", components: { input: TopicSelectInput } },
        { name: "isFree", title: "🔓 Clase Gratuita o Bloqueada de Pago", type: "boolean", initialValue: false, description: "Activa para que esta clase sea gratuita (visible sin comprar). Desactivada = bloqueada de pago." },
        { name: "title", title: "Título de la Clase", type: "string", validation: (Rule: any) => Rule.required().max(150) },
        { name: "description", title: "Descripción", type: "text", rows: 2 },
        { name: "video", title: "Archivo de Video", type: "file", options: { accept: "video/*" }, description: "MP4, MOV o WebM. Optimizado automático." },
        { name: "videoUrl", title: "URL Externa (opcional)", type: "url", description: "YouTube, Vimeo u otra URL como alternativa." },
        { name: "sharedVideo", title: "Video de Biblioteca (Reutilizable)", type: "reference", to: [{ type: "videoLibrary" }], description: "Selecciona un video de la biblioteca. Se usará el mismo archivo en todos los cursos que lo referencien, sin duplicar." },
        { name: "duration", title: "Duración", type: "string", description: "Ej: 45:30" },
        { name: "group", title: "Grupo (PC1/PC2/PC3/Portafolio)", type: "string", description: "Para cursos UTP: PC1, PC2, PC3 o Portafolio. Dejar vacío para cursos normales." },
        { name: "order", title: "Orden", type: "number", initialValue: 100 },
      ], preview: { select: { title: "title", subtitle: "description", duration: "duration", topic: "topic" }, prepare({ title, subtitle, duration, topic }: any) { return { title: topic ? `[${topic}] ${title}` : title, subtitle: subtitle || (duration ? `Duración: ${duration}` : ""), media: null }; } } }],
    }),

    // === MATERIALES (PDF / Word) ===
    defineField({
      name: "topicMaterials",
      title: "Materiales por Tema (PDF, Word, etc.)",
      fieldset: "videos",
      type: "array",
      description: "Sube archivos PDF, Word u otros documentos para cada tema del curso.",
      of: [{ type: "object", title: "Material del Tema", fields: [
        { name: "topic", title: "📌 Tema al que Pertenece", type: "string", description: "PRIMERO selecciona el tema del curso al que pertenece este material. Aparecerá bajo ese módulo en el temario.", components: { input: TopicSelectInput } },
        { name: "isFree", title: "🔓 Material Gratuito o Bloqueado de Pago", type: "boolean", initialValue: false, description: "Activa para que este material sea gratuito (descargable sin comprar). Desactivada = bloqueado de pago." },
        { name: "title", title: "Título del Material", type: "string", validation: (Rule: any) => Rule.required().max(150) },
        { name: "file", title: "Archivo", type: "file", options: { accept: ".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt" }, description: "Sube el archivo PDF, Word, PowerPoint, Excel o TXT" },
        { name: "order", title: "Orden", type: "number", initialValue: 100 },
      ], preview: { select: { title: "title", topic: "topic" }, prepare({ title, topic }) { return { title: title || "Material", subtitle: topic || "" }; } } }],
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
      description: "Estructura UTP muestra PC1/PC2/PC3/Portafolio como pestañas principales. Temas muestra los temas normalmente.",
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
  preview: { select: { title: "title", category: "category", media: "coverImage", featured: "featured" }, prepare({ title, category, media, featured }) { return { title: featured ? `⭐ ${title}` : title, subtitle: category || "Sin categoría", media }; } },
});