import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupportChatbot } from "@/components/support-chatbot";
import {
  buildSupportSystemInstruction,
  handleSupportChatRequest,
  SUPPORT_CHAT_MODEL,
  sanitizeHistory,
} from "@/server/support-chat";

vi.mock("@/components/student-session", () => ({
  useTandemyAuth: () => ({
    user: null,
    profile: null,
    privateAccount: null,
    loading: false,
    needsOnboarding: false,
    signOut: async () => {},
  }),
}));

describe("Server support chat handler", () => {
  it("builds role-specific system instructions for students and PyMEs", () => {
    const studentInstruction = buildSupportSystemInstruction("estudiante");
    const pymeInstruction = buildSupportSystemInstruction("pyme");

    expect(studentInstruction).toContain("ESTUDIANTE");
    expect(studentInstruction).toContain("FCA");
    expect(pymeInstruction).toContain("PYME");
    expect(pymeInstruction).toContain("10%");
  });

  it("rejects empty messages with HTTP 400", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   ", history: [], audience: "general" }),
    });

    const res = await handleSupportChatRequest(req, { GEMINI_API_KEY: "test-key" });
    expect(res.status).toBe(400);
  });

  it("returns 503 with helpful Spanish error when GEMINI_API_KEY is missing", async () => {
    const prevKey = process.env["GEMINI_API_KEY"];
    delete process.env["GEMINI_API_KEY"];
    try {
      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "¿Cómo me registro?",
          history: [],
          audience: "estudiante",
        }),
      });

      const res = await handleSupportChatRequest(req, {});
      expect(res.status).toBe(503);
      const data = (await res.json()) as { error?: string };
      expect(data.error).toContain("GEMINI_API_KEY");
    } finally {
      if (prevKey !== undefined) process.env["GEMINI_API_KEY"] = prevKey;
    }
  });

  it("forwards multi-turn history and system instruction to gemini-4-hydrogen", async () => {
    const createChatSpy = vi.fn(({ model, history, systemInstruction }) => {
      expect(model).toBe(SUPPORT_CHAT_MODEL);
      expect(model).toBe("gemini-4-hydrogen");
      expect(history).toEqual([
        { role: "user", parts: [{ text: "Hola" }] },
        { role: "model", parts: [{ text: "Hola, ¿en qué te ayudo?" }] },
      ]);
      expect(systemInstruction).toContain("PYME");
      return {
        sendMessage: async ({ message }: { message: string }) => ({
          text: `Respuesta sobre: ${message}`,
        }),
      };
    });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience: "pyme",
        history: [
          { role: "user", text: "Hola" },
          { role: "model", text: "Hola, ¿en qué te ayudo?" },
        ],
        message: "¿Cómo publico un proyecto?",
      }),
    });

    const res = await handleSupportChatRequest(
      req,
      { GEMINI_API_KEY: "test-key" },
      { createChat: createChatSpy },
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as { reply?: string; model?: string };
    expect(data.model).toBe("gemini-4-hydrogen");
    expect(data.reply).toBe("Respuesta sobre: ¿Cómo publico un proyecto?");
    expect(createChatSpy).toHaveBeenCalledTimes(1);
  });

  it("sanitizes invalid history entries and caps length", () => {
    const cleaned = sanitizeHistory([
      { role: "invalid", text: "skip" },
      { role: "user", text: "   " },
      { role: "user", text: "Primera duda" },
      { role: "model", text: "Primera respuesta" },
    ]);
    expect(cleaned).toEqual([
      { role: "user", text: "Primera duda" },
      { role: "model", text: "Primera respuesta" },
    ]);
  });
});

describe("SupportChatbot UI", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("opens, switches between Estudiante and PyME quick prompts, and displays multi-turn messages", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: "Ve a /registro, elige PyME y luego publica desde tu panel.",
        model: "gemini-4-hydrogen",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<SupportChatbot />);

    const launcher = screen.getByRole("button", { name: /Abrir asistente de soporte Tandemy/i });
    fireEvent.click(launcher);

    expect(screen.getByRole("dialog", { name: /Asistente de soporte Tandemy/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "PyME" }));
    const quickQuestion = screen.getByRole("button", { name: "¿Cómo publico un proyecto?" });
    fireEvent.click(quickQuestion);

    await waitFor(() => {
      expect(
        screen.getByText("Ve a /registro, elige PyME y luego publica desde tu panel."),
      ).toBeTruthy();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
