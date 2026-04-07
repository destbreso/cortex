"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Activity, Zap, Clock } from "lucide-react"

interface ModelPerformanceIndicatorProps {
  model: string
  isLoading: boolean
  lastResponseTime?: number
}

export function ModelPerformanceIndicator({ model, isLoading, lastResponseTime }: ModelPerformanceIndicatorProps) {
  const [averageResponseTime, setAverageResponseTime] = useState<number[]>([])

  useEffect(() => {
    if (lastResponseTime) {
      setAverageResponseTime((prev) => [...prev.slice(-4), lastResponseTime])
    }
  }, [lastResponseTime])

  const getPerformanceLevel = () => {
    if (!lastResponseTime) return "unknown"
    if (lastResponseTime < 2000) return "excellent"
    if (lastResponseTime < 5000) return "good"
    if (lastResponseTime < 10000) return "fair"
    return "slow"
  }

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "fair":
        return "bg-yellow-500"
      case "slow":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPerformanceText = (level: string) => {
    switch (level) {
      case "excellent":
        return "Excelente"
      case "good":
        return "Bueno"
      case "fair":
        return "Regular"
      case "slow":
        return "Lento"
      default:
        return "Desconocido"
    }
  }

  const performanceLevel = getPerformanceLevel()
  const avgTime =
    averageResponseTime.length > 0 ? averageResponseTime.reduce((a, b) => a + b, 0) / averageResponseTime.length : 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <div
                className={`w-2 h-2 rounded-full ${getPerformanceColor(performanceLevel)} ${isLoading ? "animate-pulse" : ""}`}
              />
            </div>
            <Badge variant="outline" className="text-xs">
              {isLoading ? "Procesando..." : getPerformanceText(performanceLevel)}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Última respuesta: {lastResponseTime ? `${(lastResponseTime / 1000).toFixed(1)}s` : "N/A"}
            </div>
            {avgTime > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Promedio: {(avgTime / 1000).toFixed(1)}s
              </div>
            )}
            <div className="text-muted-foreground">Modelo: {model}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
