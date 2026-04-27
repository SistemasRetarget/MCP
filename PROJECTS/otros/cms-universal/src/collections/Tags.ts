import type { CollectionConfig } from "payload";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: { useAsTitle: "name", group: "Contenido", description: "Etiquetas para clasificar posts y landings" },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true }
  ]
};
