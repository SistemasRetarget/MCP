import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Publicación (Blog)", plural: "Publicaciones (Blog)" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "publishedAt"],
    group: "Contenido",
    description: "Entradas de blog. Se muestran en /blog y /blog/[slug]"
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true, maxLength: 200,
      admin: { description: "Título del post (se usa en SEO también)" } },
    { name: "slug", type: "text", required: true, unique: true, index: true,
      admin: { description: "URL amigable: /blog/este-es-el-slug" } },
    { name: "excerpt", type: "textarea", localized: true, maxLength: 300,
      admin: { description: "Resumen corto que aparece en la lista y al compartir" } },
    { name: "coverImage", type: "upload", relationTo: "media",
      admin: { description: "Imagen principal del post (16:9 recomendado)" } },
    { name: "coverImageMobile", type: "upload", relationTo: "media",
      admin: { description: "Imagen alternativa para móvil (opcional, vertical)" } },
    { name: "body", type: "richText", localized: true },
    { name: "category", type: "relationship", relationTo: "categories" },
    { name: "tags", type: "relationship", relationTo: "tags", hasMany: true },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      required: true,
      admin: { position: "sidebar" },
      options: [
        { label: "📝 Borrador", value: "draft" },
        { label: "👀 En revisión", value: "review" },
        { label: "✅ Publicado", value: "published" }
      ]
    },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
    { name: "author", type: "relationship", relationTo: "users", admin: { position: "sidebar" } },
    {
      name: "meta",
      type: "group",
      label: "SEO",
      localized: true,
      fields: [
        { name: "title", type: "text", maxLength: 80, admin: { description: "Si se deja vacío usa el título principal" } },
        { name: "description", type: "textarea", maxLength: 200 }
      ]
    }
  ]
};
