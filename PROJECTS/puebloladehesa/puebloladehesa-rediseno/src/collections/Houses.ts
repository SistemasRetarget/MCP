import type { CollectionConfig } from "payload";

export const Houses: CollectionConfig = {
  slug: "houses",
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
      admin: { description: "URL: /casas/<slug>" }
    },
    { name: "shortDescription", type: "textarea", localized: true, maxLength: 300 },
    { name: "heroImage", type: "upload", relationTo: "media", required: false },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    {
      name: "body",
      type: "richText",
      localized: true,
      admin: { description: "Cuerpo principal de la ficha de la casa" }
    },
    {
      name: "features",
      type: "array",
      localized: true,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text" }
      ]
    },
    { name: "order", type: "number", defaultValue: 0 },
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
