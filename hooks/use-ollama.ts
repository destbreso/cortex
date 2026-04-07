"use client";

import { useState, useCallback, useRef } from "react";
import { useConfig } from "./use-config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Model {
  name: string;
  size?: number;
  modified_at?: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  error?: string;
  details?: string;
  isDemoMode?: boolean;
  instructions?: string[];
  ollamaUrl?: string;
}

async function persistMessage(
  sessionId: string,
  role: string,
  content: string,
) {
  try {
    await fetch(`/api/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content }),
    });
  } catch {
    // DB unavailable — silently continue
  }
}

export function useOllama() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { config, isDbMode } = useConfig();
  // keep a stable ref so sendMessage can read the latest sessionId without stale closure
  const sessionIdRef = useRef<string | null>(null);
  sessionIdRef.current = currentSessionId;
  // track last used model so forkFrom can create sessions with the correct model
  const lastModelRef = useRef<string>("");

  const loadModels = useCallback(async () => {
    try {
      console.log("[v0] Cargando modelos con timeout:", config.timeout);
      const url = new URL("/api/ollama/models", window.location.origin);
      if (config.ollamaUrl) url.searchParams.set("ollamaUrl", config.ollamaUrl);
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(config.timeout),
      });
      const data = await response.json();

      if (response.ok && !data.connectionFailed) {
        setModels(data.models || []);
        if (data.isDemoMode) {
          setConnectionStatus({
            isConnected: false,
            isDemoMode: true,
            error: data.error,
            details: data.details,
          });
        } else {
          setConnectionStatus({ isConnected: true });
          console.log(
            "[v0] Conectado exitosamente, modelos cargados:",
            data.models?.length || 0,
          );
        }
      } else {
        setConnectionStatus({
          isConnected: false,
          error: data.error || "Failed to load models",
          details: data.details,
          isDemoMode: data.isDemoMode,
          instructions: data.instructions,
          ollamaUrl: data.ollamaUrl,
        });
        setModels([]);
        console.log("[v0] Error de conexión:", data.error);
      }
    } catch (error) {
      console.error("[v0] Error loading models:", error);
      setConnectionStatus({
        isConnected: false,
        error: "No se pudo conectar con Ollama",
        details: "Error de red o timeout en la conexión",
        instructions: [
          "1. Verifica que Ollama esté ejecutándose: ollama serve",
          "2. Confirma que esté en el puerto correcto: http://localhost:11434",
          "3. Prueba la conexión: curl http://localhost:11434/api/tags",
        ],
      });
      setModels([]);
    }
  }, [config.timeout]);

  const sendMessage = useCallback(
    async (content: string, model: string, systemMessage?: string | null) => {
      if (!content.trim() || !model) return;
      lastModelRef.current = model;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        return newMessages.slice(-config.maxHistoryLength);
      });
      setIsLoading(true);

      // ── DB mode: ensure a session exists ────────────────────────────────────
      let activeSessionId = sessionIdRef.current;
      if (isDbMode && !activeSessionId) {
        try {
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelName: model,
              systemPrompt: config.systemPrompt,
            }),
          });
          if (res.ok) {
            const session = await res.json();
            activeSessionId = session.id;
            setCurrentSessionId(session.id);
            sessionIdRef.current = session.id;
          }
        } catch {
          // continue without session
        }
      }

      // Persist user message to DB
      if (isDbMode && activeSessionId) {
        await persistMessage(activeSessionId, "user", content);
      }

      try {
        console.log("[v0] Enviando mensaje con configuración:", {
          model,
          temperature: config.modelConfig.temperature,
          systemPrompt: !!config.systemPrompt,
        });

        const response = await fetch("/api/ollama/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(config.timeout),
          body: JSON.stringify({
            ollamaUrl: config.ollamaUrl || undefined,
            model,
            messages: [
              // Inject system prompt (from skillset or config)
              ...(systemMessage || config.systemPrompt
                ? [{ role: "system" as const, content: systemMessage || config.systemPrompt }]
                : []),
              ...[...messages, userMessage].map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            ],
            options: {
              temperature: config.modelConfig.temperature,
              top_p: config.modelConfig.top_p,
              top_k: config.modelConfig.top_k,
              repeat_penalty: config.modelConfig.repeat_penalty,
              seed:
                config.modelConfig.seed > 0
                  ? config.modelConfig.seed
                  : undefined,
              num_predict:
                config.modelConfig.num_predict > 0
                  ? config.modelConfig.num_predict
                  : undefined,
              num_ctx: config.modelConfig.num_ctx,
              stop:
                config.modelConfig.stop.length > 0
                  ? config.modelConfig.stop
                  : undefined,
            },
            stream: config.streaming,
          }),
        });

        const data = await response.json();

        if (response.ok && !data.connectionFailed) {
          const assistantContent =
            data.message?.content || "Error: No response received";
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Persist assistant reply to DB
          if (isDbMode && activeSessionId) {
            await persistMessage(
              activeSessionId,
              "assistant",
              assistantContent,
            );
          }

          if (data.isDemoMode) {
            setConnectionStatus((prev) => ({ ...prev, isDemoMode: true }));
          } else {
            setConnectionStatus({ isConnected: true });
            console.log(
              "[v0] Mensaje enviado y respuesta recibida exitosamente",
            );
          }
        } else {
          throw new Error(data.error || "Failed to get response");
        }
      } catch (error) {
        console.error("[v0] Error sending message:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error de conexión: ${error instanceof Error ? error.message : "No se pudo conectar con Ollama"}. Verifica que Ollama esté ejecutándose y el modelo seleccionado esté disponible.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);

        setConnectionStatus({
          isConnected: false,
          error: "Error en la conexión con Ollama",
          details: "No se pudo enviar el mensaje al modelo",
          instructions: [
            "1. Verifica que Ollama esté ejecutándose: ollama serve",
            "2. Confirma que el modelo esté disponible: ollama list",
            "3. Prueba la conexión: curl http://localhost:11434/api/tags",
          ],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, config, isDbMode],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    sessionIdRef.current = null;
  }, []);

  const rewindTo = useCallback((keepCount: number) => {
    // Keeps the same session — continues from this point in the same conversation
    setMessages((prev) => prev.slice(0, keepCount));
  }, []);

  const forkFrom = useCallback(
    async (keepCount: number) => {
      const sliced = messages.slice(0, keepCount);
      setMessages(sliced);

      if (isDbMode) {
        // Create a new session immediately so it shows up in the sidebar
        try {
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelName: lastModelRef.current,
              systemPrompt: config.systemPrompt,
              title: `Fork — ${new Date().toLocaleTimeString()}`,
            }),
          });
          if (res.ok) {
            const session = await res.json();
            // Copy sliced messages into the new session
            for (const msg of sliced) {
              await persistMessage(session.id, msg.role, msg.content);
            }
            setCurrentSessionId(session.id);
            sessionIdRef.current = session.id;
          } else {
            setCurrentSessionId(null);
            sessionIdRef.current = null;
          }
        } catch {
          setCurrentSessionId(null);
          sessionIdRef.current = null;
        }
      } else {
        setCurrentSessionId(null);
        sessionIdRef.current = null;
      }
    },
    [messages, isDbMode, config.systemPrompt],
  );

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) return;
      const session = await res.json();
      const loaded: Message[] = (session.messages ?? []).map(
        (m: {
          id: string;
          role: string;
          content: string;
          createdAt: string;
        }) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        }),
      );
      setMessages(loaded);
      setCurrentSessionId(sessionId);
      sessionIdRef.current = sessionId;
    } catch {
      // silently ignore
    }
  }, []);

  return {
    messages,
    isLoading,
    models,
    connectionStatus,
    sendMessage,
    clearMessages,
    rewindTo,
    forkFrom,
    loadSession,
    loadModels,
    currentSessionId,
    isDbMode,
  };
}
