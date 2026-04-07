"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Download, Upload, RotateCcw, Plus, Trash2 } from "lucide-react"
import { useConfig } from "@/hooks/use-config"
import type { PromptTemplate } from "@/types/config"

export function SettingsDialog() {
  const { config, updateConfig, resetConfig, exportConfig, importConfig } = useConfig()
  const [open, setOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<PromptTemplate>>({
    name: "",
    description: "",
    template: "",
    category: "custom",
  })

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      importConfig(file)
        .then(() => {
          alert("Configuración importada exitosamente")
        })
        .catch(() => {
          alert("Error al importar configuración")
        })
    }
  }

  const addPromptTemplate = () => {
    if (!newTemplate.name || !newTemplate.template) return

    const template: PromptTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || "",
      template: newTemplate.template,
      variables: extractVariables(newTemplate.template),
      category: (newTemplate.category as any) || "custom",
    }

    updateConfig({
      promptTemplates: [...config.promptTemplates, template],
    })

    setNewTemplate({ name: "", description: "", template: "", category: "custom" })
  }

  const removePromptTemplate = (id: string) => {
    updateConfig({
      promptTemplates: config.promptTemplates.filter((t) => t.id !== id),
    })
  }

  const extractVariables = (template: string): string[] => {
    const matches = template.match(/\{([^}]+)\}/g)
    return matches ? matches.map((match) => match.slice(1, -1)) : []
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración Avanzada</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="connection">Conexión</TabsTrigger>
            <TabsTrigger value="model">Modelo</TabsTrigger>
            <TabsTrigger value="interface">Interfaz</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Conexión</CardTitle>
                <CardDescription>Configura la conexión con tu instancia de Ollama</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ollama-url">URL de Ollama</Label>
                  <Input
                    id="ollama-url"
                    value={config.ollamaUrl}
                    onChange={(e) => updateConfig({ ollamaUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeout (ms): {config.timeout}</Label>
                  <Slider
                    value={[config.timeout]}
                    onValueChange={([value]) => updateConfig({ timeout: value })}
                    max={60000}
                    min={5000}
                    step={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intentos de reconexión: {config.retryAttempts}</Label>
                  <Slider
                    value={[config.retryAttempts]}
                    onValueChange={([value]) => updateConfig({ retryAttempts: value })}
                    max={10}
                    min={1}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="model" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parámetros del Modelo</CardTitle>
                <CardDescription>Ajusta el comportamiento de generación del modelo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperatura: {config.modelConfig.temperature}</Label>
                    <Slider
                      value={[config.modelConfig.temperature]}
                      onValueChange={([value]) =>
                        updateConfig({
                          modelConfig: { ...config.modelConfig, temperature: value },
                        })
                      }
                      max={2}
                      min={0}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Controla la creatividad (0 = determinista, 2 = muy creativo)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Top P: {config.modelConfig.top_p}</Label>
                    <Slider
                      value={[config.modelConfig.top_p]}
                      onValueChange={([value]) =>
                        updateConfig({
                          modelConfig: { ...config.modelConfig, top_p: value },
                        })
                      }
                      max={1}
                      min={0}
                      step={0.05}
                    />
                    <p className="text-xs text-muted-foreground">Muestreo nucleus (0.9 recomendado)</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Top K: {config.modelConfig.top_k}</Label>
                    <Slider
                      value={[config.modelConfig.top_k]}
                      onValueChange={([value]) =>
                        updateConfig({
                          modelConfig: { ...config.modelConfig, top_k: value },
                        })
                      }
                      max={100}
                      min={1}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">Número de tokens candidatos (40 recomendado)</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Penalización de repetición: {config.modelConfig.repeat_penalty}</Label>
                    <Slider
                      value={[config.modelConfig.repeat_penalty]}
                      onValueChange={([value]) =>
                        updateConfig({
                          modelConfig: { ...config.modelConfig, repeat_penalty: value },
                        })
                      }
                      max={2}
                      min={0.5}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground">Penaliza repeticiones (1.1 recomendado)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context-length">Longitud de contexto: {config.modelConfig.num_ctx}</Label>
                  <Slider
                    value={[config.modelConfig.num_ctx]}
                    onValueChange={([value]) =>
                      updateConfig({
                        modelConfig: { ...config.modelConfig, num_ctx: value },
                      })
                    }
                    max={8192}
                    min={512}
                    step={256}
                  />
                  <p className="text-xs text-muted-foreground">Tokens de contexto disponibles</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interface" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Interfaz</CardTitle>
                <CardDescription>Personaliza la apariencia y comportamiento de la interfaz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <Select value={config.theme} onValueChange={(value: any) => updateConfig({ theme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="auto">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamaño de fuente</Label>
                    <Select value={config.fontSize} onValueChange={(value: any) => updateConfig({ fontSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeña</SelectItem>
                        <SelectItem value="medium">Mediana</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-timestamps">Mostrar marcas de tiempo</Label>
                  <Switch
                    id="show-timestamps"
                    checked={config.showTimestamps}
                    onCheckedChange={(checked) => updateConfig({ showTimestamps: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-token-count">Mostrar conteo de tokens</Label>
                  <Switch
                    id="show-token-count"
                    checked={config.showTokenCount}
                    onCheckedChange={(checked) => updateConfig({ showTokenCount: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sidebar-collapsed">Sidebar colapsado por defecto</Label>
                  <Switch
                    id="sidebar-collapsed"
                    checked={config.sidebarCollapsed}
                    onCheckedChange={(checked) => updateConfig({ sidebarCollapsed: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Chat</CardTitle>
                <CardDescription>Configura el comportamiento del chat y las conversaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="streaming">Respuestas en streaming</Label>
                  <Switch
                    id="streaming"
                    checked={config.streaming}
                    onCheckedChange={(checked) => updateConfig({ streaming: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Guardar automáticamente</Label>
                  <Switch
                    id="auto-save"
                    checked={config.autoSave}
                    onCheckedChange={(checked) => updateConfig({ autoSave: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Máximo de mensajes en historial: {config.maxHistoryLength}</Label>
                  <Slider
                    value={[config.maxHistoryLength]}
                    onValueChange={([value]) => updateConfig({ maxHistoryLength: value })}
                    max={500}
                    min={10}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-prompt">Prompt del sistema</Label>
                  <Textarea
                    id="system-prompt"
                    value={config.systemPrompt}
                    onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                    placeholder="Eres un asistente útil y amigable..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define la personalidad y comportamiento base del asistente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas de Prompts</CardTitle>
                <CardDescription>Crea y gestiona plantillas reutilizables para prompts comunes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Nombre de la plantilla"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value: any) => setNewTemplate({ ...newTemplate, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="coding">Programación</SelectItem>
                      <SelectItem value="creative">Creativo</SelectItem>
                      <SelectItem value="analysis">Análisis</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder="Descripción (opcional)"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />

                <Textarea
                  placeholder="Plantilla (usa {variable} para variables)"
                  value={newTemplate.template}
                  onChange={(e) => setNewTemplate({ ...newTemplate, template: e.target.value })}
                  rows={3}
                />

                <Button onClick={addPromptTemplate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Plantilla
                </Button>

                <div className="space-y-2">
                  {config.promptTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        {template.variables.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removePromptTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar e Importar</CardTitle>
                <CardDescription>Gestiona tu configuración y datos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Formato de exportación</Label>
                    <Select
                      value={config.exportFormat}
                      onValueChange={(value: any) => updateConfig({ exportFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="txt">Texto plano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-metadata">Incluir metadatos</Label>
                    <Switch
                      id="include-metadata"
                      checked={config.includeMetadata}
                      onCheckedChange={(checked) => updateConfig({ includeMetadata: checked })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={exportConfig} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Configuración
                  </Button>

                  <div className="flex-1">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                      id="import-config"
                    />
                    <Button asChild className="w-full">
                      <label htmlFor="import-config" className="cursor-pointer flex items-center justify-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Configuración
                      </label>
                    </Button>
                  </div>
                </div>

                <Button variant="destructive" onClick={resetConfig} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer a valores por defecto
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
