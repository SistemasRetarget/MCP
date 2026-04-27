import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import MetaPixel from "@/components/MetaPixel";
import ConsentBanner from "@/components/ConsentBanner";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, localBusinessSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://puebloladehesa.cl";

export const metadata: Metadata = {
  title: {
    default: "Pueblo La Dehesa · Tu refugio en la ciudad",
    template: "%s · Pueblo La Dehesa"
  },
  description:
    "Casas amobladas para estadías flexibles en La Dehesa, rodeadas de naturaleza, diseño y calma.",
  alternates: {
    canonical: "/",
    languages: {
      "es-CL": "/",
      en: "/en",
      "x-default": "/"
    }
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Pueblo La Dehesa",
    title: "Pueblo La Dehesa · Tu refugio en la ciudad",
    description:
      "Casas amobladas para estadías flexibles en La Dehesa, rodeadas de naturaleza, diseño y calma.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pueblo La Dehesa — vista de la cordillera"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pueblo La Dehesa · Tu refugio en la ciudad",
    description:
      "Casas amobladas para estadías flexibles en La Dehesa, rodeadas de naturaleza, diseño y calma.",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

/**
 * Layout común a ES y EN. Incluye tracking y consent.
 * El Header/Footer se monta en cada sub-layout de idioma.
 */
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics />
      <MetaPixel />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={localBusinessSchema()} />
      {children}
      <ConsentBanner />
    </>
  );
}
