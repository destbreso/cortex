"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Trash2, MessageSquare, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportChat } from "./export-chat"
import { useConfig } from "@/hooks/use-config"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onClearChat: () => void
  messages: Message[]
}

export function Sidebar({ isOpen, onClose, onClearChat, messages }: SidebarProps) {
  const messageCount = messages.length
  const lastMessage = messages[messages.length - 1]
  const { config } = useConfig()

  const userMessages = messages.filter((m) => m.role === "user").length
  const assistantMessages = messages.filter((m) => m.role === "assistant").length
  const totalTokensEstimate = messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 ease-in-out",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Conversaciones</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Current Chat Info */}
            <Card className="p-4 bg-sidebar-accent/10">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-sidebar-primary" />
                <span className="text-sm font-medium text-sidebar-foreground">Chat Actual</span>
              </div>
              <div className="text-xs text-sidebar-foreground/70 space-y-1">
                <div>Mensajes: {messageCount}</div>
                <div>
                  Usuario: {userMessages} | IA: {assistantMessages}
                </div>
                {config.showTokenCount && <div>Tokens estimados: ~{totalTokensEstimate}</div>}
                {lastMessage && <div>Último: {lastMessage.timestamp.toLocaleTimeString()}</div>}
              </div>
            </Card>

            {messages.length > 0 && (
              <Card className="p-4 bg-sidebar-accent/5">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-sidebar-primary" />
                  <span className="text-sm font-medium text-sidebar-foreground">Estadísticas</span>
                </div>
                <div className="text-xs text-sidebar-foreground/70 space-y-1">
                  <div>
                    Promedio por mensaje:{" "}
                    {Math.round(messages.reduce((acc, msg) => acc + msg.content.length, 0) / messages.length)} chars
                  </div>
                  <div>Mensaje más largo: {Math.max(...messages.map((m) => m.content.length))} chars</div>
                  <div>
                    Duración:{" "}
                    {messages.length > 1
                      ? Math.round((lastMessage.timestamp.getTime() - messages[0].timestamp.getTime()) / 60000)
                      : 0}{" "}
                    min
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
                onClick={onClearChat}
                disabled={messageCount === 0}
              >
                <Trash2 className="h-4 w-4" />
                Limpiar Chat
              </Button>

              <ExportChat messages={messages} />
            </div>

            {/* Recent Messages Preview */}
            {messages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-sidebar-foreground">Mensajes Recientes</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {messages
                    .slice(-5)
                    .reverse()
                    .map((message) => (
                      <Card key={message.id} className="p-2 bg-sidebar-accent/5">
                        <div className="text-xs text-sidebar-foreground/70 mb-1">
                          {message.role === "user" ? "Tú" : "IA"} • {message.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-sidebar-foreground line-clamp-2">{message.content}</div>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            <Card className="p-3 bg-sidebar-accent/5">
              <div className="text-xs text-sidebar-foreground/70 space-y-1">
                <div className="font-medium text-sidebar-foreground mb-1">Configuración Activa</div>
                <div>Temperatura: {config.modelConfig.temperature}</div>
                <div>Top P: {config.modelConfig.top_p}</div>
                <div>Contexto: {config.modelConfig.num_ctx} tokens</div>
                <div>Streaming: {config.streaming ? "Activado" : "Desactivado"}</div>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/50 text-center">
              Ollama Web Interface v2.0
              <br />
              <span className="text-sidebar-primary">Configuración Avanzada</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
