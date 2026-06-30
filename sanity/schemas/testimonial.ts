// @ts-nocheck
import { defineType, defineField } from "sanity";
import { orderField, featuredField } from "../lib/schema-master";

export default defineType({
  name: "testimonial", title: "Testimonio", type: "document",
  fields: [
    defineField({ name: "authorName", title: "Nombre del Estudiante", type: "string", validation: (R: any) => R.required().max(100) }),
    defineField({ name: "authorRole", title: "Universidad / Carrera", type: "string" }),
    defineField({ name: "quote", title: "Testimonio", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "photo", title: "Foto del Estudiante", type: "image", options: { hotspot: true } }),
    defineField({ name: "rating", title: "Calificación (1-5)", type: "number", validation: (R: any) => R.min(1).max(5), initialValue: 5 }),
    featuredField("Testimonio Destacado", "Activa para mostrarlo en secciones principales"),
    orderField(),
  ],
  preview: { select: { title: "authorName", subtitle: "authorRole", media: "photo" } },
});