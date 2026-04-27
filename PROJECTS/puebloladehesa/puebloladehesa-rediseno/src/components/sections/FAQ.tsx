"use client";

import { useState } from "react";

type FAQItem = {
  q: string;
  a: string;
};

const FAQ_ES: FAQItem[] = [
  {
    q: "¿Cuál es el período mínimo de arriendo?",
    a: "Nuestras estadías son flexibles: aceptamos reservas desde algunos días (modalidad por temporada), arriendos mensuales y largo plazo. Adaptamos nuestra oferta a tus necesidades.",
  },
  {
    q: "¿Las casas vienen completamente amobladas?",
    a: "Sí. Todas nuestras casas están 100% amobladas y equipadas: living, comedor, dormitorios, cocina completa, baños, ropa de cama, toallas, vajilla y utensilios básicos.",
  },
  {
    q: "¿Hay servicios incluidos?",
    a: "Incluimos WiFi de alta velocidad, lavadora/secadora dentro de la unidad, terraza privada, acceso al parque y a La Casita (salón gourmet exclusivo para huéspedes), seguridad 24/7 y soporte permanente. Servicio de limpieza disponible diaria o semanalmente.",
  },
  {
    q: "¿Se permiten mascotas?",
    a: "No. Pueblo mantiene un entorno sin mascotas para cuidar la experiencia de todos los huéspedes.",
  },
  {
    q: "¿Se puede fumar dentro de las casas?",
    a: "No se permite fumar dentro de las casas para mantener un ambiente limpio y cuidado. Hay espacios exteriores disponibles.",
  },
  {
    q: "¿Cómo es el proceso de reserva?",
    a: "Puedes reservar online a través del botón 'Reservar Acá', escribirnos por WhatsApp para una respuesta rápida, o completar el formulario de contacto. Te enviamos disponibilidad y precios con todas las opciones.",
  },
  {
    q: "¿Qué tipos de casa puedo elegir?",
    a: "Tenemos 4 tipologías: Casa Doble Altura (2 hab/2,5 baños), Casa Parque (2 hab/2 baños), Casa Panorámica (2 hab/2 baños) y Casa Suite (1 hab/1,5 baños). Todas con vistas a la cordillera y terraza privada.",
  },
  {
    q: "¿Hay actividades organizadas?",
    a: "Sí, contamos con un calendario de experiencias en tres mundos: Naturaleza (caminatas, trekking, helicóptero), Pausa (yoga, meditación, talleres) y Comunidad (encuentros, exposiciones, cultura).",
  },
];

const FAQ_EN: FAQItem[] = [
  {
    q: "What is the minimum rental period?",
    a: "Our stays are flexible: we accept reservations from a few days (seasonal rental), monthly rentals and long-term. We adapt our offer to your needs.",
  },
  {
    q: "Are the homes fully furnished?",
    a: "Yes. All our homes are fully furnished and equipped: living, dining, bedrooms, full kitchen, bathrooms, bed linens, towels, dishware and basic utensils.",
  },
  {
    q: "What services are included?",
    a: "We include high-speed WiFi, washer/dryer in unit, private terrace, access to the park and La Casita (exclusive gourmet hall for guests), 24/7 security and permanent support. Cleaning service available daily or weekly.",
  },
  {
    q: "Are pets allowed?",
    a: "No. Pueblo maintains a pet-free environment to preserve the experience for all guests.",
  },
  {
    q: "Is smoking allowed inside the homes?",
    a: "No smoking is allowed inside the homes to maintain a clean and well-kept environment. Outdoor spaces are available.",
  },
  {
    q: "How does the booking process work?",
    a: "You can book online via the 'Book Now' button, message us via WhatsApp for a quick response, or fill out the contact form. We'll send availability and pricing with all options.",
  },
  {
    q: "What house types are available?",
    a: "We have 4 typologies: Double Height House (2 BR/2.5 BA), Park House (2 BR/2 BA), Panoramic House (2 BR/2 BA) and Suite House (1 BR/1.5 BA). All with mountain views and private terrace.",
  },
  {
    q: "Are there organized activities?",
    a: "Yes, we have a calendar of experiences in three worlds: Nature (hikes, trekking, helicopter), Pause (yoga, meditation, workshops) and Community (gatherings, exhibitions, culture).",
  },
];

type Props = { locale?: "es" | "en" };

export default function FAQ({ locale = "es" }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  const items = locale === "en" ? FAQ_EN : FAQ_ES;
  const title = locale === "en" ? "Frequently Asked Questions" : "Preguntas Frecuentes";
  const subtitle = locale === "en"
    ? "Everything you need to know about staying at Pueblo La Dehesa"
    : "Todo lo que necesitas saber sobre estadías en Pueblo La Dehesa";

  return (
    <section className="bg-brand-soft py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">{title}</h2>
          <p className="text-lg text-brand-muted">{subtitle}</p>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              open={open === i}
              onClick={(e) => {
                e.preventDefault();
                setOpen(open === i ? null : i);
              }}
              className="bg-white rounded-lg overflow-hidden border border-brand-line group"
            >
              <summary className="flex justify-between items-center cursor-pointer px-6 py-5 hover:bg-brand-soft/30 transition-colors list-none">
                <span className="font-serif text-lg font-light text-brand-ink pr-4">{item.q}</span>
                <span className={`text-2xl text-brand-accent transition-transform duration-300 flex-shrink-0 ${open === i ? "rotate-45" : ""}`}>
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 text-brand-muted leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
