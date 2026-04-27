import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Arriendo Mensual | Pueblo La Dehesa",
  description: "¿Buscas arriendo mensual en Santiago? Pueblo La Dehesa ofrece casas amobladas con privacidad, tranquilidad y servicios incluidos. Una alternativa superior al hotel.",
  openGraph: {
    title: "Arriendo Mensual | Pueblo La Dehesa",
    description: "Una nueva forma de habitar la ciudad, mes a mes",
    type: "website",
    locale: "es_CL",
  },
};

const SERVICIOS = [
  { icon: "🏠", title: "Unidades 100% equipadas", text: "No te faltará nada. Todo listo para que solo llegues y disfrutes." },
  { icon: "✨", title: "Limpieza diaria o semanal", text: "Nuestro servicio de limpieza se ofrece según el largo de tu estadía." },
  { icon: "☕", title: "Desayuno opcional", text: "Ofrecemos opciones con desayuno incluido para mañanas tranquilas." },
  { icon: "🧘", title: "Calendario de experiencias", text: "Yoga, meditación, trekking, experiencias culturales y comunidad." },
];

export default function Mensual() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[450px] overflow-hidden -mt-20 lg:-mt-24">
        <Image src={shopifyImages.casaDobleAltura.hero} alt="Arriendo Mensual" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Estadías</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Arriendo Mensual
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            Una nueva forma de habitar la ciudad
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          ¿Buscas arriendo mensual? Conoce Pueblo La Dehesa
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Hay ocasiones en que necesitamos un espacio listo para una estadía temporal. Un viaje
          de trabajo, un proyecto que te retiene en Santiago, la espera de un departamento o una
          remodelación en tu próximo hogar.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Queremos ofrecerte una solución a tu experiencia, con un nuevo nivel de privacidad y
          tranquilidad que no te ofrecerá un hotel.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          En Pueblo La Dehesa queremos presentarte una alternativa de paz y calma. Nos
          incorporamos a tu estilo de vida, pero dando un valor agregado a tus tardes, noches
          y fines de semana.
        </p>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
              ¿Qué servicios y experiencias ofrecemos?
            </h2>
            <p className="text-lg text-brand-muted">
              Todo lo que necesitas, en un solo lugar
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICIOS.map((s) => (
              <div key={s.title} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-semibold text-brand-ink mb-2">{s.title}</h3>
                <p className="text-sm text-brand-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
            Descubre la comodidad, tranquilidad y accesibilidad
          </h3>
          <p className="text-lg opacity-90 mb-8">
            que tenemos para ti en Pueblo La Dehesa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors"
            >
              Reservar Ahora
            </a>
            <Link href="/contacto" className="inline-block border border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-ink transition-colors">
              Cotizar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
