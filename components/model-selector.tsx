"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Cpu } from "lucide-react"

interface Model {
  name: string
  size?: number
  modified_at?: string
}

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ models, selectedModel, onModelChange }: ModelSelectorProps) {
  if (models.length === 0) {
    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cpu className="h-4 w-4" />
          <span>Cargando modelos...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-3">
        <Cpu className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">Seleccionar Modelo</label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un modelo" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    {model.size && (
                      <span className="text-xs text-muted-foreground">
                        {(model.size / 1024 / 1024 / 1024).toFixed(1)} GB
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
