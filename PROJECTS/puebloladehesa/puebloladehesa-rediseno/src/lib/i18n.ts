export type Lang = "es" | "en";

export const t = {
  es: {
    houses: "Casas",
    experiences: "Experiencias",
    about: "Nosotros",
    contact: "Contacto",
    hero_title: "Tu refugio en la ciudad",
    hero_sub: "Casas rodeadas de naturaleza, diseño y calma en La Dehesa.",
    cta_houses: "Conocer las casas",
    our_houses: "Nuestras casas",
    see_experiences: "Ver experiencias →",
    whatsapp_label: "Contactar por WhatsApp",
    consult: "Consultar disponibilidad",
    gallery: "Galería",
    contact_title: "Contacto",
    contact_desc: "Escríbenos por WhatsApp o envíanos un mensaje y te responderemos pronto.",
    send: "Enviar",
    name: "Nombre",
    email: "Email",
    message: "Mensaje",
    form_ok: "Gracias, hemos recibido tu mensaje.",
    form_err: "Ocurrió un error. Inténtalo nuevamente.",
    privacy: "Privacidad"
  },
  en: {
    houses: "Houses",
    experiences: "Experiences",
    about: "About",
    contact: "Contact",
    hero_title: "Your refuge in the city",
    hero_sub: "Houses surrounded by nature, design and calm in La Dehesa.",
    cta_houses: "Discover the houses",
    our_houses: "Our houses",
    see_experiences: "See experiences →",
    whatsapp_label: "Contact us via WhatsApp",
    consult: "Check availability",
    gallery: "Gallery",
    contact_title: "Contact",
    contact_desc: "Write us on WhatsApp or send a message and we will reply shortly.",
    send: "Send",
    name: "Name",
    email: "Email",
    message: "Message",
    form_ok: "Thanks, we received your message.",
    form_err: "Something went wrong. Please try again.",
    privacy: "Privacy"
  }
} as const;

export function prefix(lang: Lang, path: string) {
  return lang === "en" ? `/en${path === "/" ? "" : path}` : path;
}
