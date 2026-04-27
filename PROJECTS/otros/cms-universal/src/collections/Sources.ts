import type { CollectionConfig } from "payload";

export const Sources: CollectionConfig = {
  slug: "sources",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "active", "lastFetchedAt", "url"],
    group: "Noticias"
  },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "rss",
      options: [
        { label: "RSS / Atom feed", value: "rss" },
        { label: "URL HTML (scraping)", value: "html" },
        { label: "Sitemap.xml", value: "sitemap" }
      ]
    },
    { name: "url", type: "text", required: true, admin: { description: "URL del feed RSS o página" } },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: { description: "Categorías a las que pertenecen los artículos de esta fuente" }
    },
    {
      name: "language",
      type: "select",
      defaultValue: "es",
      options: [
        { label: "Español", value: "es" },
        { label: "English", value: "en" },
        { label: "Portugués", value: "pt" }
      ]
    },
    {
      name: "prompt",
      type: "textarea",
      admin: {
        description:
          "Prompt custom opcional para la IA al reescribir artículos de esta fuente. Si está vacío usa el prompt global."
      }
    },
    { name: "maxArticlesPerFetch", type: "number", defaultValue: 5, min: 1, max: 50 },
    { name: "active", type: "checkbox", defaultValue: true },
    { name: "lastFetchedAt", type: "date", admin: { readOnly: true, position: "sidebar" } },
    {
      name: "lastFetchStatus",
      type: "select",
      admin: { readOnly: true, position: "sidebar" },
      options: [
        { label: "Ok", value: "ok" },
        { label: "Error", value: "error" },
        { label: "Pendiente", value: "pending" }
      ]
    },
    { name: "lastFetchError", type: "textarea", admin: { readOnly: true, position: "sidebar" } }
  ]
};
