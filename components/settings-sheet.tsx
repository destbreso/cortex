"use client";

import type React from "react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useDbMode } from "@/hooks/use-db-mode";
import { useSkillsets } from "@/hooks/use-skillsets";
import { SkillsetManager } from "./skillset-manager";

function SkillsetManagerTab() {
  const {
    skillsets,
    activeSkillsetId,
    setActive,
    createSkillset,
    updateSkillset,
    deleteSkillset,
  } = useSkillsets();

  return (
    <SkillsetManager
      skillsets={skillsets}
      activeSkillsetId={activeSkillsetId}
      onSetActive={setActive}
      onCreate={createSkillset}
      onUpdate={updateSkillset}
      onDelete={deleteSkillset}
    />
  );
}

export function SettingsSheet() {
  const { config, updateConfig, resetConfig, exportConfig, importConfig } =
    useConfig();
  const { isDbMode, isLoading: dbLoading } = useDbMode();
  const [open, setOpen] = useState(false);
  const [dbTestStatus, setDbTestStatus] = useState<
    "idle" | "testing" | "ok" | "error"
  >("idle");
  const [dbTestMsg, setDbTestMsg] = useState("");

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importConfig(file)
        .then(() => alert("Configuración importada exitosamente"))
        .catch(() => alert("Error al importar configuración"));
    }
  };

  const testDbConnection = async () => {
    setDbTestStatus("testing");
    setDbTestMsg("");
    try {
      const res = await fetch("/api/db-status");
      const data = await res.json();
      if (data.enabled) {
        setDbTestStatus("ok");
        setDbTestMsg("Conexión exitosa con la base de datos.");
      } else {
        setDbTestStatus("error");
        setDbTestMsg(
          "No se pudo conectar. Verifica DATABASE_URL y que MongoDB esté disponible.",
        );
      }
    } catch {
      setDbTestStatus("error");
      setDbTestMsg("Error de red al intentar contactar el servidor.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Configuración avanzada">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Configuración Avanzada</SheetTitle>
            {isDbMode && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Database className="h-3 w-3" />
                Modo DB activo
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="px-6 py-4">
          <Tabs defaultValue="connection" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-2">
              <TabsTrigger value="connection">Conexión</TabsTrigger>
              <TabsTrigger value="model">Modelo</TabsTrigger>
              <TabsTrigger value="interface">Interfaz</TabsTrigger>
              <TabsTrigger value="database" className="relative">
                Base de datos
                {!dbLoading && (
                  <span
                    className={`ml-1 h-2 w-2 rounded-full inline-block ${isDbMode ? "bg-green-500" : "bg-yellow-400"}`}
                  />
                )}
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="skillsets">Skillsets</TabsTrigger>
              <TabsTrigger value="export">Exportar</TabsTrigger>
            </TabsList>

            {/* ── Conexión ── */}
            <TabsContent value="connection" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Conexión</CardTitle>
                  <CardDescription>
                    Configura la conexión con tu instancia de Ollama
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ollama-url">URL de Ollama</Label>
                    <Input
                      id="ollama-url"
                      value={config.ollamaUrl}
                      onChange={(e) =>
                        updateConfig({ ollamaUrl: e.target.value })
                      }
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout (ms): {config.timeout}</Label>
                    <Slider
                      value={[config.timeout]}
                      onValueChange={([value]) =>
                        updateConfig({ timeout: value })
                      }
                      max={60000}
                      min={5000}
                      step={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Intentos de reconexión: {config.retryAttempts}
                    </Label>
                    <Slider
                      value={[config.retryAttempts]}
                      onValueChange={([value]) =>
                        updateConfig({ retryAttempts: value })
                      }
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Base de datos ── */}
            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Estado de persistencia
                  </CardTitle>
                  <CardDescription>
                    Sin DB activa, todo se guarda en la sesión del navegador
                    (localStorage) y se pierde al cerrar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status badge */}
                  <div
                    className={`flex items-center gap-3 rounded-lg border p-3 ${isDbMode ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}
                  >
                    {dbLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isDbMode ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {dbLoading
                          ? "Verificando..."
                          : isDbMode
                            ? "MongoDB conectado"
                            : "Sin persistencia — sólo localStorage"}
                      </p>
                      {!isDbMode && !dbLoading && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Las conversaciones no se guardan entre sesiones del
                          navegador.
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 gap-1"
                      onClick={testDbConnection}
                      disabled={dbTestStatus === "testing"}
                    >
                      {dbTestStatus === "testing" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Probar
                    </Button>
                  </div>

                  {dbTestMsg && (
                    <p
                      className={`text-xs px-1 ${dbTestStatus === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                    >
                      {dbTestMsg}
                    </p>
                  )}

                  {/* Options */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      Opciones para activar persistencia
                    </h4>

                    <div className="rounded-lg border p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Opción A — Docker todo incluido (recomendado)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Levanta la app + MongoDB en un solo comando:
                      </p>
                      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto select-all">
                        docker compose up --build -d
                      </pre>
                      <p className="text-xs text-muted-foreground">
                        Abre{" "}
                        <span className="font-mono">http://localhost:3000</span>
                      </p>
                    </div>

                    <div className="rounded-lg border p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Opción B — MongoDB externo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Añade en tu{" "}
                        <span className="font-mono">.env.local</span> o variable
                        de entorno:
                      </p>
                      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto select-all">
                        DATABASE_URL=mongodb://user:pass@host:27017/ollama_interface?authSource=admin
                      </pre>
                      <p className="text-xs text-muted-foreground">
                        Reinicia el servidor tras guardar el cambio.
                      </p>
                    </div>

                    <div className="rounded-lg border p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Opción C — MongoDB Atlas (nube)
                      </p>
                      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto select-all">
                        DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/ollama_interface
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Modelo ── */}
            <TabsContent value="model" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parámetros del Modelo</CardTitle>
                  <CardDescription>
                    Ajusta el comportamiento de generación del modelo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Temperatura: {config.modelConfig.temperature}
                      </Label>
                      <Slider
                        value={[config.modelConfig.temperature]}
                        onValueChange={([value]) =>
                          updateConfig({
                            modelConfig: {
                              ...config.modelConfig,
                              temperature: value,
                            },
                          })
                        }
                        max={2}
                        min={0}
                        step={0.1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Controla la creatividad (0 = determinista, 2 = muy
                        creativo)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Top P: {config.modelConfig.top_p}</Label>
                      <Slider
                        value={[config.modelConfig.top_p]}
                        onValueChange={([value]) =>
                          updateConfig({
                            modelConfig: {
                              ...config.modelConfig,
                              top_p: value,
                            },
                          })
                        }
                        max={1}
                        min={0}
                        step={0.05}
                      />
                      <p className="text-xs text-muted-foreground">
                        Muestreo nucleus (0.9 recomendado)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Top K: {config.modelConfig.top_k}</Label>
                      <Slider
                        value={[config.modelConfig.top_k]}
                        onValueChange={([value]) =>
                          updateConfig({
                            modelConfig: {
                              ...config.modelConfig,
                              top_k: value,
                            },
                          })
                        }
                        max={100}
                        min={1}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Número de tokens candidatos
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Penalización de repetición:{" "}
                        {config.modelConfig.repeat_penalty}
                      </Label>
                      <Slider
                        value={[config.modelConfig.repeat_penalty]}
                        onValueChange={([value]) =>
                          updateConfig({
                            modelConfig: {
                              ...config.modelConfig,
                              repeat_penalty: value,
                            },
                          })
                        }
                        max={2}
                        min={0.5}
                        step={0.1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Penaliza repeticiones (1.1 recomendado)
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Longitud de contexto: {config.modelConfig.num_ctx}
                    </Label>
                    <Slider
                      value={[config.modelConfig.num_ctx]}
                      onValueChange={([value]) =>
                        updateConfig({
                          modelConfig: {
                            ...config.modelConfig,
                            num_ctx: value,
                          },
                        })
                      }
                      max={8192}
                      min={512}
                      step={256}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tokens de contexto disponibles
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Interfaz ── */}
            <TabsContent value="interface" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Interfaz</CardTitle>
                  <CardDescription>
                    Personaliza la apariencia y comportamiento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <Select
                        value={config.theme}
                        onValueChange={(value: any) =>
                          updateConfig({ theme: value })
                        }
                      >
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
                      <Select
                        value={config.fontSize}
                        onValueChange={(value: any) =>
                          updateConfig({ fontSize: value })
                        }
                      >
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
                    <Label htmlFor="show-timestamps">
                      Mostrar marcas de tiempo
                    </Label>
                    <Switch
                      id="show-timestamps"
                      checked={config.showTimestamps}
                      onCheckedChange={(checked) =>
                        updateConfig({ showTimestamps: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-token-count">
                      Mostrar conteo de tokens
                    </Label>
                    <Switch
                      id="show-token-count"
                      checked={config.showTokenCount}
                      onCheckedChange={(checked) =>
                        updateConfig({ showTokenCount: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebar-collapsed">
                      Sidebar colapsado por defecto
                    </Label>
                    <Switch
                      id="sidebar-collapsed"
                      checked={config.sidebarCollapsed}
                      onCheckedChange={(checked) =>
                        updateConfig({ sidebarCollapsed: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Chat ── */}
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Chat</CardTitle>
                  <CardDescription>
                    Configura el comportamiento de las conversaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="streaming">Respuestas en streaming</Label>
                    <Switch
                      id="streaming"
                      checked={config.streaming}
                      onCheckedChange={(checked) =>
                        updateConfig({ streaming: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save">Guardar automáticamente</Label>
                      {isDbMode && (
                        <p className="text-xs text-muted-foreground">
                          Guarda en base de datos
                        </p>
                      )}
                    </div>
                    <Switch
                      id="auto-save"
                      checked={config.autoSave}
                      onCheckedChange={(checked) =>
                        updateConfig({ autoSave: checked })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Máximo de mensajes en historial: {config.maxHistoryLength}
                    </Label>
                    <Slider
                      value={[config.maxHistoryLength]}
                      onValueChange={([value]) =>
                        updateConfig({ maxHistoryLength: value })
                      }
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
                      onChange={(e) =>
                        updateConfig({ systemPrompt: e.target.value })
                      }
                      placeholder="Eres un asistente útil y amigable..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Define la personalidad base del asistente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Skillsets ── */}
            <TabsContent value="skillsets" className="space-y-4">
              <SkillsetManagerTab />
            </TabsContent>

            {/* ── Exportar ── */}
            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Exportar e Importar</CardTitle>
                  <CardDescription>
                    Gestiona tu configuración y datos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Formato de exportación</Label>
                      <Select
                        value={config.exportFormat}
                        onValueChange={(value: any) =>
                          updateConfig({ exportFormat: value })
                        }
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
                      <Label htmlFor="include-metadata">
                        Incluir metadatos
                      </Label>
                      <Switch
                        id="include-metadata"
                        checked={config.includeMetadata}
                        onCheckedChange={(checked) =>
                          updateConfig({ includeMetadata: checked })
                        }
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
                        <label
                          htmlFor="import-config"
                          className="cursor-pointer flex items-center justify-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Configuración
                        </label>
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={resetConfig}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restablecer a valores por defecto
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
