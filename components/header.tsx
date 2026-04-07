"use client"

import { Button } from "@/components/ui/button"
import { Menu, Bot } from "lucide-react"
import { SettingsSheet } from "./settings-sheet"

interface HeaderProps {
  onMenuClick: () => void
  selectedModel: string
}

export function Header({ onMenuClick, selectedModel }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Ollama Chat</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedModel && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Modelo activo:</span>
              <span className="font-medium text-primary">{selectedModel}</span>
            </div>
          )}

          <SettingsSheet />
        </div>
      </div>
    </header>
  )
}
