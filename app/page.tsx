"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ModelSelector } from "@/components/model-selector"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ConnectionStatus } from "@/components/connection-status"
import { DemoBanner } from "@/components/demo-banner"
import { useOllama } from "@/hooks/use-ollama"
import { useConfig } from "@/hooks/use-config"

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { messages, isLoading, models, connectionStatus, sendMessage, clearMessages, loadModels } = useOllama()
  const { config, isLoading: configLoading } = useConfig()

  useEffect(() => {
    loadModels()
  }, [loadModels])

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const defaultModel = config.defaultModel && models.find((m) => m.name === config.defaultModel)
      setSelectedModel(defaultModel ? config.defaultModel : models[0].name)
    }
  }, [models, selectedModel, config.defaultModel])

  useEffect(() => {
    setSidebarOpen(!config.sidebarCollapsed)
  }, [config.sidebarCollapsed])

  if (configLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onClearChat={clearMessages}
        messages={messages}
      />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} selectedModel={selectedModel} />

        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
          {connectionStatus.isDemoMode && <DemoBanner />}

          <div className="mb-4">
            <ConnectionStatus
              isConnected={connectionStatus.isConnected}
              error={connectionStatus.error}
              details={connectionStatus.details}
              isDemoMode={connectionStatus.isDemoMode}
            />
          </div>

          <ModelSelector models={models} selectedModel={selectedModel} onModelChange={setSelectedModel} />

          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={(message) => sendMessage(message, selectedModel)}
          />
        </div>
      </div>
    </div>
  )
}
