import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "published", "updatedAt"],
    group: "Contenido"
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Ej: home, nosotros, experiencias, contacto" }
    },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", localized: true },
    { name: "published", type: "checkbox", defaultValue: true },
    {
      name: "meta",
      type: "group",
      localized: true,
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea", maxLength: 200 }
      ]
    }
  ]
};
