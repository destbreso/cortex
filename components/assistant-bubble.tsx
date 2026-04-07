"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfig } from "@/hooks/use-config";

const SYSTEM_PROMPT = `Eres el asistente integrado de Cortex, un hub local de comando para modelos de lenguaje. Tu rol es guiar al usuario sobre cómo usar la aplicación. Responde siempre en español, de forma concisa y con el tono propio de Cortex: directo, técnico sin ser denso, con humor seco ocasional.

Qué es Cortex:
Cortex es una capa de control entre el usuario y los modelos de lenguaje. No es un chatbot — es el plano de mando desde donde se configuran, dirigen y amplifican. Actualmente habla nativamente con Ollama, diseñado para extenderse a cualquier API compatible.

Vocabulario de Cortex (úsalo en tus respuestas):
- "Memoria" = base de datos MongoDB. Sin memoria, Cortex opera en modo volátil.
- "Olvidar" = la acción Rewind. Borra el hilo desde ese punto hacia adelante.
- "Bifurcar" = la acción Fork. Abre una nueva línea de pensamiento sin destruir la original.
- "Hilos" = conversaciones/sesiones guardadas en memoria.
- "Módulos" o "perfiles" = Skillsets.
- "En línea" / "fuera de línea" = estado de conexión con Ollama.

Conocimiento de la aplicación:
- **Modelos**: Se seleccionan desde el header. El punto verde indica que Cortex está en línea con Ollama.
- **Hilos**: El sidebar muestra el historial de conversaciones — requiere memoria persistente. Sin ella, los hilos son volátiles y desaparecen al cerrar.
- **Fork (Bifurcar)**: Entre turnos aparecen controles. Fork abre una nueva línea de pensamiento desde ese punto, dejando el hilo original intacto y accesible desde el sidebar.
- **Rewind (Olvidar)**: Borra el hilo desde el punto elegido hacia adelante. Muestra confirmación con el número de mensajes que se perderán. Irreversible.
- **Skillsets** (requieren memoria): Perfiles de capacidad que combinan prompt de sistema, base de conocimientos (.md) y plantillas rápidas. Se activan desde la barra de acciones. Cuando uno está activo, su prompt sobreescribe la personalidad base.
- **Plantillas rápidas**: Viven dentro de cada Skillset. Prompts con variables {así} que se sustituyen antes de enviar. Aparecen en la barra de acciones solo si el Skillset activo tiene alguna definida.
- **Personalidades**: Cortex soporta distintos modos de respuesta. Presets: Neutral, Amigable, Técnico, Creativo, Didáctico, Conciso, Sarcástico, Caótico, Pirata — o custom. Los Skillsets los sobreescriben. El selector rápido está en la barra de acciones del chat.
- **Configuración** (engranaje en header):
  - Conexión: URL de Ollama y timeout.
  - Modelo: Temperatura, top_p, top_k, contexto, tokens máximos, penalización de repetición, semilla.
  - Interfaz: Tema, tamaño de fuente, timestamps.
  - Memoria: Estado de conexión y configuración de MongoDB.
  - Chat: Personalidad activa, streaming, historial máximo.
  - Skillsets: Gestión completa de perfiles (requiere memoria).
  - Exportar: Backup/restauración de configuración.
- **Temas**: Sol/luna en el header — con transición visual al cambiar.
- **Sin memoria**: Cortex funciona pero en modo efímero. Config en localStorage, sin Skillsets.
- **Requisitos técnicos**: Ollama corriendo (ollama serve). Docker opcional para la memoria.

Si no sabes algo, dilo. No inventes capacidades que no existen.`;

const FORTUNE_TIPS = [
  "💡 Cambia de modelo desde el selector en el header — el punto verde confirma que Cortex está en línea.",
  "🔀 Fork bifurca el hilo sin destruir el original. Dos líneas de pensamiento, cero pérdida.",
  "⏪ Rewind hace que Cortex olvide desde ese punto. Útil cuando el hilo tomó un rumbo equivocado.",
  "🌙 Cortex opera igual de noche que de día — el botón sol/luna en el header es solo preferencia.",
  "⚙️ Temperatura baja = respuestas predecibles. Alta = más creatividad, más variabilidad. Calibra según la misión.",
  "💾 Sin memoria persistente, Cortex opera en modo volátil — los hilos desaparecen al cerrar la pestaña.",
  "🧠 Los Skillsets son perfiles de capacidad: personalidad + conocimiento + plantillas en un solo módulo activable.",
  "🐳 Memoria en segundos: Docker + las instrucciones en Configuración > Memoria. Un comando y listo.",
  "📤 Exporta todo desde Configuración > Exportar. Config, preferencias y perfiles en un JSON portable.",
  "🔧 Si el punto verde no aparece, Ollama no está corriendo. Ejecuta 'ollama serve' y Cortex lo detecta solo.",
  "🎭 Cortex puede ser Técnico, Sarcástico, Creativo o Pirata — el selector de personalidad está en la barra de acciones.",
  "📡 Cortex habla con cualquier modelo que Ollama tenga descargado. Cambia en el header sin recargar.",
  "📎 Los Skillsets aceptan archivos .md como base de conocimiento — el modelo opera con ese contexto cargado.",
  "📝 Variables en plantillas: escribe {lo_que_sea} en una plantilla y Cortex te pedirá el valor antes de enviar.",
  "⚡ Sin memoria, los Skillsets se deshabilitan. Cortex puede pensar, pero no puede recordar.",
];

interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AssistantBubbleProps {
  isConnected: boolean;
  selectedModel: string;
}

export function AssistantBubble({
  isConnected,
  selectedModel,
}: AssistantBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { config } = useConfig();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "0";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // Pick a random fortune tip, stable until panel reopens
  const fortuneTip = useMemo(
    () => FORTUNE_TIPS[Math.floor(Math.random() * FORTUNE_TIPS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen],
  );

  if (!isConnected || !selectedModel) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const allMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...[...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await fetch("/api/ollama/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(config.timeout),
        body: JSON.stringify({
          ollamaUrl: config.ollamaUrl || undefined,
          model: selectedModel,
          messages: allMessages,
          options: { temperature: 0.7, num_ctx: 2048 },
          stream: false,
        }),
      });

      const data = await response.json();
      const content =
        data.message?.content || "Lo siento, no pude generar una respuesta.";

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Error de conexión. Verifica que Ollama esté activo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[360px] max-h-[500px] bg-card rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Asistente</p>
                <p className="text-[10px] text-muted-foreground">
                  Guía de la aplicación
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMessages([])}
                title="Limpiar chat"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-[200px] max-h-[340px]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-6">
                <Bot className="h-8 w-8 text-primary/30" />
                <p className="text-xs text-muted-foreground/60 max-w-[240px]">
                  ¿Necesitas ayuda? Pregúntame sobre cualquier función.
                </p>

                {/* Fortune tip */}
                <div className="bg-primary/5 rounded-xl px-3 py-2.5 max-w-[280px]">
                  <p className="text-[11px] text-foreground/70 leading-relaxed">
                    {fortuneTip}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                  {[
                    "¿Qué son los Skillsets?",
                    "¿Cómo funciona Fork vs Rewind?",
                    "¿Cómo conecto MongoDB?",
                  ].map((q) => (
                    <button
                      key={q}
                      className="text-[10px] text-primary bg-primary/5 hover:bg-primary/10 rounded-full px-2.5 py-1 transition-colors"
                      onClick={() => {
                        setInput(q);
                        textareaRef.current?.focus();
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/60 text-foreground rounded-bl-sm",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted/60 rounded-xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1">
            <div className="relative bg-muted/30 rounded-xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre la app…"
                rows={1}
                className="w-full resize-none bg-transparent rounded-xl pl-3 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none leading-relaxed"
                style={{ minHeight: "36px", maxHeight: "120px" }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-1.5 bottom-1.5 h-6 w-6 rounded-lg flex items-center justify-center transition-all",
                  input.trim() && !isLoading
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "text-muted-foreground/20 cursor-not-allowed",
                )}
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl",
          isOpen
            ? "bg-muted text-muted-foreground hover:bg-muted/80 scale-90"
            : "bg-primary text-primary-foreground hover:scale-105",
        )}
        title="Asistente de ayuda"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <HelpCircle className="h-5 w-5" />
        )}
      </button>
    </>
  );
}
