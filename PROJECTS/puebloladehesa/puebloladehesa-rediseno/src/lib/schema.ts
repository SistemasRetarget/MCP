// JSON-LD Schema.org generators

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pueblo La Dehesa",
    url: SITE,
    description:
      "Casas amobladas para estadías flexibles en La Dehesa, rodeadas de naturaleza, diseño y calma.",
    logo: `${SITE}/logo.png`,
    image: `${SITE}/media/placeholder.svg`,
    sameAs: [] as string[],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}` : undefined,
      contactType: "Customer Support",
      availableLanguage: ["es", "en"]
    }
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Pueblo La Dehesa",
    url: SITE,
    description:
      "Casas amobladas para estadías flexibles en La Dehesa, rodeadas de naturaleza, diseño y calma.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "La Dehesa",
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
      postalCode: "7590000"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -33.3573,
      longitude: -70.5306
    },
    image: `${SITE}/media/placeholder.svg`,
    priceRange: "$$$",
    telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}` : undefined,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "22:00"
      }
    ]
  };
}

export function accommodationSchema(opts: {
  name: string;
  description: string;
  slug: string;
  image: string;
  lang?: string;
}) {
  const typeUrl = opts.lang === "en" ? `${SITE}/en/houses/${opts.slug}` : `${SITE}/casas/${opts.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: opts.name,
    description: opts.description,
    image: `${SITE}${opts.image}`,
    url: typeUrl,
    priceRange: "$$$",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    petsAllowed: true,
    containedInPlace: {
      "@type": "Place",
      name: "La Dehesa",
      geo: {
        "@type": "GeoCoordinates",
        latitude: -33.3573,
        longitude: -70.5306
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "La Dehesa",
        addressRegion: "Región Metropolitana",
        addressCountry: "CL",
        postalCode: "7590000"
      }
    },
    amenityFeature: [
      { "@type": "AmendmentFeature", name: "WiFi" },
      { "@type": "AmendmentFeature", name: "Kitchen" },
      { "@type": "AmendmentFeature", name: "Parking" }
    ]
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

