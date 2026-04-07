"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type AppConfig, defaultConfig } from "@/types/config";

const CONFIG_KEY = "ollama-interface-config";
const CONFIG_CHANGE_EVENT = "ollama-config-change";
const CONFIG_SAVED_EVENT = "ollama-config-saved";

// ── Shared in-memory store so every useConfig() instance sees the same data ──
let sharedConfig: AppConfig = defaultConfig;
let sharedDbMode = false;

function readLocalStorage(): AppConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return defaultConfig;
}

function broadcastChange(config: AppConfig) {
  sharedConfig = config;
  // Dispatch a custom event so all hook instances in this tab re-render
  window.dispatchEvent(
    new CustomEvent(CONFIG_CHANGE_EVENT, { detail: config }),
  );
}

async function syncToDb(config: AppConfig) {
  try {
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  } catch {
    // silently ignore — localStorage is the fallback
  }
}

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(() => {
    // On first mount of this instance, use the shared in-memory config
    // which may already be populated by another instance
    return sharedConfig;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDbMode, setIsDbMode] = useState(sharedDbMode);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const initRef = useRef(false);

  // ── Initial load (only first instance does the async work) ──────────
  useEffect(() => {
    // Always hydrate from localStorage synchronously
    const saved = readLocalStorage();
    sharedConfig = saved;
    setConfig(saved);

    async function loadFromDb() {
      try {
        const res = await fetch("/api/db-status");
        const { enabled } = await res.json();
        if (enabled) {
          sharedDbMode = true;
          setIsDbMode(true);
          const configRes = await fetch("/api/config");
          if (configRes.ok) {
            const dbConfig = await configRes.json();
            const merged = { ...defaultConfig, ...dbConfig };
            sharedConfig = merged;
            setConfig(merged);
            localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
            broadcastChange(merged);
          }
        }
      } catch {
        // DB not reachable — stay with localStorage
      } finally {
        setIsLoading(false);
      }
    }
    loadFromDb();
  }, []);

  // ── Listen for changes from OTHER useConfig() instances in this tab ──
  useEffect(() => {
    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent<AppConfig>).detail;
      setConfig(detail);
      setIsDbMode(sharedDbMode);
    };
    const handleSaved = () => {
      setLastSavedAt(Date.now());
    };
    window.addEventListener(CONFIG_CHANGE_EVENT, handleChange);
    window.addEventListener(CONFIG_SAVED_EVENT, handleSaved);
    return () => {
      window.removeEventListener(CONFIG_CHANGE_EVENT, handleChange);
      window.removeEventListener(CONFIG_SAVED_EVENT, handleSaved);
    };
  }, []);

  const updateConfig = useCallback(
    (updates: Partial<AppConfig>) => {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
      broadcastChange(newConfig);
      setLastSavedAt(Date.now());
      window.dispatchEvent(new Event(CONFIG_SAVED_EVENT));
      if (sharedDbMode) syncToDb(newConfig);
    },
    [config],
  );

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
    broadcastChange(defaultConfig);
    if (sharedDbMode) syncToDb(defaultConfig);
  }, []);

  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "ollama-interface-config.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [config]);

  const importConfig = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          const newConfig = { ...defaultConfig, ...imported };
          setConfig(newConfig);
          localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
          broadcastChange(newConfig);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
    exportConfig,
    importConfig,
    isLoading,
    isDbMode,
    lastSavedAt,
  };
}
