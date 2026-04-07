"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { ModelSelector } from "@/components/model-selector";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ConnectionStatus } from "@/components/connection-status";
import { DemoBanner } from "@/components/demo-banner";
import { ThemeSync } from "@/components/theme-sync";
import { useOllama } from "@/hooks/use-ollama";
import { useConfig } from "@/hooks/use-config";
import { useSessions } from "@/hooks/use-sessions";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
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
  } = useOllama();
  const { config, isLoading: configLoading } = useConfig();
  const {
    sessions,
    isLoading: isLoadingSessions,
    loadSessions,
    deleteSession,
    renameSession,
  } = useSessions();

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const defaultModel =
        config.defaultModel &&
        models.find((m) => m.name === config.defaultModel);
      setSelectedModel(defaultModel ? config.defaultModel : models[0].name);
    }
  }, [models, selectedModel, config.defaultModel]);

  useEffect(() => {
    setSidebarOpen(!config.sidebarCollapsed);
  }, [config.sidebarCollapsed]);

  // Reload session list whenever a new session is created
  useEffect(() => {
    if (isDbMode && currentSessionId) {
      loadSessions();
    }
  }, [isDbMode, currentSessionId, loadSessions]);

  if (configLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ThemeSync />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onClearChat={clearMessages}
        messages={messages}
        sessions={sessions}
        isDbMode={isDbMode}
        activeSessionId={currentSessionId}
        isLoadingSessions={isLoadingSessions}
        onLoadSession={(id) => {
          loadSession(id);
          setSidebarOpen(false);
        }}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          selectedModel={selectedModel}
        />

        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 min-h-0">
          {connectionStatus.isDemoMode && <DemoBanner />}

          {/* Subtle no-persistence notice */}
          {!isDbMode && !connectionStatus.isDemoMode && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 bg-muted/30 border border-border/40 rounded-md px-3 py-1.5 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/80 shrink-0" />
              <span>
                Sin persistencia activa — las conversaciones se guardan solo en
                esta sesión del navegador.{" "}
                <button
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                  onClick={() =>
                    document
                      .querySelector<HTMLButtonElement>(
                        "[title='Configuración avanzada']",
                      )
                      ?.click()
                  }
                >
                  Activar conexión a DB →
                </button>
              </span>
            </div>
          )}

          <div className="mb-4">
            <ConnectionStatus
              isConnected={connectionStatus.isConnected}
              error={connectionStatus.error}
              details={connectionStatus.details}
              isDemoMode={connectionStatus.isDemoMode}
            />
          </div>

          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={(message) => sendMessage(message, selectedModel)}
            onRewindTo={rewindTo}
            onForkFrom={forkFrom}
          />
        </div>
      </div>
    </div>
  );
}
