// @ts-nocheck
import { defineField, defineType } from "sanity";

export const titleField = (label: string) => defineField({
  name: "title", title: label, type: "string",
  validation: (Rule: any) => Rule.required().max(120),
});

export const slugField = (sourceField: string) => defineField({
  name: "slug", title: "Slug", type: "slug",
  options: { source: sourceField, maxLength: 120, isUnique: () => Promise.resolve(true) },
  validation: (Rule: any) => Rule.required(),
});

export const imageField = (title: string, required = false) => ({
  type: "image" as const,
  options: { hotspot: true },
  title,
  description: required ? "Imagen requerida." : "Imagen opcional.",
});

export const descriptionField = (label: string) => defineField({
  name: "description", title: label, type: "array",
  of: [{ type: "block" }],
});

export const orderField = () => defineField({
  name: "order", title: "Orden", type: "number",
  description: "Orden de aparición (menor = primero).",
  initialValue: 100,
  validation: (Rule: any) => Rule.integer().min(0),
});

export const featuredField = (label: string, desc: string) => defineField({
  name: "featured", title: label, type: "boolean",
  description: desc, initialValue: false,
});