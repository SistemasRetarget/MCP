import type { CollectionConfig } from "payload";

/**
 * Landings: páginas con "bloques" tipo builder.
 * Cada landing tiene secciones (hero, texto, galería, CTA, embeds redes).
 * En fase 3 agregaremos el wizard "crear desde URL".
 */
export const Landings: CollectionConfig = {
  slug: "landings",
  labels: { singular: "Landing", plural: "Landings" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status"],
    group: "Contenido",
    description: "Páginas de aterrizaje con bloques arrastrables. Para campañas, productos o eventos."
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true,
      admin: { description: "URL: /l/[slug]" } },
    {
      name: "sourceUrl", type: "text",
      admin: { description: "URL de referencia (opcional). En Fase 3 se usará para generar la landing automáticamente desde este enlace." }
    },
    {
      name: "sections", type: "blocks", localized: true, required: true,
      admin: { description: "Agrega bloques en el orden que quieras aparezcan en la página" },
      blocks: [
        {
          slug: "hero",
          labels: { singular: "🎯 Hero", plural: "Heroes" },
          fields: [
            { name: "title", type: "text", required: true },
            { name: "subtitle", type: "textarea" },
            { name: "image", type: "upload", relationTo: "media" },
            { name: "imageMobile", type: "upload", relationTo: "media" },
            { name: "ctaLabel", type: "text" },
            { name: "ctaUrl", type: "text" }
          ]
        },
        {
          slug: "textBlock",
          labels: { singular: "📝 Texto", plural: "Bloques de texto" },
          fields: [
            { name: "heading", type: "text" },
            { name: "content", type: "richText", required: true }
          ]
        },
        {
          slug: "gallery",
          labels: { singular: "🖼️ Galería", plural: "Galerías" },
          fields: [
            { name: "heading", type: "text" },
            { name: "images", type: "upload", relationTo: "media", hasMany: true, required: true }
          ]
        },
        {
          slug: "cta",
          labels: { singular: "📣 Call to Action", plural: "CTAs" },
          fields: [
            { name: "title", type: "text", required: true },
            { name: "description", type: "textarea" },
            { name: "buttonLabel", type: "text", required: true },
            { name: "buttonUrl", type: "text", required: true }
          ]
        },
        {
          slug: "embed",
          labels: { singular: "🎬 Embed Red Social", plural: "Embeds" },
          fields: [
            {
              name: "platform", type: "select", required: true,
              options: [
                { label: "YouTube", value: "youtube" },
                { label: "X / Twitter", value: "twitter" },
                { label: "Instagram", value: "instagram" },
                { label: "TikTok", value: "tiktok" },
                { label: "Otro (iframe)", value: "iframe" }
              ]
            },
            { name: "url", type: "text", required: true, admin: { description: "Pegá el enlace del contenido (tweet, video, post)" } },
            { name: "caption", type: "text" }
          ]
        },
        {
          slug: "features",
          labels: { singular: "⭐ Características", plural: "Características" },
          fields: [
            { name: "heading", type: "text" },
            {
              name: "items", type: "array", required: true, minRows: 1,
              fields: [
                { name: "icon", type: "text", admin: { description: "Emoji o nombre de icono" } },
                { name: "title", type: "text", required: true },
                { name: "description", type: "textarea" }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "status", type: "select", defaultValue: "draft", required: true,
      admin: { position: "sidebar" },
      options: [
        { label: "📝 Borrador", value: "draft" },
        { label: "✅ Publicado", value: "published" }
      ]
    },
    {
      name: "meta", type: "group", label: "SEO", localized: true,
      fields: [
        { name: "title", type: "text", maxLength: 80 },
        { name: "description", type: "textarea", maxLength: 200 },
        { name: "ogImage", type: "upload", relationTo: "media" }
      ]
    }
  ]
};
