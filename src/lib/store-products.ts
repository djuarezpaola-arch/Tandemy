import imgCostos from "@/assets/images/product_costos_equilibrio_1794538914719.jpg";
import imgInventarios from "@/assets/images/product_inventarios_caja_1794538914549.jpg";
import imgIdentidad from "@/assets/images/product_identidad_redes_1794538915361.jpg";
import imgCalendario from "@/assets/images/product_calendario_contenido_1794538915731.jpg";
import imgLegal from "@/assets/images/product_pack_legal_1794538916048.jpg";
import imgMarca from "@/assets/images/product_registro_marca_1794538916900.jpg";
import imgExportacion from "@/assets/images/product_exportacion_comercio_1794538917157.jpg";
import imgMercado from "@/assets/images/product_estudio_mercado_1794538917649.jpg";
import imgPortafolio from "@/assets/images/product_portafolio_cv_1794538917739.jpg";
import imgProyectos from "@/assets/images/product_gestion_proyectos_1794538918173.jpg";

// Product catalogue captured from the original Tandemy store pages.
export type StoreReview = { name: string; date: string; rating: number; text: string };
export type StoreProduct = {
  slug: string;
  emoji: string;
  category: string;
  format: string;
  title: string;
  summary: string;
  description: string;
  price: number;
  author: string;
  degree: string;
  includes: string[];
  gallery: string[];
  related: string[];
  reviews: StoreReview[];
};

export const STORE_PRODUCT_IMAGES: Record<string, string> = {
  "costos-punto-equilibrio": imgCostos,
  "inventarios-flujo-caja": imgInventarios,
  "identidad-visual-redes": imgIdentidad,
  "calendario-contenido-90": imgCalendario,
  "pack-legal-contratos": imgLegal,
  "registro-marca-impi": imgMarca,
  "checklist-exportacion": imgExportacion,
  "estudio-mercado": imgMercado,
  "portafolio-cv": imgPortafolio,
  "gestion-proyectos": imgProyectos,
};

export function productImage(slug: string): string {
  return STORE_PRODUCT_IMAGES[slug] ?? imgCostos;
}

export const storeProducts: StoreProduct[] = [
  {
    slug: "costos-punto-equilibrio",
    emoji: "📊",
    category: "Finanzas",
    format: "Excel / Sheets",
    title: "Plantilla Maestra de Costos y Punto de Equilibrio",
    summary: "Calcula costos fijos, variables, márgenes y punto de equilibrio mensual.",
    description:
      "Una plantilla lista para usar que te ayuda a entender cuánto te cuesta producir, cuánto ganas por producto y cuántas unidades necesitas vender para no perder dinero. Incluye gráficos automáticos y una guía rápida pensada para dueños de negocio sin experiencia contable.",
    price: 149,
    author: "Diego Ramírez",
    degree: "Contador Público",
    includes: [
      "Archivo de Excel y versión de Google Sheets",
      "Tablero con gráficos automáticos",
      "Guía rápida en PDF (8 páginas)",
      "Ejemplo resuelto de una cafetería",
    ],
    gallery: [imgCostos, "/site-assets/5ad3729e006f53af.jpg", "/site-assets/f94ac6c757c89d80.jpg"],
    related: [],
    reviews: [
      {
        name: "Mariana G.",
        date: "14 sep 2026",
        rating: 5.0,
        text: "Por fin entiendo mis márgenes. Muy fácil de llenar.",
      },
      {
        name: "Óscar V.",
        date: "2 oct 2026",
        rating: 4.0,
        text: "Muy útil, me hubiera gustado un video explicativo.",
      },
    ],
  },
  {
    slug: "inventarios-flujo-caja",
    emoji: "📦",
    category: "Administración",
    format: "Excel / Sheets",
    title: "Control de Inventarios y Flujo de Caja PyME",
    summary: "Entradas y salidas con alertas de stock mínimo y tablero mensual.",
    description:
      "Lleva el control de tu inventario y de tu dinero en un solo archivo. Registra entradas y salidas, recibe alertas cuando un producto llegue a su stock mínimo y revisa un tablero mensual de ingresos y egresos.",
    price: 169,
    author: "Karla Peña",
    degree: "Licenciatura en Administración de Empresas",
    includes: [
      "Catálogo de productos con código",
      "Registro de movimientos",
      "Alertas de stock mínimo",
      "Flujo de caja mensual con gráficos",
    ],
    gallery: [
      imgInventarios,
      "/site-assets/5ad3729e006f53af.jpg",
      "/site-assets/f94ac6c757c89d80.jpg",
    ],
    related: [],
    reviews: [
      {
        name: "Abarrotes Don Chuy",
        date: "21 ago 2026",
        rating: 5.0,
        text: "Dejamos de quedarnos sin producto. Excelente.",
      },
    ],
  },
  {
    slug: "identidad-visual-redes",
    emoji: "🎨",
    category: "Marketing",
    format: "Canva",
    title: "Kit de Identidad Visual y Redes Sociales",
    summary: "Más de 30 plantillas editables para posts, historias y catálogo.",
    description:
      "Dale a tu negocio una imagen profesional y consistente. Plantillas editables en Canva para publicaciones, historias, portadas, catálogo en PDF y tarjetas de presentación.",
    price: 179,
    author: "Ana López",
    degree: "Licenciatura en Negocios Internacionales",
    includes: [
      "30+ plantillas editables en Canva",
      "Catálogo de productos en PDF",
      "Tarjetas de presentación",
      "Guía de colores y tipografías",
    ],
    gallery: [
      imgIdentidad,
      "/site-assets/9c3096c21b61fab2.jpg",
      "/site-assets/5ad3729e006f53af.jpg",
    ],
    related: ["calendario-contenido-90"],
    reviews: [
      {
        name: "Boutique Luna",
        date: "11 oct 2026",
        rating: 5.0,
        text: "Nuestro Instagram se ve otro. ¡Gracias!",
      },
      {
        name: "Laura M.",
        date: "20 oct 2026",
        rating: 5.0,
        text: "Las plantillas me ahorraron horas de trabajo.",
      },
    ],
  },
  {
    slug: "calendario-contenido-90",
    emoji: "📅",
    category: "Marketing",
    format: "Notion + PDF",
    title: "Calendario de Contenido y Estrategia Digital (90 días)",
    summary: "Planificador trimestral con ideas diarias y guiones para Reels/TikTok.",
    description:
      "Nunca vuelvas a preguntarte qué publicar. Un planificador de 90 días con ideas diarias, guiones cortos para Reels y TikTok, y un checklist para medir qué funciona.",
    price: 129,
    author: "Ana López",
    degree: "Licenciatura en Negocios Internacionales",
    includes: [
      "Plantilla de Notion",
      "90 ideas de contenido",
      "20 guiones para video corto",
      "Checklist de métricas",
    ],
    gallery: [
      imgCalendario,
      "/site-assets/9c3096c21b61fab2.jpg",
      "/site-assets/5ad3729e006f53af.jpg",
    ],
    related: ["identidad-visual-redes"],
    reviews: [
      {
        name: "Café Aroma",
        date: "30 jul 2026",
        rating: 4.0,
        text: "Buenas ideas, muy prácticas.",
      },
    ],
  },
  {
    slug: "pack-legal-contratos",
    emoji: "⚖️",
    category: "Legal",
    format: "Word",
    title: "Pack Legal: Contratos y Acuerdos de Colaboración",
    summary: "NDA, carta de colaboración y contrato de servicios.",
    description:
      "Formatos de referencia para formalizar acuerdos con clientes, proveedores y estudiantes. Se recomienda revisión de un profesional del derecho antes de firmar.",
    price: 139,
    author: "Luis Martínez",
    degree: "Licenciatura en Administración y Gestión Pública",
    includes: [
      "Acuerdo de confidencialidad (NDA)",
      "Carta de colaboración empresa–estudiante",
      "Contrato de prestación de servicios",
      "Instructivo de llenado",
    ],
    gallery: [imgLegal, "/site-assets/f94ac6c757c89d80.jpg", "/site-assets/5ad3729e006f53af.jpg"],
    related: ["registro-marca-impi"],
    reviews: [
      {
        name: "Taller Pérez",
        date: "3 sep 2026",
        rating: 4.0,
        text: "Claros y fáciles de adaptar.",
      },
    ],
  },
  {
    slug: "registro-marca-impi",
    emoji: "™️",
    category: "Legal",
    format: "PDF",
    title: "Guía Práctica: Registro de Marca ante el IMPI",
    summary: "Paso a paso para buscar disponibilidad y registrar tu marca.",
    description:
      "Manual informativo para buscar si tu marca está disponible, elegir la clase correcta y completar el trámite en línea ante el IMPI.",
    price: 99,
    author: "Luis Martínez",
    degree: "Licenciatura en Administración y Gestión Pública",
    includes: [
      "Guía en PDF (22 páginas)",
      "Tabla de clases de Niza simplificada",
      "Checklist de documentos",
    ],
    gallery: [imgMarca, "/site-assets/f94ac6c757c89d80.jpg", "/site-assets/5ad3729e006f53af.jpg"],
    related: ["pack-legal-contratos"],
    reviews: [],
  },
  {
    slug: "checklist-exportacion",
    emoji: "🚢",
    category: "Comercio Exterior",
    format: "PDF + Excel",
    title: "Checklist de Exportación y Comercio Exterior Básico",
    summary: "Requisitos, Incoterms y calculadora de costos logísticos.",
    description:
      "Todo lo que necesitas revisar antes de tu primera exportación: requisitos documentales, clasificación arancelaria básica, Incoterms explicados y una calculadora de costos logísticos.",
    price: 159,
    author: "Sofía Hernández",
    degree: "Licenciatura en Negocios Internacionales",
    includes: ["Checklist documental", "Guía de Incoterms 2020", "Calculadora de costos en Excel"],
    gallery: [
      imgExportacion,
      "/site-assets/f94ac6c757c89d80.jpg",
      "/site-assets/5ad3729e006f53af.jpg",
    ],
    related: [],
    reviews: [
      {
        name: "Artesanías Rarámuri",
        date: "18 jun 2026",
        rating: 5.0,
        text: "Nos guió en nuestro primer envío a Texas.",
      },
    ],
  },
  {
    slug: "estudio-mercado",
    emoji: "📝",
    category: "Estrategia",
    format: "Forms + PDF",
    title: "Plantilla de Estudio de Mercado y Encuestas",
    summary: "Cuestionario listo y guía para definir tu buyer persona.",
    description:
      "Conoce a tus clientes con un cuestionario listo para enviar y una guía para interpretar los resultados y definir tu buyer persona.",
    price: 119,
    author: "Jorge Castillo",
    degree: "Licenciatura en Inteligencia de Negocios",
    includes: [
      "Formulario de Google Forms",
      "Guía de análisis en PDF",
      "Plantilla de buyer persona",
    ],
    gallery: [imgMercado, "/site-assets/9c3096c21b61fab2.jpg", "/site-assets/5ad3729e006f53af.jpg"],
    related: [],
    reviews: [],
  },
  {
    slug: "portafolio-cv",
    emoji: "🎓",
    category: "Talento Estudiantil",
    format: "Canva + Notion",
    title: "Kit Portafolio Pro y CV de Alto Impacto",
    summary: "3 plantillas de CV, portafolio en Notion y guía de entrevistas.",
    description:
      "Pensado para estudiantes de la FCA: presenta tus proyectos de Tandemy de forma profesional y prepárate para tus entrevistas.",
    price: 89,
    author: "Karla Peña",
    degree: "Licenciatura en Administración de Empresas",
    includes: ["3 plantillas de CV en Canva", "Portafolio en Notion", "Guía de entrevistas"],
    gallery: [
      imgPortafolio,
      "/site-assets/9c3096c21b61fab2.jpg",
      "/site-assets/5ad3729e006f53af.jpg",
    ],
    related: [],
    reviews: [
      {
        name: "Diego R.",
        date: "5 oct 2026",
        rating: 5.0,
        text: "Conseguí mis prácticas con este CV.",
      },
    ],
  },
  {
    slug: "gestion-proyectos",
    emoji: "🗂️",
    category: "Productividad",
    format: "Notion / Trello",
    title: "Tablero de Gestión de Proyectos Colaborativos",
    summary: "Cronogramas, tareas, entregables y minutas para equipos.",
    description:
      "Coordina a tu equipo con cronogramas, tareas, entregables y minutas en un solo tablero.",
    price: 109,
    author: "Jorge Castillo",
    degree: "Licenciatura en Inteligencia de Negocios",
    includes: ["Plantilla de Notion", "Tablero de Trello", "Formato de minuta"],
    gallery: [
      imgProyectos,
      "/site-assets/5ad3729e006f53af.jpg",
      "/site-assets/f94ac6c757c89d80.jpg",
    ],
    related: [],
    reviews: [],
  },
];

export function findProduct(slug: string) {
  return storeProducts.find((p) => p.slug === slug);
}

export function productRating(p: StoreProduct) {
  if (p.reviews.length === 0) return 0;
  return p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length;
}
