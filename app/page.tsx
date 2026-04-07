"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ThemeSync } from "@/components/theme-sync";
import { AssistantBubble } from "@/components/assistant-bubble";
import { useOllama } from "@/hooks/use-ollama";
import { useConfig } from "@/hooks/use-config";
import { useSessions } from "@/hooks/use-sessions";
import { useSkillsets } from "@/hooks/use-skillsets";
import type { Personality } from "@/types/config";

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
  const { config, updateConfig, isLoading: configLoading } = useConfig();
  const {
    sessions,
    isLoading: isLoadingSessions,
    loadSessions,
    deleteSession,
    renameSession,
  } = useSessions();
  const {
    skillsets,
    activeSkillset,
    activeSkillsetId,
    setActive: setActiveSkillset,
    createSkillset,
    updateSkillset,
    deleteSkillset,
    buildSystemMessage,
  } = useSkillsets();

  // ── Compute the final system message for each interaction ───────────────
  // Priority: skillset (if active) > personality preset > config.systemPrompt
  const getSystemMessage = useCallback((): string | null => {
    // 1. Skillset overrides everything
    const skillsetMsg = buildSystemMessage();
    if (skillsetMsg) return skillsetMsg;

    // 2. Active personality
    const activePersonality = config.personalities?.find(
      (p) => p.id === config.activePersonalityId,
    );
    if (activePersonality?.prompt) return activePersonality.prompt;

    // 3. Legacy systemPrompt fallback
    if (config.systemPrompt) return config.systemPrompt;

    return null;
  }, [
    buildSystemMessage,
    config.personalities,
    config.activePersonalityId,
    config.systemPrompt,
  ]);

  // ── Personality management ──────────────────────────────────────────────
  const setActivePersonality = useCallback(
    (id: string) => {
      updateConfig({ activePersonalityId: id });
    },
    [updateConfig],
  );

  const addPersonality = useCallback(
    (data: Omit<Personality, "id">) => {
      const newP: Personality = { ...data, id: Date.now().toString() };
      updateConfig({
        personalities: [...(config.personalities ?? []), newP],
      });
    },
    [config.personalities, updateConfig],
  );

  const deletePersonality = useCallback(
    (id: string) => {
      updateConfig({
        personalities: (config.personalities ?? []).filter((p) => p.id !== id),
        ...(config.activePersonalityId === id
          ? { activePersonalityId: "neutral" }
          : {}),
      });
    },
    [config.personalities, config.activePersonalityId, updateConfig],
  );

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

  useEffect(() => {
    if (isDbMode && currentSessionId) {
      loadSessions();
    }
  }, [isDbMode, currentSessionId, loadSessions]);

  if (configLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
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

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          models={models}
          isConnected={connectionStatus.isConnected}
          connectionError={connectionStatus.error}
          isDemoMode={connectionStatus.isDemoMode}
        />

        {/* No-persistence banner */}
        {!isDbMode && !connectionStatus.isDemoMode && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 bg-muted/30 rounded-md px-3 py-1.5 mx-4 mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/80 shrink-0" />
            <span>
              Sin persistencia — conversaciones solo en esta sesión.{" "}
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
                Activar DB →
              </button>
            </span>
          </div>
        )}

        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={(message) =>
            sendMessage(message, selectedModel, getSystemMessage())
          }
          onRewindTo={rewindTo}
          onForkFrom={forkFrom}
          skillsets={skillsets}
          activeSkillsetId={activeSkillsetId}
          onSetActiveSkillset={setActiveSkillset}
          isDbMode={isDbMode}
          personalities={config.personalities ?? []}
          activePersonalityId={config.activePersonalityId ?? "neutral"}
          onSelectPersonality={setActivePersonality}
          onAddPersonality={addPersonality}
          onDeletePersonality={deletePersonality}
        />
      </div>

      <AssistantBubble
        isConnected={connectionStatus.isConnected}
        selectedModel={selectedModel}
      />
    </div>
  );
}
