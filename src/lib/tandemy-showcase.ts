import type { TandemyProject } from "./tandemy-types";

export const SHOWCASE_PROJECTS: TandemyProject[] = [
  {
    id: "demo-cafe-aroma-costos",
    ownerId: "demo-pyme",
    companyName: "Café Aroma",
    companySector: "Cafetería · Chihuahua",
    title: "Orden de costos para una cafetería",
    description:
      "Necesitamos calcular el costo real de cada bebida y definir precios de menú con margen saludable para nuestras 3 sucursales.",
    area: "Finanzas",
    activities:
      "1. Inventariar insumos y gramajes por receta.\n2. Calcular costo unitario por bebida y alimento.\n3. Proponer precios de venta y punto de equilibrio mensual.",
    requiredSkills: ["Costos", "Excel", "Precios", "Finanzas básicas"],
    targetDegrees: ["Contador Público", "Administración Financiera"],
    budget: 1500,
    duration: "10 días",
    deadline: "2026-12-15",
    status: "open",
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
  },
  {
    id: "demo-boutique-luna-redes",
    ownerId: "demo-pyme",
    companyName: "Boutique Luna",
    companySector: "Ropa y accesorios",
    title: "Diseño de 10 publicaciones para redes",
    description:
      "Publicaciones visuales y copys persuasivos para impulsar la campaña de temporada en Instagram y Facebook.",
    area: "Marketing",
    activities:
      "1. Definir línea gráfica y paleta de temporada.\n2. Diseñar 10 piezas editables en Canva.\n3. Entregar calendario sugerido de publicación y textos.",
    requiredSkills: ["Canva", "Redes sociales", "Copywriting"],
    targetDegrees: ["Administración de Empresas", "Negocios Internacionales"],
    budget: 1200,
    duration: "7 días",
    deadline: "2026-12-10",
    status: "open",
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
  },
  {
    id: "demo-moda-norte-procesos",
    ownerId: "demo-pyme",
    companyName: "Moda Norte",
    companySector: "Tienda de ropa",
    title: "Manual de procesos para tienda de ropa",
    description:
      "Documentar paso a paso los procesos operativos de venta en piso, control de inventario y atención al cliente.",
    area: "Administración",
    activities:
      "1. Levantar procesos actuales con el equipo de tienda.\n2. Elaborar diagramas de flujo y políticas de atención.\n3. Entregar manual operativo listo para capacitación.",
    requiredSkills: ["Procesos", "Inventarios", "Documentación"],
    targetDegrees: ["Administración de Empresas"],
    budget: 2200,
    duration: "12 días",
    deadline: "2026-12-20",
    status: "open",
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
  },
  {
    id: "demo-taller-perez-tramites",
    ownerId: "demo-pyme",
    companyName: "Taller Pérez",
    companySector: "Servicios automotrices",
    title: "Trámites y permisos municipales para taller",
    description:
      "Guía práctica y carpeta de requisitos con licencias y permisos municipales para operar el taller totalmente en regla.",
    area: "Gestión Pública",
    activities:
      "1. Identificar licencias municipales y de uso de suelo aplicables.\n2. Integrar checklist de formatos, costos y ventanillas.\n3. Entregar cronograma de cumplimiento.",
    requiredSkills: ["Trámites", "Gestión municipal", "Normatividad"],
    targetDegrees: ["Administración y Gestión Pública"],
    budget: 900,
    duration: "5 días",
    deadline: "2026-12-08",
    status: "open",
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
  },
  {
    id: "demo-don-chuy-tablero",
    ownerId: "demo-pyme",
    companyName: "Abarrotes Don Chuy",
    companySector: "Comercio minorista",
    title: "Tablero de ventas del último trimestre",
    description:
      "Un tablero visual para identificar qué productos tienen mayor rotación, utilidad y días pico de venta.",
    area: "Inteligencia de Negocios",
    activities:
      "1. Limpiar base de tickets y ventas de los últimos 3 meses.\n2. Construir dashboard interactivo en Power BI o Excel.\n3. Presentar hallazgos clave de inventario.",
    requiredSkills: ["Power BI", "Excel", "Análisis de datos"],
    targetDegrees: ["Inteligencia de Negocios"],
    budget: 2800,
    duration: "14 días",
    deadline: "2026-12-22",
    status: "open",
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
  },
  {
    id: "demo-raramuri-exportacion",
    ownerId: "demo-pyme",
    companyName: "Artesanías Rarámuri",
    companySector: "Artesanías · Cooperativa",
    title: "Plan de exportación a Texas",
    description:
      "Evaluar requisitos aduanales, clasificación arancelaria, logística y costos estimados para exportar artesanías chihuahuenses a Texas.",
    area: "Negocios Internacionales",
    activities:
      "1. Revisar fracción arancelaria y regulaciones de envío a EE. UU.\n2. Cotizar opciones de paquetería/agencia aduanal.\n3. Calcular precio de exportación y margen.",
    requiredSkills: ["Comercio exterior", "Incoterms", "Costos logísticos"],
    targetDegrees: ["Negocios Internacionales"],
    budget: 3200,
    duration: "20 días",
    deadline: "2026-12-28",
    status: "open",
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
  },
  {
    id: "demo-cafe-aroma-resico",
    ownerId: "demo-pyme",
    companyName: "Café Aroma",
    companySector: "Cafetería · Chihuahua",
    title: "Declaraciones y orden fiscal (RESICO)",
    description:
      "Ordenar facturas emitidas y recibidas en el trimestre y preparar hoja de trabajo para declaraciones mensuales bajo RESICO.",
    area: "Contabilidad",
    activities:
      "1. Clasificar XML de ingresos y gastos deducibles.\n2. Conciliar estados de cuenta bancarios.\n3. Armar papel de trabajo mensual de IVA e ISR.",
    requiredSkills: ["Contabilidad", "RESICO", "SAT", "Excel"],
    targetDegrees: ["Contador Público"],
    budget: 1800,
    duration: "8 días",
    deadline: "2026-12-18",
    status: "open",
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
  },
];

export function findShowcaseProjectByTitle(title?: string | null): TandemyProject | null {
  if (!title) return null;
  const normalized = title.trim().toLowerCase();
  return SHOWCASE_PROJECTS.find((p) => p.title.toLowerCase() === normalized) ?? null;
}
