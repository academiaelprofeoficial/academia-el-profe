// @ts-nocheck
import { defineType, defineField } from "sanity";

export default defineType({
  name: "videoLibrary",
  title: "Biblioteca de Videos",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título del Video", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "description", title: "Descripción", type: "text", rows: 2 }),
    defineField({ name: "videoFile", title: "Archivo de Video (MP4/WebM)", type: "file", options: { accept: "video/mp4,video/webm,video/*" }, description: "Sube el archivo de video. Se recomienda MP4 para compatibilidad o WebM para optimización." }),
    defineField({ name: "videoUrl", title: "URL de Video Externo", type: "url", description: "URL directa al archivo de video (MP4 o WebM). Alternativa al archivo subido." }),
    defineField({ name: "webmUrl", title: "URL de Versión WebM (Optimizada)", type: "url", description: "URL de la versión optimizada en WebM del mismo video. Si se proporciona, se usará WebM con fallback a MP4." }),
    defineField({ name: "duration", title: "Duración", type: "string", description: "Ej: 45:30" }),
    defineField({ name: "thumbnail", title: "Miniatura", type: "image", options: { hotspot: true } }),
    defineField({ name: "tags", title: "Etiquetas", type: "array", of: [{ type: "string" }], description: "Para buscar y organizar videos" }),
  ],
  preview: {
    select: { title: "title", description: "description", duration: "duration" },
    prepare({ title, description, duration }) {
      return { title: title || "Video sin título", subtitle: description || (duration ? `Duración: ${duration}` : "") };
    },
  },
});