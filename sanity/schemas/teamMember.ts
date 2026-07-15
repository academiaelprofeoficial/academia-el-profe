// @ts-nocheck
import { defineType, defineField } from "sanity";
import { orderField } from "../lib/schema-master";

export default defineType({
  name: "teamMember", title: "Miembro del Equipo", type: "document",
  fields: [
    defineField({ name: "name", title: "Nombre Completo", type: "string", validation: (R: any) => R.required().max(100) }),
    defineField({ name: "role", title: "Cargo / Rol", type: "string", validation: (R: any) => R.required() }),
    defineField({ name: "photo", title: "Foto", type: "image", options: { hotspot: true }, description: "Se recomienda 400x400px" }),
    defineField({ name: "bio", title: "Biografía", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "linkedinUrl", title: "LinkedIn", type: "url" }),
    orderField(),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});