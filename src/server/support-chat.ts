import { GoogleGenAI, ThinkingLevel, type Content } from "@google/genai";

export type SupportAudience = "general" | "estudiante" | "pyme";

export interface ChatHistoryItem {
  role: "user" | "model";
  text: string;
}

export interface SupportChatRequestBody {
  message?: unknown;
  history?: unknown;
  audience?: unknown;
}

export const SUPPORT_CHAT_MODEL = "gemini-4-hydrogen";

const MAX_MESSAGE_LENGTH = 1500;
const MAX_HISTORY_ITEMS = 16;

export function normalizeAudience(value: unknown): SupportAudience {
  if (value === "estudiante" || value === "pyme") return value;
  return "general";
}

export function sanitizeHistory(raw: unknown): ChatHistoryItem[] {
  if (!Array.isArray(raw)) return [];

  const cleaned: ChatHistoryItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as { role?: unknown; text?: unknown };
    const role = record.role === "model" ? "model" : record.role === "user" ? "user" : null;
    const text = typeof record.text === "string" ? record.text.trim() : "";
    if (!role || !text) continue;
    cleaned.push({
      role,
      text: text.slice(0, MAX_MESSAGE_LENGTH),
    });
  }

  return cleaned.slice(-MAX_HISTORY_ITEMS);
}

export function buildSupportSystemInstruction(audience: SupportAudience): string {
  const audienceHint =
    audience === "estudiante"
      ? "El usuario está consultando en modo ESTUDIANTE: prioriza pasos concretos para estudiantes de la FCA UACH (registro, postulación, seguimiento, entregas, pagos, constancias y calificaciones)."
      : audience === "pyme"
        ? "El usuario está consultando en modo PYME: prioriza pasos concretos para pequeñas y medianas empresas (registro empresarial, publicación de proyectos, selección de talento, pago en resguardo, aprobación y calificación)."
        : "El usuario consulta en modo GENERAL: atiende tanto dudas de estudiantes como de PyMEs y visitantes de la plataforma.";

  return [
    "Eres el asistente virtual de soporte de Tandemy, una plataforma digital que conecta a estudiantes de la Facultad de Contaduría y Administración (FCA) de la UACH con pequeñas y medianas empresas (PyMEs) en Chihuahua, México.",
    audienceHint,
    "Reglas de respuesta:",
    "- Responde siempre en español claro, cercano, respetuoso y directo.",
    "- Mantén las respuestas breves y fáciles de escanear (máximo 2 párrafos cortos o una lista de 3 a 5 viñetas) porque los usuarios buscan resolver dudas sencillas rápidamente.",
    "- Si la pregunta es ambigua, responde lo esencial y ofrece 1 pregunta corta de seguimiento para ayudar mejor.",
    "- No inventes tarifas, plazos legales ni funciones que no existan en Tandemy. Si un problema requiere soporte humano directo (como un conflicto de pago o incidencia técnica de cuenta), indica escribir a contacto@tandemy.mx o usar la sección Contacto (/contacto).",
    "Información oficial de Tandemy:",
    "1) Registro y cuentas (/registro): Crear cuenta es gratuito. Hay dos tipos de cuenta: Estudiante y PyME. Para estudiantes solicita nombre completo, correo institucional (en modo demostración acepta cualquier correo válido sin códigos ni documentos), carrera (Contador Público, Administración de Empresas, Administración Financiera, Administración y Gestión Pública, Negocios Internacionales o Inteligencia de Negocios), semestre, habilidades y experiencia. Para PyMEs solicita nombre comercial, correo, contraseña, giro comercial, descripción y teléfono.",
    "2) Estudiantes (/panel-estudiante y /proyectos): Pueden explorar proyectos publicados, revisar presupuesto, duración, habilidades requeridas y fecha límite, y postularse con una propuesta. En su panel tienen: Mi perfil (editable), Proyectos disponibles, Mis postulaciones (pendiente, aceptada o rechazada), Mis proyectos (en proceso o finalizados con chat), Mis calificaciones, Mis ganancias, Mis constancias (descargables al concluir proyectos) y Notificaciones.",
    "3) PyMEs (/panel-pyme): Pueden editar su perfil de empresa, publicar proyectos (título, descripción, área, actividades, habilidades, presupuesto en MXN, duración y fecha límite), revisar postulaciones recibidas para aceptar o rechazar estudiantes, comunicarse por chat en Proyectos activos, aprobar entregas finales y calificar al estudiante.",
    "4) Pagos y comisiones: Registrarse es gratis. Tandemy cobra una comisión del 10% por proyecto completado. La PyME deposita el pago al iniciar el proyecto y Tandemy lo libera al estudiante cuando la empresa aprueba la entrega final.",
    "5) Tienda Tandemy (/tienda): Ofrece 10 plantillas y kits digitales creados por estudiantes de la FCA (finanzas, administración, marketing, legal, comercio exterior, estrategia, talento estudiantil y productividad), con precios entre $89 y $179 MXN IVA incluido. Al finalizar el carrito se muestran opciones de pago típicas (Mercado Pago, tarjeta, OXXO, SPEI y PayPal) en flujo demostrativo sin solicitar datos bancarios reales.",
  ].join("\n");
}

function readApiKey(env?: unknown): string | undefined {
  if (env && typeof env === "object") {
    const maybe = (env as Record<string, unknown>)["GEMINI_API_KEY"];
    if (typeof maybe === "string" && maybe.trim()) return maybe.trim();
  }
  const fromProcess = typeof process !== "undefined" ? process.env["GEMINI_API_KEY"] : undefined;
  return typeof fromProcess === "string" && fromProcess.trim() ? fromProcess.trim() : undefined;
}

function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 429 || status === 503 || status === 502 || status === 500) return true;
  const msg = error instanceof Error ? error.message.toLowerCase() : "";
  return msg.includes("network") || msg.includes("fetch failed") || msg.includes("timeout");
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const obj = error as { status?: unknown; code?: unknown };
  if (typeof obj.status === "number") return obj.status;
  if (typeof obj.code === "number") return obj.code;
  return undefined;
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ChatClientFactory {
  createChat: (opts: { model: string; history: Content[]; systemInstruction: string }) => {
    sendMessage: (params: { message: string }) => Promise<{ text?: string | undefined }>;
  };
}

function defaultChatFactory(apiKey: string): ChatClientFactory {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  return {
    createChat: ({ model, history, systemInstruction }) =>
      ai.chats.create({
        model,
        ...(history.length > 0 ? { history } : {}),
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      }),
  };
}

export async function generateSupportReply(params: {
  message: string;
  history: ChatHistoryItem[];
  audience: SupportAudience;
  apiKey?: string | undefined;
  clientFactory?: ChatClientFactory | undefined;
}): Promise<string> {
  const { message, history, audience, apiKey, clientFactory } = params;
  const factory = clientFactory ?? (apiKey ? defaultChatFactory(apiKey) : null);
  if (!factory) {
    throw Object.assign(new Error("GEMINI_API_KEY is missing"), { status: 503 });
  }

  const mappedHistory: Content[] = history.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));

  const chat = factory.createChat({
    model: SUPPORT_CHAT_MODEL,
    history: mappedHistory,
    systemInstruction: buildSupportSystemInstruction(audience),
  });

  let lastError: unknown;
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await chat.sendMessage({ message });
      const reply = response.text?.trim();
      if (!reply) {
        throw new Error("Empty model response");
      }
      return reply;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1 && isRetryableError(error)) {
        await wait(350 * 2 ** attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function mapPublicErrorMessage(error: unknown): { status: number; message: string; code?: string } {
  const status = getErrorStatus(error);
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (status === 503 || lower.includes("gemini_api_key is missing")) {
    return {
      status: 503,
      code: "MISSING_API_KEY",
      message:
        "El servicio de soporte con Gemini aún no tiene configurada la clave GEMINI_API_KEY en el servidor.",
    };
  }
  if (
    status === 403 ||
    lower.includes("api_key_invalid") ||
    lower.includes("api key not valid") ||
    lower.includes("permission_denied")
  ) {
    return {
      status: 502,
      code: "API_KEY_OR_PERMISSION",
      message:
        "No fue posible validar la clave del asistente en el servidor. Revisa la configuración en Settings > Secrets.",
    };
  }
  if (status === 429 || lower.includes("resource_exhausted")) {
    return {
      status: 429,
      code: "RESOURCE_EXHAUSTED",
      message:
        "El asistente está recibiendo muchas consultas en este momento. Intenta de nuevo en unos segundos.",
    };
  }
  if (status === 404 || lower.includes("not_found")) {
    return {
      status: 502,
      code: "MODEL_NOT_FOUND",
      message:
        "El modelo del asistente no está disponible temporalmente. Intenta de nuevo más tarde.",
    };
  }
  return {
    status: 500,
    code: status ? `UPSTREAM_${status}` : "INTERNAL_ERROR",
    message:
      "Ocurrió un problema al consultar al asistente. Intenta nuevamente o escríbenos desde Contacto.",
  };
}

export async function handleSupportChatRequest(
  request: Request,
  env?: unknown,
  clientFactory?: ChatClientFactory,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405);
  }

  let body: SupportChatRequestBody;
  try {
    body = (await request.json()) as SupportChatRequestBody;
  } catch {
    return jsonResponse({ error: "Solicitud JSON inválida." }, 400);
  }

  const rawMessage = typeof body.message === "string" ? body.message.trim() : "";
  if (!rawMessage) {
    return jsonResponse({ error: "Escribe una pregunta para iniciar la conversación." }, 400);
  }

  const message = rawMessage.slice(0, MAX_MESSAGE_LENGTH);
  const audience = normalizeAudience(body.audience);
  const history = sanitizeHistory(body.history);
  const apiKey = readApiKey(env);

  try {
    const reply = await generateSupportReply({
      message,
      history,
      audience,
      apiKey,
      clientFactory,
    });
    return jsonResponse({ reply, model: SUPPORT_CHAT_MODEL }, 200);
  } catch (error) {
    console.error("Support chat error:", error);
    const mapped = mapPublicErrorMessage(error);
    return jsonResponse({ error: mapped.message, code: mapped.code }, mapped.status);
  }
}
