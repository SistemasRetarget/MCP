import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Página", plural: "Páginas" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status"],
    group: "Contenido",
    description: "Páginas estáticas (Nosotros, Contacto, Política de Privacidad, etc.)"
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true,
      admin: { description: "URL: /[slug]. Ej: nosotros, contacto, privacidad" } },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "heroImageMobile", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", localized: true },
    {
      name: "status", type: "select", defaultValue: "published", required: true,
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
        { name: "description", type: "textarea", maxLength: 200 }
      ]
    }
  ]
};
