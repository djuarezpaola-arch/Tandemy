import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  AlertCircle,
  Building2,
  GraduationCap,
  Headphones,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { useTandemyAuth } from "@/components/student-session";
import { Button } from "@/components/ui/button";

export type SupportAudience = "general" | "estudiante" | "pyme";

export interface SupportChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  createdAt: number;
}

const STORAGE_KEY = "tandemy-support-chat-v1";

const AUDIENCE_LABELS: { id: SupportAudience; label: string }[] = [
  { id: "general", label: "General" },
  { id: "estudiante", label: "Estudiante" },
  { id: "pyme", label: "PyME" },
];

const QUICK_QUESTIONS: Record<SupportAudience, string[]> = {
  general: [
    "¿Cómo funciona Tandemy?",
    "¿Cómo me registro como estudiante o PyME?",
    "¿Cómo compro plantillas en la tienda?",
  ],
  estudiante: [
    "¿Cómo me postulo a un proyecto?",
    "¿Cuándo y cómo recibo mi pago?",
    "¿Cómo descargo mi constancia?",
  ],
  pyme: [
    "¿Cómo publico un proyecto?",
    "¿Cuánto cobra Tandemy de comisión?",
    "¿Cómo selecciono y pago a un estudiante?",
  ],
};

function createWelcomeMessage(audience: SupportAudience): SupportChatMessage {
  const text =
    audience === "estudiante"
      ? "Hola, soy el asistente de soporte de Tandemy. Puedo ayudarte con dudas sobre tu registro, postulaciones a proyectos, pagos o descarga de constancias."
      : audience === "pyme"
        ? "Hola, soy el asistente de soporte de Tandemy. Puedo orientarte para publicar proyectos, revisar postulaciones, aprobar entregas o resolver dudas de comisiones."
        : "Hola, soy el asistente de soporte de Tandemy. Escríbeme cualquier duda sobre cómo registrarte, postularte o publicar proyectos, pagos o compras en la tienda.";

  return {
    id: `welcome-${audience}`,
    role: "model",
    text,
    createdAt: Date.now(),
  };
}

function FormattedReply({ text }: { text: string }) {
  const lines = text.split(/\n+/).filter((line) => line.trim().length > 0);
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const isBullet = /^[-*•]\s+/.test(trimmed);
        const content = isBullet ? trimmed.replace(/^[-*•]\s+/, "") : trimmed;
        const formatted = content.replace(/\*\*(.+?)\*\*/g, "$1");
        if (isBullet) {
          return (
            <div key={index} className="flex items-start gap-2">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span>{formatted}</span>
            </div>
          );
        }
        return <p key={index}>{formatted}</p>;
      })}
    </div>
  );
}

export function SupportChatbot() {
  const { profile } = useTandemyAuth();
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<SupportAudience>("general");
  const [audienceManuallyChosen, setAudienceManuallyChosen] = useState(false);
  const [messages, setMessages] = useState<SupportChatMessage[]>(() => [
    createWelcomeMessage("general"),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          audience?: SupportAudience;
          messages?: SupportChatMessage[];
        };
        if (
          parsed.audience === "estudiante" ||
          parsed.audience === "pyme" ||
          parsed.audience === "general"
        ) {
          setAudience(parsed.audience);
          setAudienceManuallyChosen(true);
        }
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
        }
      }
    } catch {
      /* ignore storage access errors */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || audienceManuallyChosen) return;
    if (profile?.role === "student") {
      setAudience("estudiante");
      setMessages((prev) =>
        prev.length === 1 && prev[0]?.id.startsWith("welcome-")
          ? [createWelcomeMessage("estudiante")]
          : prev,
      );
    } else if (profile?.role === "pyme") {
      setAudience("pyme");
      setMessages((prev) =>
        prev.length === 1 && prev[0]?.id.startsWith("welcome-")
          ? [createWelcomeMessage("pyme")]
          : prev,
      );
    }
  }, [profile?.role, hydrated, audienceManuallyChosen]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ audience, messages }));
    } catch {
      /* ignore quota errors */
    }
  }, [audience, messages, hydrated]);

  useEffect(() => {
    if (!open) return;
    threadEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [open, messages, loading]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  function handleSelectAudience(next: SupportAudience) {
    setAudience(next);
    setAudienceManuallyChosen(true);
    setMessages((prev) => {
      const onlyWelcome = prev.length === 1 && Boolean(prev[0]?.id.startsWith("welcome-"));
      return onlyWelcome ? [createWelcomeMessage(next)] : prev;
    });
  }

  function handleResetConversation() {
    setMessages([createWelcomeMessage(audience)]);
    setErrorMsg(null);
    setLastFailedPrompt(null);
    setInput("");
  }

  async function submitPrompt(rawText: string, options?: { skipAppendUser?: boolean }) {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    setErrorMsg(null);
    setLastFailedPrompt(null);

    const historyForRequest = messages
      .filter((msg) => !msg.id.startsWith("welcome-"))
      .slice(-14)
      .map((msg) => ({ role: msg.role, text: msg.text }));

    if (!options?.skipAppendUser) {
      const userMsg: SupportChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "user",
        text: trimmed,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
    }

    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyForRequest,
          audience,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(
          data.error || "No pudimos obtener una respuesta en este momento. Intenta de nuevo.",
        );
      }

      const modelMsg: SupportChatMessage = {
        id: `model-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "model",
        text: data.reply,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      const msg =
        error instanceof Error && error.message
          ? error.message
          : "No fue posible conectar con el asistente.";
      setErrorMsg(msg);
      setLastFailedPrompt(trimmed);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    void submitPrompt(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitPrompt(input);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const hasConversationStarted = messages.some((m) => m.role === "user");
  const quickQuestions = QUICK_QUESTIONS[audience];

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {open && (
        <section
          role="dialog"
          aria-label="Asistente de soporte Tandemy"
          className="flex h-[min(560px,calc(100dvh-6.25rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-lift sm:w-[390px]"
        >
          <header className="flex items-center justify-between gap-3 bg-navy px-4 py-3 text-navy-foreground">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan text-cyan-foreground">
                <Headphones className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold leading-tight">
                  Soporte Tandemy
                </p>
                <p className="truncate text-xs text-navy-foreground/75">
                  Dudas para estudiantes y PyMEs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetConversation}
                aria-label="Nueva conversación"
                title="Nueva conversación"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-navy-foreground/80 transition hover:bg-navy-foreground/10 hover:text-navy-foreground"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar asistente"
                title="Cerrar asistente"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-navy-foreground/80 transition hover:bg-navy-foreground/10 hover:text-navy-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="border-b border-border bg-secondary/60 px-3 py-2">
            <div
              className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
              role="group"
              aria-label="Tipo de consulta"
            >
              {AUDIENCE_LABELS.map((item) => {
                const active = audience === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectAudience(item.id)}
                    aria-pressed={active}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.id === "estudiante" && (
                      <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {item.id === "pyme" && <Building2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
            aria-label="Historial de conversación"
          >
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      isUser
                        ? "rounded-br-sm bg-primary text-primary-foreground shadow-sm"
                        : "rounded-bl-sm border border-border bg-card text-card-foreground shadow-sm"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    ) : (
                      <FormattedReply text={msg.text} />
                    )}
                  </div>
                </div>
              );
            })}

            {!hasConversationStarted && !loading && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Preguntas frecuentes rápidas:
                </p>
                <div className="flex flex-col items-start gap-1.5">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void submitPrompt(question)}
                      className="rounded-xl border border-border bg-card px-3 py-2 text-left text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-accent"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span>Escribiendo respuesta...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="flex items-start justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
                {lastFailedPrompt && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 shrink-0 px-2 text-xs"
                    onClick={() => void submitPrompt(lastFailedPrompt, { skipAppendUser: true })}
                  >
                    Reintentar
                  </Button>
                )}
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          <form onSubmit={handleFormSubmit} className="border-t border-border bg-card p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu duda sobre Tandemy..."
                aria-label="Escribe tu duda sobre Tandemy"
                maxLength={1500}
                disabled={loading}
                className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                aria-label="Enviar mensaje"
                className="h-10 w-10 shrink-0 rounded-xl"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Ayuda rápida sobre registro, proyectos, pagos, constancias y tienda.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={
          open ? "Cerrar asistente de soporte Tandemy" : "Abrir asistente de soporte Tandemy"
        }
        className="inline-flex h-12 items-center gap-2.5 rounded-full bg-navy px-4 text-sm font-semibold text-navy-foreground shadow-lift ring-1 ring-navy-foreground/15 transition hover:-translate-y-0.5 hover:bg-navy/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan text-cyan-foreground">
          {open ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
        <span>{open ? "Cerrar ayuda" : "¿Dudas? Soporte"}</span>
      </button>
    </div>
  );
}
