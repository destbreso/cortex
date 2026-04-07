"use client";

import { Button } from "@/components/ui/button";
import { Menu, Bot, CircleAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSheet } from "./settings-sheet";
import { ThemeToggle } from "./theme-toggle";

interface Model {
  name: string;
  size?: number;
}

interface HeaderProps {
  onMenuClick: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: Model[];
  isConnected: boolean;
  connectionError?: string;
  isDemoMode?: boolean;
}

export function Header({
  onMenuClick,
  selectedModel,
  onModelChange,
  models,
  isConnected,
  connectionError,
  isDemoMode,
}: HeaderProps) {
  return (
    <header className="bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left — menu + branding */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden h-8 w-8"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold text-foreground hidden sm:inline">
              Cortex
            </span>
          </div>
        </div>

        {/* Center — connection + model */}
        <div className="flex items-center">
          {isDemoMode ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium">Demo</span>
            </div>
          ) : isConnected && models.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className="h-8 w-auto min-w-[140px] max-w-[260px] border-0 shadow-none bg-muted/50 hover:bg-muted/80 transition-colors rounded-lg gap-1 text-sm font-medium px-3 focus:ring-0">
                  <SelectValue placeholder="Modelo…" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      <span className="font-medium">{model.name}</span>
                      {model.size && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {(model.size / 1024 / 1024 / 1024).toFixed(1)} GB
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <CircleAlert className="h-3.5 w-3.5 text-destructive/70" />
              <span className="text-muted-foreground text-xs">
                Sin conexión a Ollama
              </span>
              <button
                className="text-xs text-primary hover:underline underline-offset-2"
                onClick={() =>
                  document
                    .querySelector<HTMLButtonElement>(
                      "[title='Configuración avanzada']",
                    )
                    ?.click()
                }
              >
                Configurar
              </button>
            </div>
          )}
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SettingsSheet />
        </div>
      </div>
    </header>
  );
}
