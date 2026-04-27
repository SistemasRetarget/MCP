import Image from "next/image";

type Feature = {
  title: string;
  text: string;
  img: string;
};

const FEATURES_ES: Feature[] = [
  {
    title: "Inmersión en la naturaleza",
    text: "La cordillera no es un paisaje: es nuestra inspiración.",
    img: "https://puebloladehesa.cl/cdn/shop/files/amplios_horizontes_1.webp"
  },
  {
    title: "Ubicación",
    text: "Cerca de todo, envuelta en silencio.",
    img: "https://puebloladehesa.cl/cdn/shop/files/Locacion_AEREA_1_1_38dd9d39-992c-4897-9b6f-cd9711ae23fb.webp"
  },
  {
    title: "Seguridad y confianza",
    text: "Tu bienestar es nuestra prioridad.",
    img: "https://puebloladehesa.cl/cdn/shop/files/seguridad_y_confianza_07A9597_1_bb4787db-6cd4-46f1-a31f-d924fa2a12d8.webp"
  },
  {
    title: "Arriendo flexible",
    text: "Libertad para vivir a tu ritmo.",
    img: "https://puebloladehesa.cl/cdn/shop/files/Arriendo_flexible_y_sin_ataduras_07A0374_1_1_9e1c59b4-d381-446d-aa82-afe0d283b9c7.webp"
  },
  {
    title: "Vida en comunidad",
    text: "Creemos en el valor de compartir.",
    img: "https://puebloladehesa.cl/cdn/shop/files/07A1871_870b59a3-cea5-46af-a04f-16711cf0bdd6_1.webp"
  }
];

const FEATURES_EN: Feature[] = [
  {
    title: "Immersed in nature",
    text: "The Andes are not a view: they are our inspiration.",
    img: "https://puebloladehesa.cl/cdn/shop/files/amplios_horizontes_1.webp"
  },
  {
    title: "Location",
    text: "Close to everything, surrounded by silence.",
    img: "https://puebloladehesa.cl/cdn/shop/files/Locacion_AEREA_1_1_38dd9d39-992c-4897-9b6f-cd9711ae23fb.webp"
  },
  {
    title: "Safety & trust",
    text: "Your wellbeing is our priority.",
    img: "https://puebloladehesa.cl/cdn/shop/files/seguridad_y_confianza_07A9597_1_bb4787db-6cd4-46f1-a31f-d924fa2a12d8.webp"
  },
  {
    title: "Flexible stays",
    text: "Live at your own pace.",
    img: "https://puebloladehesa.cl/cdn/shop/files/Arriendo_flexible_y_sin_ataduras_07A0374_1_1_9e1c59b4-d381-446d-aa82-afe0d283b9c7.webp"
  },
  {
    title: "Community",
    text: "We believe in sharing.",
    img: "https://puebloladehesa.cl/cdn/shop/files/07A1871_870b59a3-cea5-46af-a04f-16711cf0bdd6_1.webp"
  }
];

type Props = { locale?: "es" | "en" };

export default function Features({ locale = "es" }: Props) {
  const items = locale === "en" ? FEATURES_EN : FEATURES_ES;
  return (
    <section className="w-full py-0 overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
        {items.map((f) => (
          <div key={f.title} className="flex flex-col h-full">
            <div className="relative w-full h-[400px] overflow-hidden bg-brand-soft">
              <Image
                src={f.img}
                alt={f.title}
                fill
                sizes="(max-width:768px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 bg-white flex flex-col flex-1 justify-center">
              <h3 className="font-serif text-sm uppercase tracking-widest font-light mb-3 leading-tight">{f.title}</h3>
              <p className="text-xs text-brand-muted leading-relaxed">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
