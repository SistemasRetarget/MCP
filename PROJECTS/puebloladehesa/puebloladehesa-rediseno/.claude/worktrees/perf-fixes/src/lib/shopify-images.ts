// URLs de imágenes desde Shopify CDN
// Estas imágenes están alojadas en el CDN de Shopify y no se pierden

export const shopifyImages = {
  // Hero / Banner principal
  hero: "https://puebloladehesa.cl/cdn/shop/files/baner.webp",
  heroAlt: "https://puebloladehesa.cl/cdn/shop/files/07A0248_1.webp",
  
  // Masterplan / Ubicación
  masterplan: "https://puebloladehesa.cl/cdn/shop/files/Masterplan_1.webp",
  ubicacionAerea: "https://puebloladehesa.cl/cdn/shop/files/Locacion_AEREA_1_1_38dd9d39-992c-4897-9b6f-cd9711ae23fb.webp",
  ampliosHorizontes: "https://puebloladehesa.cl/cdn/shop/files/amplios_horizontes_1.webp",
  
  // Casas - Casa Doble Altura
  casaDobleAltura: {
    hero: "https://puebloladehesa.cl/cdn/shop/files/07A1871_870b59a3-cea5-46af-a04f-16711cf0bdd6_1.webp",
    interior: "https://puebloladehesa.cl/cdn/shop/files/07A0373_1_9306cd35-d2d4-4c49-b3de-55aa005f487c.webp",
    vista: "https://puebloladehesa.cl/cdn/shop/files/07A0374_1.webp",
  },
  
  // Casas - Casa Parque
  casaParque: {
    hero: "https://puebloladehesa.cl/cdn/shop/files/07A9319_9e57ed7b-b137-4536-ae8e-abfc85a8aeec_1.webp",
    jardin: "https://puebloladehesa.cl/cdn/shop/files/Jardin_07A9818_1.webp",
    terraza: "https://puebloladehesa.cl/cdn/shop/files/07A9353_1_1.webp",
  },
  
  // Casas - Casa Panorámica
  casaPanoramica: {
    hero: "https://puebloladehesa.cl/cdn/shop/files/07A0248.jpg",
    vista: "https://puebloladehesa.cl/cdn/shop/files/07A0248_1.webp",
    interior: "https://puebloladehesa.cl/cdn/shop/files/IMG_0153_1.webp",
  },
  
  // Casas - Casa Suite
  casaSuite: {
    hero: "https://puebloladehesa.cl/cdn/shop/files/IMG_0011_1.webp",
    interior: "https://puebloladehesa.cl/cdn/shop/files/IMG_0239_1.webp",
    dormitorio: "https://puebloladehesa.cl/cdn/shop/files/IMG_3510_1.webp",
    vista: "https://puebloladehesa.cl/cdn/shop/files/IMG_7678_1.webp",
  },
  
  // Experiencias
  experiencias: {
    cabalgata: "https://puebloladehesa.cl/cdn/shop/files/Cabalgata_1_1.webp",
    trekking: "https://puebloladehesa.cl/cdn/shop/files/trekking_1.webp",
    jardin: "https://puebloladehesa.cl/cdn/shop/files/Jardin_07A9818_1.webp",
  },
  
  // Secciones / Features
  locacion: "https://puebloladehesa.cl/cdn/shop/files/Locacion_AEREA_1_1_38dd9d39-992c-4897-9b6f-cd9711ae23fb.webp",
  arriendoFlexible: "https://puebloladehesa.cl/cdn/shop/files/Arriendo_flexible_y_sin_ataduras_07A0374_1_1_9e1c59b4-d381-446d-aa82-afe0d283b9c7.webp",
  seguridad: "https://puebloladehesa.cl/cdn/shop/files/seguridad_y_confianza_07A9597_1_bb4787db-6cd4-46f1-a31f-d924fa2a12d8.webp",
  vidaComunidad: "https://puebloladehesa.cl/cdn/shop/files/vida_en_comunidad_07A0078_1_7bdc8b09-9b68-4924-a72c-3bea87f72e31.webp",
  
  // Logo
  logo: "https://puebloladehesa.cl/cdn/shop/files/logofooter_6d4c3b15-e6fb-49e5-a8aa-cacf91689084_1.webp",
  favicon: "https://puebloladehesa.cl/cdn/shop/files/favicon-02.png",
};

// Función helper para obtener imagen con fallback
export function getImage(url: string | undefined, fallback: string = shopifyImages.hero): string {
  return url || fallback;
}

// Función para verificar si una URL es de Shopify
export function isShopifyImage(url: string): boolean {
  return url.includes("puebloladehesa.cl/cdn/shop") || url.includes("shopify");
}
