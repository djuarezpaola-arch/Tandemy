import type { Timestamp } from "firebase/firestore";

export type AccountRole = "student" | "pyme";

export const DEGREES = [
  "Contador Público",
  "Administración de Empresas",
  "Administración Financiera",
  "Administración y Gestión Pública",
  "Negocios Internacionales",
  "Inteligencia de Negocios",
] as const;

export const PROJECT_AREAS = [
  "Finanzas",
  "Contabilidad",
  "Marketing",
  "Administración",
  "Gestión Pública",
  "Inteligencia de Negocios",
  "Negocios Internacionales",
] as const;

export type ProjectStatus = "open" | "in_progress" | "completed" | "closed";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "pending" | "paid" | "pending_release" | "released" | "cancelled";
export type PaymentMethodId =
  "credit_card" | "debit_card" | "oxxo" | "bank_transfer" | "digital_wallet";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  open: "Abierto",
  in_progress: "En proceso",
  completed: "Finalizado",
  closed: "Cerrado",
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pago pendiente",
  paid: "Pago realizado",
  pending_release: "Pago pendiente de liberación",
  released: "Pago liberado al estudiante",
  cancelled: "Pago cancelado",
};

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    id: "credit_card",
    label: "Tarjeta de crédito",
    subtitle: "Visa, Mastercard o American Express (simulación)",
    badge: "Aprobación inmediata",
  },
  {
    id: "debit_card",
    label: "Tarjeta de débito",
    subtitle: "Cargo directo desde cuenta bancaria (simulación)",
    badge: "Sin comisión bancaria",
  },
  {
    id: "oxxo",
    label: "Pago en efectivo en OXXO",
    subtitle: "Ficha de pago en tienda OXXO (simulación)",
    badge: "Referencia instantánea",
  },
  {
    id: "bank_transfer",
    label: "Transferencia bancaria",
    subtitle: "SPEI interbancario 24/7 (simulación)",
    badge: "Confirmación directa",
  },
  {
    id: "digital_wallet",
    label: "Billetera digital",
    subtitle: "Mercado Pago / PayPal académico (simulación)",
    badge: "Pago en 1 clic",
  },
];

export const PLATFORM_FEE_RATE = 0.1;

export interface UserProfile {
  uid: string;
  role: AccountRole;
  displayName: string;
  photoUrl?: string;
  university?: string;
  degree?: string;
  semester?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  companyName?: string;
  businessType?: string;
  companyDescription?: string;
  city?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PrivateAccount {
  uid: string;
  role: AccountRole;
  email: string;
  phone?: string;
  rfc?: string;
  studentNumber?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TandemyProject {
  id: string;
  ownerId: string;
  companyName: string;
  companySector?: string;
  title: string;
  description: string;
  area: string;
  activities: string;
  requiredSkills: string[];
  targetDegrees: string[];
  budget: number;
  duration: string;
  deadline: string;
  status: ProjectStatus;
  selectedApplicationId?: string | null;
  selectedStudentId?: string | null;
  selectedStudentName?: string | null;
  studentConfirmedComplete: boolean;
  pymeConfirmedComplete: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProjectApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  pymeId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentDegree?: string;
  studentSemester?: string;
  studentSkills?: string[];
  proposedAmount: number;
  proposedDuration: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SimulatedPayment {
  id: string;
  projectId: string;
  projectTitle: string;
  pymeId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  amount: number;
  platformFee: number;
  studentNetAmount: number;
  paymentMethod?: string;
  referenceCode?: string;
  status: PaymentStatus;
  paidAt?: Timestamp | null;
  releasedAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface DigitalCertificate {
  id: string;
  certificateCode: string;
  projectId: string;
  projectTitle: string;
  activitiesSummary: string;
  studentId: string;
  studentName: string;
  studentDegree?: string;
  studentUniversity?: string;
  pymeId: string;
  companyName: string;
  completedAt: string;
  issuedAt?: Timestamp;
}

export interface ProjectReview {
  id: string;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: AccountRole;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
}

export interface PlatformNotification {
  id: string;
  recipientId: string;
  senderId: string;
  type: string;
  title: string;
  body: string;
  linkPath?: string;
  relatedProjectId?: string;
  read: boolean;
  createdAt?: Timestamp;
}

export interface ProjectMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: AccountRole;
  recipientId: string;
  body: string;
  createdAt?: Timestamp;
}

export function formatMxn(amount: number): string {
  return `$${Number(amount || 0).toLocaleString("es-MX")} MXN`;
}

export function formatTimestamp(ts?: Timestamp | null): string {
  if (!ts) return "Reciente";
  try {
    return ts.toDate().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Reciente";
  }
}

export function computeFeeBreakdown(amount: number) {
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0));
  const platformFee = Math.round(safeAmount * PLATFORM_FEE_RATE);
  const studentNetAmount = Math.max(0, safeAmount - platformFee);
  return { amount: safeAmount, platformFee, studentNetAmount };
}
