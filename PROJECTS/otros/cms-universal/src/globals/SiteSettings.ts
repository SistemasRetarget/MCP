import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: "Configuración",
    description: "Identidad del sitio. Cambia el nombre, logo, colores y datos de contacto desde aquí."
  },
  access: { read: () => true, update: ({ req }) => (req.user as { role?: string } | null)?.role === "admin" },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identidad",
          fields: [
            { name: "siteName", type: "text", required: true, localized: true, defaultValue: "Mi CMS",
              admin: { description: "Nombre que se muestra en el header y pestaña del navegador" } },
            { name: "tagline", type: "text", localized: true, admin: { description: "Frase corta bajo el logo (opcional)" } },
            { name: "description", type: "textarea", localized: true, maxLength: 300,
              admin: { description: "Descripción que aparece en Google y redes sociales" } },
            { name: "logo", type: "upload", relationTo: "media", admin: { description: "Logo principal (se muestra en header)" } },
            { name: "logoMobile", type: "upload", relationTo: "media", admin: { description: "Logo para móvil (opcional, cuadrado)" } },
            { name: "favicon", type: "upload", relationTo: "media", admin: { description: "Icono que aparece en la pestaña del navegador (32x32 png)" } }
          ]
        },
        {
          label: "Colores",
          fields: [
            { name: "primaryColor", type: "text", defaultValue: "#8b7355", admin: { description: "Color principal (hex)" } },
            { name: "secondaryColor", type: "text", defaultValue: "#2c2419", admin: { description: "Color secundario (hex)" } },
            { name: "accentColor", type: "text", defaultValue: "#4a7c3a", admin: { description: "Color de acento/destacados" } }
          ]
        },
        {
          label: "Contacto",
          fields: [
            { name: "email", type: "email" },
            { name: "phone", type: "text" },
            { name: "whatsapp", type: "text", admin: { description: "Número con código país, sin + ni espacios (ej 56912345678)" } },
            { name: "address", type: "textarea", localized: true }
          ]
        },
        {
          label: "Redes sociales",
          fields: [
            { name: "facebook", type: "text", admin: { placeholder: "https://facebook.com/..." } },
            { name: "instagram", type: "text", admin: { placeholder: "https://instagram.com/..." } },
            { name: "twitter", type: "text", admin: { placeholder: "https://x.com/..." } },
            { name: "youtube", type: "text", admin: { placeholder: "https://youtube.com/@..." } },
            { name: "tiktok", type: "text", admin: { placeholder: "https://tiktok.com/@..." } },
            { name: "linkedin", type: "text", admin: { placeholder: "https://linkedin.com/..." } }
          ]
        },
        {
          label: "Idiomas",
          fields: [
            {
              name: "enabledLocales",
              type: "select",
              hasMany: true,
              defaultValue: ["es", "en", "pt"],
              options: [
                { label: "🇪🇸 Español", value: "es" },
                { label: "🇺🇸 English", value: "en" },
                { label: "🇧🇷 Português", value: "pt" }
              ],
              admin: { description: "Idiomas visibles en el selector del sitio público" }
            },
            {
              name: "defaultLocale",
              type: "select",
              defaultValue: "es",
              options: [
                { label: "🇪🇸 Español", value: "es" },
                { label: "🇺🇸 English", value: "en" },
                { label: "🇧🇷 Português", value: "pt" }
              ]
            }
          ]
        },
        {
          label: "SEO / Analytics",
          fields: [
            { name: "googleAnalyticsId", type: "text", admin: { description: "Ej: G-XXXXXXXXXX" } },
            { name: "googleTagManagerId", type: "text", admin: { description: "Ej: GTM-XXXXXXX" } },
            { name: "ogImage", type: "upload", relationTo: "media", admin: { description: "Imagen que se muestra al compartir en redes (1200x630)" } }
          ]
        }
      ]
    }
  ]
};
