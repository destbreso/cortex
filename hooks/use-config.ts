"use client";

import { useState, useEffect } from "react";
import { type AppConfig, defaultConfig } from "@/types/config";

const CONFIG_KEY = "ollama-interface-config";

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
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbMode, setIsDbMode] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      // 1. Always hydrate from localStorage first (instant)
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) {
        try {
          setConfig({ ...defaultConfig, ...JSON.parse(saved) });
        } catch {
          // ignore parse error
        }
      }

      // 2. Check if DB is available and prefer it
      try {
        const res = await fetch("/api/db-status");
        const { enabled } = await res.json();
        if (enabled) {
          setIsDbMode(true);
          const configRes = await fetch("/api/config");
          if (configRes.ok) {
            const dbConfig = await configRes.json();
            const merged = { ...defaultConfig, ...dbConfig };
            setConfig(merged);
            localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
          }
        }
      } catch {
        // DB not reachable — stay with localStorage
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const updateConfig = (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    if (isDbMode) syncToDb(newConfig);
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
    if (isDbMode) syncToDb(defaultConfig);
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "ollama-interface-config.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importConfig = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          const newConfig = { ...defaultConfig, ...imported };
          setConfig(newConfig);
          localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  return {
    config,
    updateConfig,
    resetConfig,
    exportConfig,
    importConfig,
    isLoading,
    isDbMode,
  };
}
