// @ts-nocheck
import { defineType, defineField } from "sanity";
import { orderField } from "../lib/schema-master";

export default defineType({
  name: "partner", title: "Universidad / Socio", type: "document",
  fields: [
    defineField({ name: "name", title: "Nombre", type: "string", validation: (R: any) => R.required().max(100) }),
    defineField({ name: "abbreviation", title: "Abreviatura", type: "string", description: "Ej: UTP, UNI, UPC" }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "url", title: "URL", type: "url" }),
    orderField(),
  ],
  preview: { select: { title: "name", subtitle: "abbreviation", media: "logo" }, prepare({ title, subtitle, media }) { return { title: title || "Sin nombre", subtitle: subtitle || "", media }; } },
});