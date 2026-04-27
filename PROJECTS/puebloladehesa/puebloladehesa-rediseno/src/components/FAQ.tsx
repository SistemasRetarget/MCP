"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  locale?: "es" | "en";
};

export default function FAQ({ locale = "es" }: FAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: Record<string, FAQItem[]> = {
    es: [
      {
        question: "¿Cuál es la duración mínima de arrendamiento?",
        answer:
          "Ofrecemos flexibilidad en la duración de las estadías. Dependiendo de la propiedad, podemos acomodar desde fines de semana hasta estadías extendidas. Contáctanos para discutir tus necesidades específicas."
      },
      {
        question: "¿Incluye servicios adicionales o es solo la casa?",
        answer:
          "Nuestras casas vienen completamente amobladas y equipadas con servicios modernos. Algunos servicios como limpieza, lavandería y mantenimiento pueden ser coordinados según lo necesites."
      },
      {
        question: "¿Es posible organizar eventos o reuniones en las propiedades?",
        answer:
          "Sí, entendemos que nuestros huéspedes valoran la privacidad y el espacio. Para eventos específicos, contáctanos para discutir disponibilidad y arreglos especiales."
      },
      {
        question: "¿Qué incluye el precio de arrendamiento?",
        answer:
          "El precio incluye la vivienda completamente amoblada, servicios básicos (agua, electricidad, internet), y acceso a todas las comodidades de la casa. Los costos adicionales dependerán de servicios extras que requieras."
      },
      {
        question: "¿Hay lugares de estacionamiento?",
        answer:
          "Todas nuestras propiedades cuentan con estacionamiento privado. La mayoría tiene garaje cubierto o espacios designados. Consulta detalles específicos de cada casa."
      },
      {
        question: "¿Cuál es la política de cancelación?",
        answer:
          "Nuestra política es flexible y depende del tipo de reserva. Generalmente ofrecemos cancelación gratuita hasta 14 días antes de la llegada. Para términos específicos, contáctanos directamente."
      }
    ],
    en: [
      {
        question: "What is the minimum rental duration?",
        answer:
          "We offer flexibility in stay duration. Depending on the property, we can accommodate from weekends to extended stays. Contact us to discuss your specific needs."
      },
      {
        question: "Does the price include additional services?",
        answer:
          "Our houses come fully furnished and equipped with modern services. Services like cleaning, laundry, and maintenance can be coordinated as needed."
      },
      {
        question: "Can we organize events or gatherings at the properties?",
        answer:
          "Yes, we understand that our guests value privacy and space. For specific events, contact us to discuss availability and special arrangements."
      },
      {
        question: "What is included in the rental price?",
        answer:
          "The price includes the fully furnished home, basic services (water, electricity, internet), and access to all house amenities. Additional costs depend on extra services you require."
      },
      {
        question: "Are there parking spaces?",
        answer:
          "All our properties have private parking. Most have covered garages or designated spaces. Check specific details for each house."
      },
      {
        question: "What is the cancellation policy?",
        answer:
          "Our policy is flexible and depends on the type of reservation. We generally offer free cancellation up to 14 days before arrival. For specific terms, contact us directly."
      }
    ]
  };

  const items = faqs[locale] || faqs.es;
  const title = locale === "en" ? "Frequently Asked Questions" : "Preguntas Frecuentes";

  return (
    <section className="max-w-3xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="font-serif text-5xl md:text-6xl mb-4 font-light">{title}</h2>
        <p className="text-brand-muted text-lg">
          {locale === "en"
            ? "Find answers to common questions about our properties and services."
            : "Encuentra respuestas a las preguntas más comunes sobre nuestras propiedades y servicios."}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-brand-line rounded-lg overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-brand-soft/30 transition-colors"
              aria-expanded={openIdx === idx}
            >
              <h3 className="font-semibold text-left text-brand-ink">{item.question}</h3>
              <svg
                className={`w-5 h-5 text-brand-accent flex-shrink-0 ml-4 transition-transform duration-300 ${
                  openIdx === idx ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {openIdx === idx && (
              <div className="px-6 py-4 bg-brand-soft/20 border-t border-brand-line">
                <p className="text-brand-muted leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
