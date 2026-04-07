"use client";

import type React from "react";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, User, Bot, Loader2, GitFork, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PromptTemplatesSelector } from "./prompt-templates-selector";
import { useConfig } from "@/hooks/use-config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onRewindTo?: (keepCount: number) => void;
  onForkFrom?: (keepCount: number) => void;
}

function TurnDivider({
  keepCount,
  onRewindTo,
  onForkFrom,
}: {
  keepCount: number;
  onRewindTo?: (n: number) => void;
  onForkFrom?: (n: number) => void;
}) {
  return (
    <div className="group relative flex items-center gap-2 my-2 px-4">
      {/* Line always visible, brightens on hover */}
      <div
        className="flex-1 h-px bg-border/50 group-hover:bg-border transition-colors"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,currentColor 0,currentColor 4px,transparent 4px,transparent 8px)",
        }}
      />
      {/* Buttons always visible, subtle by default */}
      <div className="flex items-center gap-0.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[11px] gap-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
          onClick={() => onRewindTo?.(keepCount)}
          title="Rewind: volver a este punto en la misma conversación"
        >
          <RotateCcw className="h-3 w-3" />
          Rewind
        </Button>
        <span className="text-muted-foreground/20 text-xs select-none">·</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[11px] gap-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
          onClick={() => onForkFrom?.(keepCount)}
          title="Fork: bifurcar en una nueva conversación desde este punto"
        >
          <GitFork className="h-3 w-3" />
          Fork
        </Button>
      </div>
      <div
        className="flex-1 h-px bg-border/50 group-hover:bg-border transition-colors"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,currentColor 0,currentColor 4px,transparent 4px,transparent 8px)",
        }}
      />
    </div>
  );
}

export function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onRewindTo,
  onForkFrom,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { config } = useConfig();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Group messages into turns: [{user, assistant|null, endIndex}]
  const turns: {
    user: Message;
    assistant: Message | null;
    endIndex: number;
  }[] = [];
  let i = 0;
  while (i < messages.length) {
    if (messages[i].role === "user") {
      const user = messages[i];
      const assistant =
        messages[i + 1]?.role === "assistant" ? messages[i + 1] : null;
      turns.push({ user, assistant, endIndex: assistant ? i + 1 : i });
      i += assistant ? 2 : 1;
    } else {
      i++;
    }
  }

  return (
    <div
      className={cn("flex-1 flex flex-col min-h-0", {
        "text-sm": config.fontSize === "small",
        "text-base": config.fontSize === "medium",
        "text-lg": config.fontSize === "large",
      })}
    >
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¡Bienvenido a Ollama Chat!
              </h3>
              <p className="text-muted-foreground text-sm">
                Selecciona un modelo y comienza a chatear con tu IA local.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {turns.map((turn, turnIndex) => {
              const isLastTurn = turnIndex === turns.length - 1;
              const keepCount = turn.endIndex + 1;

              return (
                <div key={turn.user.id}>
                  {/* User message — right aligned */}
                  <div className="flex justify-end px-4 py-1">
                    <div className="flex items-end gap-2 max-w-[75%]">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {turn.user.content}
                        </p>
                        {config.showTimestamps && (
                          <p className="text-xs mt-1.5 opacity-60">
                            {turn.user.timestamp.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Assistant message — left aligned */}
                  {turn.assistant && (
                    <div className="flex justify-start px-4 py-1">
                      <div className="flex items-end gap-2 max-w-[75%]">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted border border-border/40 flex items-center justify-center text-muted-foreground">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                          <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                            {turn.assistant.content}
                          </p>
                          {config.showTimestamps && (
                            <p className="text-xs mt-1.5 text-muted-foreground/60">
                              {turn.assistant.timestamp.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Turn divider — hidden for last turn while loading */}
                  {turn.assistant && !(isLastTurn && isLoading) && (
                    <TurnDivider
                      keepCount={keepCount}
                      onRewindTo={onRewindTo}
                      onForkFrom={onForkFrom}
                    />
                  )}
                </div>
              );
            })}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="flex justify-start px-4 py-1">
                <div className="flex items-end gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted border border-border/40 flex items-center justify-center text-muted-foreground">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para nueva línea)"
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
          </div>
          <PromptTemplatesSelector
            onSelectTemplate={(t) => {
              setInput(t);
              textareaRef.current?.focus();
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
