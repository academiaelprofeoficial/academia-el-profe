// @ts-nocheck
import { defineType, defineField } from "sanity";

export default defineType({
  name: "studioGuide", title: "Guía de Uso del CMS", type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", initialValue: "Guía de Uso — Academia El Profe CMS" }),
    defineField({ name: "content", title: "Contenido", type: "array", of: [{ type: "block" }], initialValue: [
      { _type: "block", _key: "g1", children: [{ _type: "span", _key: "s1", text: "Bienvenido al CMS de Academia El Profe Oficial." }], style: "h2" },
      { _type: "block", _key: "g2", children: [{ _type: "span", _key: "s2", text: "Usa el panel izquierdo para navegar entre secciones: Hero, Estadísticas, Universidades, Cursos, Testimonios y Configuración." }], style: "normal" },
      { _type: "block", _key: "g3", children: [{ _type: "span", _key: "s3", text: "Para subir imágenes, haz clic en el campo de imagen y arrastra o selecciona un archivo." }], style: "normal" },
      { _type: "block", _key: "g4", children: [{ _type: "span", _key: "s4", text: "Los cambios se publican cuando presionas el botón 'Publicar'." }], style: "normal" },
      { _type: "block", _key: "g5", children: [{ _type: "span", _key: "s5", text: "Usa el botón 'Preview' para ver cómo se ve tu contenido en el sitio en tiempo real." }], style: "normal" },
    ] }),
  ],
  preview: { prepare() { return { title: "Guía de Uso del CMS" }; } },
});