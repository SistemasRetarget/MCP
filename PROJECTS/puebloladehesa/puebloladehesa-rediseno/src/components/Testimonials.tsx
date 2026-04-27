type Testimonial = {
  name: string;
  role: string;
  text: string;
  avatar?: string;
};

type TestimonialsProps = {
  locale?: "es" | "en";
};

export default function Testimonials({ locale = "es" }: TestimonialsProps) {
  const testimonials: Record<string, Testimonial[]> = {
    es: [
      {
        name: "Catalina Rojas",
        role: "Directora Creativa",
        text: "Pueblo La Dehesa ha sido mi refugio perfecto. La tranquilidad, la naturaleza y el diseño de las casas superó todas mis expectativas. Volveré una y otra vez.",
        avatar: "🎨"
      },
      {
        name: "Roberto Silva",
        role: "Empresario",
        text: "Un lugar ideal para trabajar desde casa sin sacrificar el confort. Las amenidades y la comunidad hacen que sea más que solo un arrendamiento.",
        avatar: "💼"
      },
      {
        name: "Valentina Morales",
        role: "Fotógrafa",
        text: "La belleza natural de La Dehesa y la calidad de las casas lo hacen el lugar perfecto para crear. La privacidad y la inspiración en un solo lugar.",
        avatar: "📸"
      }
    ],
    en: [
      {
        name: "Catalina Rojas",
        role: "Creative Director",
        text: "Pueblo La Dehesa has been my perfect refuge. The tranquility, nature, and house design exceeded all my expectations. I'll return again and again.",
        avatar: "🎨"
      },
      {
        name: "Roberto Silva",
        role: "Entrepreneur",
        text: "An ideal place to work from home without sacrificing comfort. The amenities and community make it more than just a rental.",
        avatar: "💼"
      },
      {
        name: "Valentina Morales",
        role: "Photographer",
        text: "The natural beauty of La Dehesa and the quality of the houses make it the perfect place to create. Privacy and inspiration in one location.",
        avatar: "📸"
      }
    ]
  };

  const items = testimonials[locale] || testimonials.es;
  const title = locale === "en" ? "What Our Guests Say" : "Qué Dicen Nuestros Huéspedes";

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="font-serif text-5xl md:text-6xl mb-4 font-light">{title}</h2>
        <p className="text-brand-muted text-lg max-w-2xl mx-auto">
          {locale === "en"
            ? "Discover what makes Pueblo La Dehesa special through the eyes of those who have experienced it."
            : "Descubre qué hace especial a Pueblo La Dehesa a través de quienes lo han vivido."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {items.map((testimonial, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Avatar emoji or placeholder */}
            <div className="text-4xl mb-6">{testimonial.avatar}</div>

            {/* Star rating (optional visual enhancement) */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-brand-accent text-lg">
                  ★
                </span>
              ))}
            </div>

            {/* Testimonial text */}
            <p className="text-brand-muted leading-relaxed mb-6 italic">
              "{testimonial.text}"
            </p>

            {/* Author */}
            <div className="border-t border-brand-line pt-4">
              <p className="font-semibold text-brand-ink">{testimonial.name}</p>
              <p className="text-sm text-brand-muted">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
