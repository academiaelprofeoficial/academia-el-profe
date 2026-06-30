// @ts-nocheck
import { defineType, defineField } from "sanity";

const DEFAULT_GREEN_ACADEMY = {
  primaryColor: "#10B981",
  primaryHoverColor: "#059669",
  headingColor: "#1E293B",
  textColor: "#475569",
  linkColor: "#059669",
  buttonColor: "#10B981",
  buttonHoverColor: "#059669",
  buttonTextColor: "#FFFFFF",
  secondaryColor: "#3B82F6",
};

const PRESETS = {
  "green-academy": {
    title: "Green Academy",
    primaryColor: "#10B981",
    primaryHoverColor: "#059669",
    headingColor: "#1E293B",
    textColor: "#475569",
    linkColor: "#059669",
    buttonColor: "#10B981",
    buttonHoverColor: "#059669",
    buttonTextColor: "#FFFFFF",
    secondaryColor: "#3B82F6",
  },
  "blue-corporate": {
    title: "Blue Corporate",
    primaryColor: "#3B82F6",
    primaryHoverColor: "#2563EB",
    headingColor: "#0F172A",
    textColor: "#475569",
    linkColor: "#2563EB",
    buttonColor: "#3B82F6",
    buttonHoverColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    secondaryColor: "#8B5CF6",
  },
  "red-premium": {
    title: "Red Premium",
    primaryColor: "#EF4444",
    primaryHoverColor: "#DC2626",
    headingColor: "#1E293B",
    textColor: "#475569",
    linkColor: "#DC2626",
    buttonColor: "#EF4444",
    buttonHoverColor: "#DC2626",
    buttonTextColor: "#FFFFFF",
    secondaryColor: "#F59E0B",
  },
  "purple-education": {
    title: "Purple Education",
    primaryColor: "#8B5CF6",
    primaryHoverColor: "#7C3AED",
    headingColor: "#1E1B4B",
    textColor: "#4C4675",
    linkColor: "#7C3AED",
    buttonColor: "#8B5CF6",
    buttonHoverColor: "#7C3AED",
    buttonTextColor: "#FFFFFF",
    secondaryColor: "#EC4899",
  },
  "dark-elegant": {
    title: "Dark Elegant",
    primaryColor: "#A78BFA",
    primaryHoverColor: "#8B5CF6",
    headingColor: "#F8FAFC",
    textColor: "#CBD5E1",
    linkColor: "#C4B5FD",
    buttonColor: "#8B5CF6",
    buttonHoverColor: "#7C3AED",
    buttonTextColor: "#FFFFFF",
    secondaryColor: "#F472B6",
  },
};

export const THEME_PRESETS = PRESETS;
export const DEFAULT_THEME = DEFAULT_GREEN_ACADEMY;

export default defineType({
  name: "themeSettings",
  title: "Personalizacion de Colores del Tema",
  type: "document",
  icon: () => "\uD83C\uDFA8",
  fields: [
    defineField({
      name: "preset",
      title: "Preajuste de Tema",
      type: "string",
      description:
        "Selecciona un preajuste para aplicar colores automaticamente. Los colores individuales se actualizaran al guardar.",
      options: {
        list: [
          { title: "Green Academy (Por defecto)", value: "green-academy" },
          { title: "Blue Corporate", value: "blue-corporate" },
          { title: "Red Premium", value: "red-premium" },
          { title: "Purple Education", value: "purple-education" },
          { title: "Dark Elegant", value: "dark-elegant" },
          { title: "Personalizado", value: "custom" },
        ],
      },
      initialValue: "green-academy",
      validation: (Rule) => Rule.required(),
    }),

    // --- Separator ---
    defineField({
      name: "colorsSection",
      title: "Colores Personalizados",
      type: "object",
      description:
        "Ajusta cada color individualmente. Si seleccionas un preajuste, estos colores se sobreescribiran al guardar.",
      fields: [
        defineField({
          name: "primaryColor",
          title: "Color Primario",
          type: "string",
          description: "Color principal de la marca (botones, iconos, acentos).",
          initialValue: "#10B981",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "primaryHoverColor",
          title: "Color Primario (Hover)",
          type: "string",
          description: "Variante mas oscura del color primario para hover.",
          initialValue: "#059669",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "headingColor",
          title: "Color de Titulos (H1-H6)",
          type: "string",
          description: "Color para todos los encabezados y titulos del sitio.",
          initialValue: "#1E293B",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "textColor",
          title: "Color de Texto Principal",
          type: "string",
          description: "Color para el texto de parrafos y descripciones.",
          initialValue: "#475569",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "linkColor",
          title: "Color de Enlaces",
          type: "string",
          description: "Color para enlaces de navegacion y texto interactivo.",
          initialValue: "#059669",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "buttonColor",
          title: "Color de Botones",
          type: "string",
          description: "Color de fondo para botones principales.",
          initialValue: "#10B981",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "buttonHoverColor",
          title: "Color de Botones (Hover)",
          type: "string",
          description: "Color de fondo para botones en estado hover.",
          initialValue: "#059669",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "buttonTextColor",
          title: "Color de Texto en Botones",
          type: "string",
          description: "Color del texto dentro de los botones.",
          initialValue: "#FFFFFF",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
        defineField({
          name: "secondaryColor",
          title: "Color Secundario / Acento",
          type: "string",
          description: "Color secundario para elementos de apoyo y acentos visuales.",
          initialValue: "#3B82F6",
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/).error("Debe ser un color hex valido (#RRGGBB)"),
        }),
      ],
      options: {
        columns: 2,
      },
    }),
  ],
  preview: {
    select: {
      preset: "preset",
      primary: "colorsSection.primaryColor",
    },
    prepare({ preset, primary }) {
      const presetLabel =
        preset === "green-academy"
          ? "Green Academy"
          : preset === "blue-corporate"
          ? "Blue Corporate"
          : preset === "red-premium"
          ? "Red Premium"
          : preset === "purple-education"
          ? "Purple Education"
          : preset === "dark-elegant"
          ? "Dark Elegant"
          : "Personalizado";
      return {
        title: `Tema: ${presetLabel}`,
      };
    },
  },
});