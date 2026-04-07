"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, User, Bot, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PromptTemplatesSelector } from "./prompt-templates-selector"
import { useConfig } from "@/hooks/use-config"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
}

export function ChatInterface({ messages, isLoading, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { config } = useConfig()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTemplateSelect = (template: string) => {
    setInput(template)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages Area */}
      <div
        className={cn("flex-1 overflow-y-auto py-4 space-y-4", {
          "text-sm": config.fontSize === "small",
          "text-base": config.fontSize === "medium",
          "text-lg": config.fontSize === "large",
        })}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">¡Bienvenido a Ollama Chat!</h3>
              <p className="text-muted-foreground">Selecciona un modelo y comienza a chatear con tu IA local.</p>
            </Card>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3 max-w-3xl", message.role === "user" ? "ml-auto" : "mr-auto")}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground order-2"
                    : "bg-card text-card-foreground",
                )}
              >
                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <Card
                className={cn(
                  "p-4 max-w-[80%]",
                  message.role === "user" ? "bg-primary text-primary-foreground order-1" : "bg-card",
                )}
              >
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
                {config.showTimestamps && (
                  <div
                    className={cn(
                      "text-xs mt-2 opacity-70",
                      message.role === "user" ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </Card>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card text-card-foreground flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <Card className="p-4 bg-card">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Pensando...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para nueva línea)"
              className="min-h-[60px] max-h-[200px] resize-none pr-12"
              disabled={isLoading}
            />
          </div>
          <PromptTemplatesSelector onSelectTemplate={handleTemplateSelect} />
          <Button type="submit" disabled={!input.trim() || isLoading} className="self-end">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
