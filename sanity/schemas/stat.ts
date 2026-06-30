// @ts-nocheck
import { defineType, defineField } from "sanity";
import { orderField } from "../lib/schema-master";

export default defineType({
  name: "stat", title: "Estadística", type: "document",
  fields: [
    defineField({ name: "label", title: "Etiqueta", type: "string", validation: (R: any) => R.required().max(50) }),
    defineField({ name: "value", title: "Valor", type: "number", validation: (R: any) => R.required() }),
    defineField({ name: "prefix", title: "Prefijo", type: "string", description: 'Ej: "+", "S/."', initialValue: "" }),
    defineField({ name: "suffix", title: "Sufijo", type: "string", description: 'Ej: "+", " estudiantes"', initialValue: "" }),
    defineField({ name: "icon", title: "Icono (Lucide)", type: "string", description: "Nombre del icono Lucide. Ej: users, book-open, graduation-cap, award" }),
    orderField(),
  ],
  preview: { select: { title: "label", val: "value", pre: "prefix", suf: "suffix" }, prepare({ title, val, pre, suf }) { return { title: title || "Sin etiqueta", subtitle: `${pre || ""}${val}${suf || ""}` }; } },
});