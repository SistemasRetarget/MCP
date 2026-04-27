import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="es" />
      <main id="main">{children}</main>
      <Footer locale="es" />
      <FloatingWhatsApp locale="es" />
    </>
  );
}
