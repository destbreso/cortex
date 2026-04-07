import { CheckCircle, Play, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ConnectionStatusProps {
  isConnected: boolean
  error?: string
  details?: string
  isDemoMode?: boolean
  instructions?: string[]
  ollamaUrl?: string
}

export function ConnectionStatus({
  isConnected,
  error,
  details,
  isDemoMode,
  instructions,
  ollamaUrl,
}: ConnectionStatusProps) {
  if (isDemoMode) {
    return (
      <Alert className="border-blue-500/30 bg-blue-500/10">
        <Play className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium text-blue-100 flex items-center gap-2">
                Modo Demostración Activo
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                  DEMO
                </Badge>
              </div>
              <div className="text-sm text-blue-200/90">Explorando la interfaz con datos simulados</div>
              <div className="text-xs mt-2 space-y-1 text-blue-200/80">
                <div>• Los modelos mostrados son ejemplos</div>
                <div>• Las respuestas son simuladas</div>
                <div>• Todas las funciones de configuración están disponibles</div>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (isConnected) {
    return (
      <Alert className="border-green-500/30 bg-green-500/10">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          <div className="flex items-center justify-between">
            <span>Conectado a Ollama {ollamaUrl && `(${ollamaUrl})`}</span>
            <Badge variant="outline" className="text-xs border-green-400 text-green-300">
              CONECTADO
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-red-500/30 bg-red-500/10">
      <AlertTriangle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-red-200">
        <div className="space-y-3">
          <div className="font-medium text-red-100 flex items-center gap-2">
            {error || "Error de conexión con Ollama"}
            <Badge variant="outline" className="text-xs border-red-400 text-red-300">
              ERROR
            </Badge>
          </div>

          {details && <div className="text-sm text-red-200/90 bg-red-900/20 p-2 rounded">{details}</div>}

          {ollamaUrl && (
            <div className="text-xs text-red-200/80">
              Intentando conectar a: <code className="bg-red-900/30 text-red-100 px-1 rounded">{ollamaUrl}</code>
            </div>
          )}

          {instructions && instructions.length > 0 && (
            <div className="text-xs space-y-1 text-red-200/80">
              <div className="font-medium text-red-100">Pasos para solucionar:</div>
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-1">
                  <span className="text-red-300 font-mono text-xs mt-0.5">•</span>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
            💡 Una vez que Ollama esté funcionando, recarga la página para conectarte
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
