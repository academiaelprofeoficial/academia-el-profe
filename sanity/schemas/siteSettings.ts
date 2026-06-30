// @ts-nocheck
import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings", title: "Configuración del Sitio", type: "document",
  fields: [
    defineField({ name: "companyName", title: "Nombre de la Plataforma", type: "string", initialValue: "Academia El Profe Oficial" }),
    defineField({ name: "slogan", title: "Slogan", type: "string" }),
    defineField({ name: "tagline", title: "Tagline / Descripción Corta", type: "text", rows: 2 }),
    defineField({ name: "logo", title: "Logo (Claro)", type: "image", options: { hotspot: true } }),
    defineField({ name: "logoWhite", title: "Logo (Oscuro)", type: "image", options: { hotspot: true } }),
    defineField({ name: "ogImage", title: "OG Image (Redes Sociales)", type: "image", options: { hotspot: true }, description: "1200x630px" }),

    // === HERO VIDEO ===
    defineField({
      name: "heroVideo",
      title: "Video de Fondo del Hero",
      type: "file",
      options: { accept: "video/*" },
      description: "Video inmersivo de fondo para la sección principal (MP4/WebM recomendado). Se muestra detrás del contenido del hero.",
    }),
    defineField({
      name: "heroVideoUrl",
      title: "URL de Video de Fondo (alternativa)",
      type: "url",
      description: "URL externa de video de fondo (YouTube, Vimeo, o URL directa) como alternativa al archivo subido.",
    }),
    defineField({
      name: "heroVideoOverlay",
      title: "Opacidad del Overlay del Video",
      type: "number",
      initialValue: 60,
      description: "Porcentaje de opacidad del overlay oscuro sobre el video (0-100). Mayor = más oscuro. Recomendado: 50-70.",
      validation: (Rule: any) => Rule.min(0).max(100),
    }),

    // === WHATSAPP ===
    defineField({ name: "whatsapp", title: "WhatsApp (Número)", type: "string", description: "Número con código de país, sin +. Ej: 51944106163" }),
    defineField({ name: "whatsappMessage", title: "WhatsApp Mensaje Predeterminado", type: "string", initialValue: "Hola, quiero información sobre los cursos.", description: "Mensaje que se abre al hacer clic en el botón de WhatsApp." }),
    defineField({ name: "whatsappVisible", title: "Mostrar Botón Flotante de WhatsApp", type: "boolean", initialValue: true, description: "Activa o desactiva el botón flotante de WhatsApp en el sitio." }),

    // === CONTACTO ===
    defineField({ name: "phone", title: "Teléfono", type: "string" }),
    defineField({ name: "email", title: "Email de Contacto", type: "string" }),

    // === REDES SOCIALES ===
    defineField({ name: "tiktokUrl", title: "TikTok", type: "url" }),
    defineField({ name: "instagramUrl", title: "Instagram", type: "url" }),
    defineField({ name: "youtubeUrl", title: "YouTube", type: "url" }),
    defineField({ name: "facebookUrl", title: "Facebook", type: "url" }),

    // === SEO ===
    defineField({ name: "seoTitle", title: "SEO Título", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Descripción", type: "text", rows: 3, description: "Máximo 160 caracteres" }),
  ],
});