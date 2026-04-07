export interface ModelConfig {
  temperature: number
  top_p: number
  top_k: number
  repeat_penalty: number
  seed: number
  num_predict: number
  num_ctx: number
  stop: string[]
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  category: "general" | "coding" | "creative" | "analysis" | "custom"
}

export interface AppConfig {
  // Configuración de conexión
  ollamaUrl: string
  timeout: number
  retryAttempts: number

  // Configuración de modelo
  defaultModel: string
  modelConfig: ModelConfig

  // Configuración de interfaz
  theme: "dark" | "light" | "auto"
  fontSize: "small" | "medium" | "large"
  sidebarCollapsed: boolean
  showTimestamps: boolean
  showTokenCount: boolean

  // Configuración de chat
  streaming: boolean
  autoSave: boolean
  maxHistoryLength: number
  systemPrompt: string

  // Plantillas de prompts
  promptTemplates: PromptTemplate[]

  // Configuración de exportación
  exportFormat: "json" | "markdown" | "txt"
  includeMetadata: boolean
}

export const defaultConfig: AppConfig = {
  ollamaUrl: "http://localhost:11434",
  timeout: 30000,
  retryAttempts: 3,
  defaultModel: "",
  modelConfig: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    seed: -1,
    num_predict: -1,
    num_ctx: 2048,
    stop: [],
  },
  theme: "dark",
  fontSize: "medium",
  sidebarCollapsed: false,
  showTimestamps: true,
  showTokenCount: false,
  streaming: true,
  autoSave: true,
  maxHistoryLength: 100,
  systemPrompt: "",
  promptTemplates: [
    {
      id: "1",
      name: "Explicación Simple",
      description: "Explica conceptos de manera simple y clara",
      template: "Explica {topic} de manera simple y fácil de entender, como si fuera para un principiante.",
      variables: ["topic"],
      category: "general",
    },
    {
      id: "2",
      name: "Revisar Código",
      description: "Revisa y mejora código",
      template:
        "Revisa el siguiente código y sugiere mejoras:\n\n```{language}\n{code}\n```\n\nPor favor proporciona:\n1. Análisis del código\n2. Posibles mejoras\n3. Mejores prácticas",
      variables: ["language", "code"],
      category: "coding",
    },
    {
      id: "3",
      name: "Escritura Creativa",
      description: "Ayuda con escritura creativa",
      template: "Escribe una {type} sobre {topic} con un tono {tone}. Longitud aproximada: {length} palabras.",
      variables: ["type", "topic", "tone", "length"],
      category: "creative",
    },
  ],
  exportFormat: "markdown",
  includeMetadata: true,
}
