import { NextResponse } from "next/server"

const DEMO_MODELS = [
  {
    name: "llama3.2:latest",
    size: 2048576000,
    modified_at: "2024-01-15T10:30:00Z",
    digest: "demo-digest-1",
  },
  {
    name: "codellama:7b",
    size: 3584000000,
    modified_at: "2024-01-14T15:45:00Z",
    digest: "demo-digest-2",
  },
  {
    name: "mistral:7b",
    size: 4096000000,
    modified_at: "2024-01-13T09:20:00Z",
    digest: "demo-digest-3",
  },
  {
    name: "phi3:mini",
    size: 2304000000,
    modified_at: "2024-01-12T14:10:00Z",
    digest: "demo-digest-4",
  },
]

export async function GET(request: Request) {
  const isV0Environment = process.env.VERCEL_ENV === "preview" && !process.env.OLLAMA_URL

  if (isV0Environment) {
    return NextResponse.json({
      models: DEMO_MODELS,
      error: "Modo demostración - Ollama no disponible en este entorno",
      details: "Explorando la interfaz con modelos simulados. Para usar Ollama real, ejecuta la aplicación localmente.",
      isDemoMode: true,
    })
  }

  const { searchParams } = new URL(request.url)
  const clientUrl = searchParams.get("ollamaUrl")
  const ollamaUrl = clientUrl || process.env.OLLAMA_URL || "http://localhost:11434"

  try {
    console.log("[v0] Intentando conectar a Ollama en:", ollamaUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Ollama responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Conectado exitosamente a Ollama, modelos encontrados:", data.models?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error conectando a Ollama:", error)

    return NextResponse.json(
      {
        error: "No se pudo conectar a Ollama",
        details: `Error: ${error instanceof Error ? error.message : "Conexión fallida"}`,
        instructions: [
          "1. Verifica que Ollama esté ejecutándose: ollama serve",
          "2. Confirma que esté en el puerto correcto: http://localhost:11434",
          "3. Prueba la conexión: curl http://localhost:11434/api/tags",
          "4. Verifica la variable de entorno OLLAMA_URL en tu .env.local",
        ],
        ollamaUrl,
        isDemoMode: false,
        connectionFailed: true,
      },
      { status: 503 },
    )
  }
}
