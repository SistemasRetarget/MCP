import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata: Metadata = {
  title: { default: "Pueblo La Dehesa · Your refuge in the city", template: "%s · Pueblo La Dehesa" },
  description: "Furnished houses for flexible stays in La Dehesa, surrounded by nature, design and calm.",
  alternates: { languages: { es: "/", en: "/en" } },
  openGraph: { type: "website", locale: "en_US", siteName: "Pueblo La Dehesa" }
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      <main id="main">{children}</main>
      <Footer locale="en" />
      <FloatingWhatsApp locale="en" />
    </>
  );
}
