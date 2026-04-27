// JSON-LD Schema.org generators

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Pueblo La Dehesa",
    url: SITE,
    description:
      "Casas amobladas para estadías flexibles en La Dehesa, rodeadas de naturaleza, diseño y calma.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "La Dehesa",
      addressRegion: "Región Metropolitana",
      addressCountry: "CL"
    },
    geo: { "@type": "GeoCoordinates", latitude: -33.3573, longitude: -70.5306 },
    image: `${SITE}/media/placeholder.svg`,
    priceRange: "$$$",
    telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}` : undefined,
    sameAs: [] as string[]
  };
}

export function accommodationSchema(opts: {
  name: string;
  description: string;
  slug: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: opts.name,
    description: opts.description,
    image: `${SITE}${opts.image}`,
    url: `${SITE}/casas/${opts.slug}`,
    containedInPlace: {
      "@type": "Place",
      name: "Pueblo La Dehesa",
      address: { "@type": "PostalAddress", addressLocality: "La Dehesa", addressCountry: "CL" }
    }
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.url}`
    }))
  };
}

