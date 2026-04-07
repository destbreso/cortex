"use client"

import { useState, useEffect } from "react"
import { type AppConfig, defaultConfig } from "@/types/config"

const CONFIG_KEY = "ollama-interface-config"

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar configuración desde localStorage
    const savedConfig = localStorage.getItem(CONFIG_KEY)
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig({ ...defaultConfig, ...parsed })
      } catch (error) {
        console.error("Error loading config:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const updateConfig = (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig))
  }

  const resetConfig = () => {
    setConfig(defaultConfig)
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig))
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "ollama-interface-config.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const importConfig = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          const newConfig = { ...defaultConfig, ...imported }
          setConfig(newConfig)
          localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig))
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.readAsText(file)
    })
  }

  return {
    config,
    updateConfig,
    resetConfig,
    exportConfig,
    importConfig,
    isLoading,
  }
}
