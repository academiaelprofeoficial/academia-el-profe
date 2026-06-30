// @ts-nocheck
import { defineType, defineField } from "sanity";
import { orderField } from "../lib/schema-master";

export default defineType({
  name: "heroSlide", title: "Slide del Hero", type: "document",
  fields: [
    defineField({ name: "title", title: "Título Principal", type: "string", validation: (R: any) => R.required().max(100) }),
    defineField({ name: "subtitle", title: "Subtítulo", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "backgroundImage", title: "Imagen de Fondo", type: "image", options: { hotspot: true } }),
    defineField({ name: "ctaLabel", title: "Etiqueta del CTA", type: "string", validation: (R: any) => R.max(30).optional(), initialValue: "VER CURSOS" }),
    defineField({ name: "ctaLink", title: "Enlace del CTA", type: "string", validation: (R: any) => R.max(200).optional(), initialValue: "/cursos" }),
    defineField({ name: "ctaType", title: "Tipo de CTA", type: "string", options: { list: [
      { title: "Primario (Verde)", value: "primary" },
      { title: "Secundario", value: "secondary" },
      { title: "WhatsApp", value: "whatsapp" },
    ], layout: "radio" }, initialValue: "primary" }),
    orderField(),
  ],
  preview: { select: { title: "title", media: "backgroundImage" }, prepare({ title, media }) { return { title: title || "Sin título", media }; } },
});