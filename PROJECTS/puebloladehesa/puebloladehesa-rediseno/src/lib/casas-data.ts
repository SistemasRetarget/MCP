/**
 * Datos reales por casa extraídos de producción puebloladehesa.cl
 * Imágenes desde Shopify CDN (URLs sin prefijo cdn_shop_files_)
 */

const CDN = "https://puebloladehesa.cl/cdn/shop/files";

export type CasaData = {
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  surface: string;
  capacity: string;
  capacityEn: string;
  beds: string;
  bedsEn: string;
  baths: string;
  description: string[];
  descriptionEn: string[];
  hero: string;
  gallery: string[];
};

const COMMON_AMENITIES = [
  "Casas 100% amobladas y equipadas (living, comedor, dormitorios, cocina completa, baños)",
  "Cocina equipada con refrigerador, horno, microondas, cafetera, hervidor, vajilla y utensilios básicos",
  "Wifi de alta velocidad",
  "Terraza privada con vistas despejadas a la cordillera",
  "Ropa de cama y toallas",
  "Lavadora/secadora dentro de la unidad",
  "Servicio de limpieza y lavandería (opcional)",
  "Seguridad 24/7 y acceso controlado",
  "Soporte permanente durante la estadía",
  "Acceso a quinchos equipados",
  "Acceso a un gran parque y jardines",
  'Cafetería exclusiva "La Casita" para residentes',
];

const COMMON_AMENITIES_EN = [
  "Fully furnished and equipped homes (living, dining, bedrooms, full kitchen, bathrooms)",
  "Kitchen with refrigerator, oven, microwave, coffee maker, kettle, dishware and basic utensils",
  "High-speed WiFi",
  "Private terrace with clear views of the Andes",
  "Bed linens and towels",
  "Washer/dryer in unit",
  "Cleaning and laundry service (optional)",
  "24/7 security with controlled access",
  "Permanent support during your stay",
  "Access to equipped BBQ areas",
  "Access to a large park and gardens",
  '"La Casita" exclusive café for residents',
];

const HOUSE_RULES = [
  "No se permite fumar dentro de las casas, para mantener un ambiente limpio y cuidado.",
  "Pueblo mantiene un entorno sin mascotas, para cuidar la experiencia de todos.",
];

const HOUSE_RULES_EN = [
  "Smoking is not allowed inside the homes, to maintain a clean and well-kept environment.",
  "Pueblo maintains a pet-free environment to preserve the experience for all guests.",
];

export const COMMON = {
  amenities: COMMON_AMENITIES,
  amenitiesEn: COMMON_AMENITIES_EN,
  rules: HOUSE_RULES,
  rulesEn: HOUSE_RULES_EN,
};

export const CASAS: Record<string, CasaData> = {
  "casa-doble-altura": {
    slug: "casa-doble-altura",
    name: "Casa Doble Altura",
    nameEn: "Double Height House",
    tagline: "2 HABITACIONES / 2,5 BAÑOS",
    taglineEn: "2 BEDROOMS / 2.5 BATHS",
    surface: "Superficie interior (1° y 2° piso) 73 m²",
    capacity: "Ideal para hasta 4 personas",
    capacityEn: "Ideal for up to 4 people",
    beds: "2 habitaciones",
    bedsEn: "2 bedrooms",
    baths: "2,5 baños",
    description: [
      "Casa distribuida en dos pisos, donde la doble altura aporta luz y sensación de amplitud. En el segundo nivel, una de las habitaciones se abre hacia el living, generando una relación visual continua y una experiencia espacial poco habitual.",
      "Pensada para quienes buscan altura, luz y una experiencia espacial más fluida.",
    ],
    descriptionEn: [
      "Two-story home where double height brings in light and a sense of spaciousness. On the second level, one of the bedrooms opens to the living area, creating a continuous visual connection and an unusual spatial experience.",
      "Designed for those seeking height, light and a more fluid spatial experience.",
    ],
    hero: `${CDN}/07A1871_870b59a3-cea5-46af-a04f-16711cf0bdd6_1.webp`,
    gallery: [
      `${CDN}/07A1709.jpg`,
      `${CDN}/07A1695.jpg`,
      `${CDN}/image00106.jpg`,
      `${CDN}/07A0190_c479865f-4fb4-4e27-98dd-377fd21d764e.jpg`,
      `${CDN}/07A9302_aa2baa03-3dc8-4580-89d7-9968c6a51cc4.jpg`,
      `${CDN}/07A1700.jpg`,
      `${CDN}/07A9996.jpg`,
      `${CDN}/07A9292_d6b65bea-646a-4d48-8b23-6a9e8b817798.jpg`,
      `${CDN}/07A1718.jpg`,
      `${CDN}/07A9579.jpg`,
    ],
  },
  "casa-parque": {
    slug: "casa-parque",
    name: "Casa Parque",
    nameEn: "Park House",
    tagline: "2 HABITACIONES / 2 BAÑOS",
    taglineEn: "2 BEDROOMS / 2 BATHS",
    surface: "Superficie interior 54 m²",
    capacity: "Ideal para hasta 4 personas",
    capacityEn: "Ideal for up to 4 people",
    beds: "2 habitaciones",
    bedsEn: "2 bedrooms",
    baths: "2 baños",
    description: [
      "Ubicada en primer piso, esta casa mantiene una relación directa con el parque y los jardines del proyecto. El estar se abre hacia la terraza privada, creando una conexión constante con el exterior y una sensación de continuidad con la naturaleza.",
      "Ideal para quienes valoran vivir a nivel de parque y disfrutar el verde como parte del día a día.",
    ],
    descriptionEn: [
      "Located on the ground floor, this house maintains a direct relationship with the park and gardens of the project. The living area opens to the private terrace, creating a constant connection with the outside and a sense of continuity with nature.",
      "Ideal for those who value living at park level and enjoying greenery as part of daily life.",
    ],
    hero: `${CDN}/07A9319_9e57ed7b-b137-4536-ae8e-abfc85a8aeec_1.webp`,
    gallery: [
      `${CDN}/07A1621.jpg`,
      `${CDN}/07A0142.jpg`,
      `${CDN}/07A0373_1_43afb3c4-8048-46c8-af7a-db320b4ff01d.jpg`,
      `${CDN}/07A1654.jpg`,
      `${CDN}/07A1643.jpg`,
      `${CDN}/07A0190_3f6ac164-8683-45c3-b95c-6b6621af1d5c.jpg`,
      `${CDN}/07A0103_4c9da2ef-db04-4e7e-89ee-983ff4f4cc77.jpg`,
      `${CDN}/07A1640.jpg`,
      `${CDN}/07A9542.jpg`,
      `${CDN}/07A0373_1.jpg`,
    ],
  },
  "casa-panoramica": {
    slug: "casa-panoramica",
    name: "Casa Panorámica",
    nameEn: "Panoramic House",
    tagline: "2 HABITACIONES / 2 BAÑOS",
    taglineEn: "2 BEDROOMS / 2 BATHS",
    surface: "Superficie interior 61 m²",
    capacity: "Ideal para hasta 4 personas",
    capacityEn: "Ideal for up to 4 people",
    beds: "2 habitaciones",
    bedsEn: "2 bedrooms",
    baths: "2 baños",
    description: [
      "Un segundo piso que mira lejos, con la cordillera marcando el ritmo del día.",
      "En un segundo nivel, esta casa ofrece vistas despejadas y una relación más abierta con el paisaje. La terraza privada acompaña la vista y marca distintos momentos del día, desde la mañana hasta el atardecer.",
      "Pensada para quienes priorizan las vistas, la luz y una experiencia más panorámica.",
    ],
    descriptionEn: [
      "A second floor that looks far, with the Andes setting the pace of the day.",
      "On a second level, this house offers clear views and a more open relationship with the landscape. The private terrace accompanies the view and marks different moments of the day, from morning to sunset.",
      "Designed for those who prioritize views, light and a more panoramic experience.",
    ],
    hero: `${CDN}/07A0248.jpg`,
    gallery: [
      `${CDN}/07A1621.jpg`,
      `${CDN}/07A1654.jpg`,
      `${CDN}/07A1643.jpg`,
      `${CDN}/07A1640.jpg`,
      `${CDN}/07A9279_19770f0b-953d-4df4-a749-89b3266bedf7.jpg`,
      `${CDN}/07A0209.jpg`,
      `${CDN}/07A9285_e982bd26-53c2-470a-9822-bff14d35e32a.jpg`,
      `${CDN}/07A0248_1.webp`,
    ],
  },
  "casa-suite": {
    slug: "casa-suite",
    name: "Casa Suite",
    nameEn: "Suite House",
    tagline: "1 HABITACIÓN / 1,5 BAÑOS",
    taglineEn: "1 BEDROOM / 1.5 BATHS",
    surface: "Superficie interior 48 m²",
    capacity: "Ideal para hasta 2 personas",
    capacityEn: "Ideal for up to 2 people",
    beds: "1 habitación",
    bedsEn: "1 bedroom",
    baths: "1,5 baños",
    description: [
      "Un dormitorio, más espacio, más luz y mayor sensación de amplitud.",
      "Una casa de un dormitorio que destaca por su amplitud y una distribución más abierta. Los espacios se sienten continuos y bien proporcionados, ofreciendo una experiencia distinta dentro de Pueblo.",
      "Pensada para quienes buscan una opción más premium, con mayor sensación de espacio.",
    ],
    descriptionEn: [
      "One bedroom, more space, more light and greater sense of openness.",
      "A one-bedroom home that stands out for its spaciousness and more open layout. The spaces feel continuous and well-proportioned, offering a distinct experience within Pueblo.",
      "Designed for those seeking a more premium option, with a greater sense of space.",
    ],
    hero: `${CDN}/IMG_0011_1.webp`,
    gallery: [
      `${CDN}/07A1718.jpg`,
      `${CDN}/07A9257_99038bce-ebe0-498e-b891-4e3227790c68.jpg`,
      `${CDN}/07A1713.jpg`,
      `${CDN}/07A9250_4b5c9d97-f70d-44cf-840f-9d31704fc388.jpg`,
      `${CDN}/07A1717.jpg`,
      `${CDN}/07A9279_f1f93d34-17cc-4741-afd6-6eb48314b341.jpg`,
      `${CDN}/CASAS_0001_Capa_2.jpg`,
      `${CDN}/07A0190_1.jpg`,
    ],
  },
};

export function getCasa(slug: string): CasaData | undefined {
  return CASAS[slug];
}

export function listCasas(): CasaData[] {
  return Object.values(CASAS);
}
