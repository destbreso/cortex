"use client";

import type React from "react";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  User,
  Bot,
  Loader2,
  GitFork,
  RotateCcw,
  Paperclip,
  Sparkles,
} from "lucide-react";
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
    <div className="flex items-center justify-center gap-1 my-1 opacity-0 hover:opacity-100 transition-opacity">
      <Button
        size="sm"
        variant="ghost"
        className="h-5 px-1.5 text-[10px] gap-1 text-muted-foreground/50 hover:text-foreground"
        onClick={() => onRewindTo?.(keepCount)}
        title="Rewind"
      >
        <RotateCcw className="h-2.5 w-2.5" />
      </Button>
      <span className="text-muted-foreground/15 text-[10px]">·</span>
      <Button
        size="sm"
        variant="ghost"
        className="h-5 px-1.5 text-[10px] gap-1 text-muted-foreground/50 hover:text-foreground"
        onClick={() => onForkFrom?.(keepCount)}
        title="Fork"
      >
        <GitFork className="h-2.5 w-2.5" />
      </Button>
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

  // Auto-resize textarea: grows upward, collapses when empty
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "0";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
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

  // Group messages into turns
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
      {/* Messages — scrollable */}
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
          <div className="max-w-3xl mx-auto w-full px-4 space-y-0.5">
            {turns.map((turn, turnIndex) => {
              const isLastTurn = turnIndex === turns.length - 1;
              const keepCount = turn.endIndex + 1;

              return (
                <div key={turn.user.id}>
                  {/* User message — right */}
                  <div className="flex justify-end py-1">
                    <div className="flex items-end gap-2 max-w-[75%]">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
                        <p className="whitespace-pre-wrap leading-relaxed break-words">
                          {turn.user.content}
                        </p>
                        {config.showTimestamps && (
                          <p className="text-xs mt-1.5 opacity-60">
                            {turn.user.timestamp.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Assistant message — left */}
                  {turn.assistant && (
                    <div className="flex justify-start py-1">
                      <div className="flex items-end gap-2 max-w-[75%]">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
                          <p className="whitespace-pre-wrap leading-relaxed text-foreground break-words">
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

                  {/* Turn divider — hover to reveal */}
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

            {/* Thinking */}
            {isLoading && (
              <div className="flex justify-start py-1">
                <div className="flex items-end gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
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

      {/* Composer — pinned at bottom */}
      <div className="bg-background/80 backdrop-blur-md shadow-[0_-2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.2)] px-4 pb-4 pt-2">
        <div className="max-w-3xl mx-auto">
          {/* Textarea with integrated send button */}
          <div className="relative bg-card rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje…"
              disabled={isLoading}
              rows={1}
              className="w-full resize-none bg-transparent rounded-2xl px-4 pt-3 pb-2 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 leading-relaxed"
              style={{ minHeight: "44px", maxHeight: "200px" }}
            />
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-2 bottom-2 h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                input.trim() && !isLoading
                  ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                  : "text-muted-foreground/30 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-1 mt-1.5 px-1">
            <PromptTemplatesSelector
              onSelectTemplate={(t) => {
                setInput(t);
                textareaRef.current?.focus();
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground/60 hover:text-foreground gap-1"
              title="Adjuntar archivo (próximamente)"
              disabled
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Adjuntar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground/60 hover:text-foreground gap-1"
              title="Skills (próximamente)"
              disabled
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Skills</span>
            </Button>

            <div className="flex-1" />

            <span className="text-[10px] text-muted-foreground/30">
              Enter enviar · Shift+Enter salto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
