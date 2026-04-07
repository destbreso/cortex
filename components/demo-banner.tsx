"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ExternalLink } from "lucide-react"

export function DemoBanner() {
  return (
    <Alert className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10 mb-4">
      <Sparkles className="h-4 w-4 text-purple-400" />
      <AlertDescription className="text-purple-200">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium text-purple-100 flex items-center gap-2">
              🚀 Interfaz Avanzada de Ollama
              <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                DEMO INTERACTIVA
              </Badge>
            </div>
            <div className="text-sm text-purple-200/90">
              Explora todas las funciones: configuración avanzada, plantillas, exportación y más
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-400 text-purple-300 hover:bg-purple-500/20 bg-transparent"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Descargar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
