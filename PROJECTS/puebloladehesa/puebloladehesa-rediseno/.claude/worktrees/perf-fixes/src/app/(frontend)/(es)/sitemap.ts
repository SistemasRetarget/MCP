import type { MetadataRoute } from "next";
import { listHouses } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const es = ["/", "/casas", "/experiencias", "/nosotros", "/contacto", ...listHouses("es").map((h) => `/casas/${h.path.split("/").pop()}`)];
  const en = ["/en", "/en/houses", "/en/experiences", "/en/about", "/en/contact", ...listHouses("en").map((h) => `/en/houses/${h.path.split("/").pop()}`)];
  return [...es, ...en].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "/" || p === "/en" ? 1 : 0.7,
    alternates: {
      languages: p.startsWith("/en")
        ? { es: `${base}${p.replace(/^\/en(\/houses)?/, (m, h) => (h ? "/casas" : "/"))}` }
        : undefined
    }
  }));
}
