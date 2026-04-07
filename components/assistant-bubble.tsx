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

const SYSTEM_PROMPT = `Eres el asistente integrado de "Ollama Chat", una interfaz web local para interactuar con modelos de IA a través de Ollama. Tu rol es guiar al usuario sobre cómo usar la aplicación. Responde siempre en español, de forma concisa y amigable.

Conocimiento de la aplicación:
- **Modelos**: Se seleccionan desde el header superior. El punto verde indica que Ollama está conectado.
- **Conversaciones**: El sidebar izquierdo muestra el historial de sesiones (requiere MongoDB). Sin DB, las conversaciones son solo de sesión.
- **Fork**: Entre cada turno del chat aparecen botones. "Fork" crea una nueva conversación bifurcada conservando la original intacta — puedes volver a ella desde el sidebar.
- **Rewind**: "Rewind" elimina los mensajes posteriores al punto elegido (muestra confirmación indicando cuántos mensajes se perderán). Es destructivo e irreversible.
- **Skillsets** (requiere MongoDB): Perfiles de IA que combinan un prompt de sistema, una base de conocimientos (archivos .md) y plantillas rápidas con variables. Se crean/editan en Configuración > Skillsets. Se activan desde el selector en la barra de acciones del chat. Cuando un skillset está activo, su prompt de sistema sobreescribe la personalidad base.
- **Plantillas rápidas**: Forman parte de cada skillset. Son prompts reutilizables con variables {así}. Aparecen en la barra de acciones solo cuando hay un skillset activo que tenga plantillas.
- **Personalidad base**: En Configuración > Chat se define el prompt de sistema por defecto. Hay presets rápidos (Neutral, Amigable, Técnico, Creativo, Didáctico, Conciso) o se puede escribir uno personalizado. Los skillsets la sobreescriben cuando están activos.
- **Configuración** (icono de engranaje en header):
  - Conexión: URL de Ollama y timeout.
  - Modelo: Temperatura, top_p, top_k, contexto, tokens máximos, penalización de repetición, semilla.
  - Interfaz: Tema (claro/oscuro), tamaño de fuente, timestamps, sidebar.
  - Base de datos: Estado de conexión a MongoDB. Instrucciones para Docker, externa o Atlas.
  - Chat: Personalidad base (presets + custom), streaming, historial máximo.
  - Skillsets: CRUD completo de perfiles de IA (requiere DB).
  - Exportar: Exportar/importar configuración completa.
- **Temas**: Botón sol/luna en el header para cambiar entre claro y oscuro, con transición visual.
- **Persistencia**: Con MongoDB conectada, las sesiones, skillsets y configuración se guardan. Sin DB, solo memoria del navegador (localStorage para config) y los skillsets se deshabilitan.
- **Requisitos**: Ollama instalado y ejecutándose (ollama serve). Docker opcional para MongoDB.

Si no sabes algo, dilo honestamente. No inventes funcionalidades que no existen.`;

const FORTUNE_TIPS = [
  "💡 Puedes cambiar de modelo desde el selector en el header — el punto verde indica conexión activa.",
  "🔀 Usa Fork entre turnos para bifurcar la conversación — la original se conserva intacta en el sidebar.",
  "⏪ Rewind elimina los mensajes desde el punto elegido. Se pide confirmación mostrando cuántos se perderán.",
  "🌙 Cambia entre modo claro y oscuro con el botón de sol/luna en el header.",
  "⚙️ En Configuración > Modelo puedes ajustar temperatura, top_p y contexto para controlar las respuestas.",
  "💾 Conecta MongoDB para guardar sesiones, skillsets y configuración. Sin DB, se pierden al cerrar.",
  "🧠 Los Skillsets combinan personalidad + conocimiento + plantillas en un solo perfil de IA activable.",
  "🐳 Puedes levantar MongoDB fácilmente con Docker: mira las instrucciones en Configuración > Base de datos.",
  "📤 Exporta tu configuración completa desde Configuración > Exportar para hacer backup o migrar.",
  "🔧 Si Ollama no conecta, verifica que esté corriendo con 'ollama serve' en la terminal.",
  "🎭 Elige un preset de personalidad rápido (Amigable, Técnico, Creativo…) en Configuración > Chat.",
  "🔢 Activa el conteo de tokens en Configuración > Interfaz para monitorear el consumo de contexto.",
  "📎 Sube archivos .md como base de conocimientos en tus Skillsets para dar contexto especializado al modelo.",
  "📝 Las plantillas rápidas con variables {así} se definen dentro de cada Skillset y aparecen en la barra de acciones.",
  "⚡ Los Skillsets requieren MongoDB — sin base de datos, el selector queda desactivado automáticamente.",
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
