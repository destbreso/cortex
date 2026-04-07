"use client"

import { useState, useCallback } from "react"
import { useConfig } from "./use-config"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Model {
  name: string
  size?: number
  modified_at?: string
}

interface ConnectionStatus {
  isConnected: boolean
  error?: string
  details?: string
  isDemoMode?: boolean
  instructions?: string[]
  ollamaUrl?: string
}

export function useOllama() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [models, setModels] = useState<Model[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
  })
  const { config } = useConfig()

  const loadModels = useCallback(async () => {
    try {
      console.log("[v0] Cargando modelos con timeout:", config.timeout)
      const response = await fetch("/api/ollama/models", {
        signal: AbortSignal.timeout(config.timeout),
      })
      const data = await response.json()

      if (response.ok && !data.connectionFailed) {
        setModels(data.models || [])
        if (data.isDemoMode) {
          setConnectionStatus({
            isConnected: false,
            isDemoMode: true,
            error: data.error,
            details: data.details,
          })
        } else {
          setConnectionStatus({ isConnected: true })
          console.log("[v0] Conectado exitosamente, modelos cargados:", data.models?.length || 0)
        }
      } else {
        setConnectionStatus({
          isConnected: false,
          error: data.error || "Failed to load models",
          details: data.details,
          isDemoMode: data.isDemoMode,
          instructions: data.instructions,
          ollamaUrl: data.ollamaUrl,
        })
        setModels([])
        console.log("[v0] Error de conexión:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error loading models:", error)
      setConnectionStatus({
        isConnected: false,
        error: "No se pudo conectar con Ollama",
        details: "Error de red o timeout en la conexión",
        instructions: [
          "1. Verifica que Ollama esté ejecutándose: ollama serve",
          "2. Confirma que esté en el puerto correcto: http://localhost:11434",
          "3. Prueba la conexión: curl http://localhost:11434/api/tags",
        ],
      })
      setModels([])
    }
  }, [config.timeout])

  const sendMessage = useCallback(
    async (content: string, model: string) => {
      if (!content.trim() || !model) return

      const finalContent = config.systemPrompt ? `${config.systemPrompt}\n\nUser: ${content}` : content

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const newMessages = [...prev, userMessage]
        return newMessages.slice(-config.maxHistoryLength)
      })
      setIsLoading(true)

      try {
        console.log("[v0] Enviando mensaje con configuración:", {
          model,
          temperature: config.modelConfig.temperature,
          systemPrompt: !!config.systemPrompt,
        })

        const response = await fetch("/api/ollama/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(config.timeout),
          body: JSON.stringify({
            model,
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            options: {
              temperature: config.modelConfig.temperature,
              top_p: config.modelConfig.top_p,
              top_k: config.modelConfig.top_k,
              repeat_penalty: config.modelConfig.repeat_penalty,
              seed: config.modelConfig.seed > 0 ? config.modelConfig.seed : undefined,
              num_predict: config.modelConfig.num_predict > 0 ? config.modelConfig.num_predict : undefined,
              num_ctx: config.modelConfig.num_ctx,
              stop: config.modelConfig.stop.length > 0 ? config.modelConfig.stop : undefined,
            },
            stream: config.streaming,
          }),
        })

        const data = await response.json()

        if (response.ok && !data.connectionFailed) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message?.content || "Error: No response received",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, assistantMessage])

          if (data.isDemoMode) {
            setConnectionStatus((prev) => ({ ...prev, isDemoMode: true }))
          } else {
            setConnectionStatus({ isConnected: true })
            console.log("[v0] Mensaje enviado y respuesta recibida exitosamente")
          }
        } else {
          throw new Error(data.error || "Failed to get response")
        }
      } catch (error) {
        console.error("[v0] Error sending message:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error de conexión: ${error instanceof Error ? error.message : "No se pudo conectar con Ollama"}. Verifica que Ollama esté ejecutándose y el modelo seleccionado esté disponible.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])

        setConnectionStatus({
          isConnected: false,
          error: "Error en la conexión con Ollama",
          details: "No se pudo enviar el mensaje al modelo",
          instructions: [
            "1. Verifica que Ollama esté ejecutándose: ollama serve",
            "2. Confirma que el modelo esté disponible: ollama list",
            "3. Prueba la conexión: curl http://localhost:11434/api/tags",
          ],
        })
      } finally {
        setIsLoading(false)
      }
    },
    [messages, config],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    models,
    connectionStatus,
    sendMessage,
    clearMessages,
    loadModels,
  }
}
