import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1440, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "puebloladehesa.cl",
        pathname: "/cdn/shop/files/**"
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**"
      }
    ]
  },
  async redirects() {
    return [
      // Shopify product URLs -> clean casa URLs
      { source: "/products/casa-doble-altura", destination: "/casas/casa-doble-altura", permanent: true },
      { source: "/products/casa-parque",       destination: "/casas/casa-parque",       permanent: true },
      { source: "/products/casa-panoramica",   destination: "/casas/casa-panoramica",   permanent: true },
      { source: "/products/casa-suite",        destination: "/casas/casa-suite",        permanent: true },
      // Shopify pages -> clean URLs
      { source: "/pages/contact",                       destination: "/contacto",                                   permanent: true },
      { source: "/pages/nosotros",                      destination: "/nosotros",                                   permanent: true },
      { source: "/pages/experiencias",                  destination: "/experiencias",                               permanent: true },
      { source: "/pages/la-casita",                     destination: "/la-casita",                                  permanent: true },
      { source: "/pages/ubicacion",                     destination: "/ubicacion",                                  permanent: true },
      { source: "/pages/terminos-y-condiciones",        destination: "/legal/terminos-y-condiciones",               permanent: true },
      { source: "/pages/politicas-de-privacidad",       destination: "/legal/politicas-de-privacidad",              permanent: true },
      // SEO landings (until built) -> /estadias as best alternative
      { source: "/pages/arriendo-departamento-amoblado", destination: "/estadias", permanent: true },
      { source: "/pages/arriendo-por-temporada",         destination: "/estadias", permanent: true },
      { source: "/pages/arriendo-mensual",               destination: "/estadias", permanent: true },
      // Generic content pages (not built yet) -> home for now (revisit when built)
      { source: "/pages/tu-lugar",            destination: "/", permanent: false },
      { source: "/pages/espacio-panoramica",  destination: "/", permanent: false },
      { source: "/pages/pueblito",            destination: "/", permanent: false },
      { source: "/pages/guia-huespedes",      destination: "/", permanent: false }
    ];
  },
  async headers() {
    return [
      {
        source: "/((?!admin|api).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://puebloladehesa.cl https://cdn.shopify.com https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com",
              "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
              "frame-src 'self' https://www.google.com https://www.googletagmanager.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join("; ")
          }
        ]
      },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ];
  }
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
