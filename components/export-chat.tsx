"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { useConfig } from "@/hooks/use-config"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ExportChatProps {
  messages: Message[]
}

export function ExportChat({ messages }: ExportChatProps) {
  const { config } = useConfig()
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState(config.exportFormat)
  const [includeMetadata, setIncludeMetadata] = useState(config.includeMetadata)

  const exportChat = () => {
    if (messages.length === 0) return

    let content = ""
    const timestamp = new Date().toISOString().split("T")[0]

    switch (format) {
      case "json":
        const jsonData = {
          exportDate: new Date().toISOString(),
          messageCount: messages.length,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: includeMetadata ? msg.timestamp.toISOString() : undefined,
          })),
        }
        content = JSON.stringify(jsonData, null, 2)
        break

      case "markdown":
        content = `# Chat Export - ${timestamp}\n\n`
        if (includeMetadata) {
          content += `**Exported:** ${new Date().toLocaleString()}\n`
          content += `**Messages:** ${messages.length}\n\n---\n\n`
        }

        messages.forEach((msg) => {
          const role = msg.role === "user" ? "👤 **Usuario**" : "🤖 **Asistente**"
          content += `## ${role}\n\n`
          if (includeMetadata) {
            content += `*${msg.timestamp.toLocaleString()}*\n\n`
          }
          content += `${msg.content}\n\n---\n\n`
        })
        break

      case "txt":
        if (includeMetadata) {
          content = `Chat Export - ${timestamp}\n`
          content += `Exported: ${new Date().toLocaleString()}\n`
          content += `Messages: ${messages.length}\n\n`
          content += "=".repeat(50) + "\n\n"
        }

        messages.forEach((msg) => {
          const role = msg.role === "user" ? "USUARIO" : "ASISTENTE"
          content += `[${role}]`
          if (includeMetadata) {
            content += ` - ${msg.timestamp.toLocaleString()}`
          }
          content += `\n${msg.content}\n\n${"-".repeat(30)}\n\n`
        })
        break
    }

    const blob = new Blob([content], { type: getContentType(format) })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ollama-chat-${timestamp}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setOpen(false)
  }

  const getContentType = (format: string) => {
    switch (format) {
      case "json":
        return "application/json"
      case "markdown":
        return "text/markdown"
      case "txt":
        return "text/plain"
      default:
        return "text/plain"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={messages.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Conversación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Formato de exportación</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="txt">Texto plano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-metadata">Incluir metadatos (timestamps)</Label>
            <Switch id="include-metadata" checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
          </div>

          <div className="text-sm text-muted-foreground">Se exportarán {messages.length} mensajes</div>

          <Button onClick={exportChat} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exportar ({format.toUpperCase()})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
