import { type NextRequest, NextResponse } from "next/server";

const DEMO_RESPONSES = [
  "¡Hola! Soy una demostración de la interfaz de Ollama. En el modo real, estaría conectado a tu instancia local de Ollama para generar respuestas reales con IA.",
  "Esta es una respuesta de demostración. Para usar la funcionalidad completa, asegúrate de tener Ollama ejecutándose en tu máquina local.",
  "Modo demostración activo. Las respuestas reales vendrían de tu modelo de IA local una vez que Ollama esté configurado correctamente.",
  "¡Excelente pregunta! En modo real, tu modelo de IA local procesaría esta consulta y proporcionaría una respuesta inteligente basada en sus capacidades.",
  "Esta interfaz está diseñada para trabajar con Ollama local. Actualmente estás viendo el modo demostración para explorar las funcionalidades.",
  "Puedes probar todas las configuraciones y funciones en este modo demo. Cuando conectes Ollama real, obtendrás respuestas generadas por IA.",
  "El modo demostración te permite explorar la interfaz completa, incluyendo configuración de parámetros, plantillas de prompts y exportación de conversaciones.",
];

export async function POST(request: NextRequest) {
  const isV0Environment =
    process.env.VERCEL_ENV === "preview" && !process.env.OLLAMA_URL;

  if (isV0Environment) {
    const demoResponse =
      DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];

    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1200),
    );

    return NextResponse.json({
      message: {
        role: "assistant",
        content: `${demoResponse}\n\n*Nota: Esta es una respuesta de demostración en el entorno de v0.*`,
      },
      isDemoMode: true,
    });
  }

  try {
    const body = await request.json();
    const { model, messages, options, stream, ollamaUrl: clientUrl } = body;

    if (!model || !messages) {
      return NextResponse.json(
        { error: "Model and messages are required" },
        { status: 400 },
      );
    }

    const ollamaUrl = process.env.OLLAMA_URL || clientUrl || "http://localhost:11434";

    console.log("[v0] Enviando chat a Ollama:", {
      model,
      messagesCount: messages.length,
      options,
    });

    // The Next.js route returns a single JSON response, so we always request
    // non-streaming from Ollama regardless of what the client asked for.
    const payload: any = {
      model,
      messages,
      stream: false,
    };

    if (options) {
      payload.options = {};

      if (options.temperature !== undefined)
        payload.options.temperature = options.temperature;
      if (options.top_p !== undefined) payload.options.top_p = options.top_p;
      if (options.top_k !== undefined) payload.options.top_k = options.top_k;
      if (options.repeat_penalty !== undefined)
        payload.options.repeat_penalty = options.repeat_penalty;
      if (options.seed !== undefined) payload.options.seed = options.seed;
      if (options.num_predict !== undefined)
        payload.options.num_predict = options.num_predict;
      if (options.num_ctx !== undefined)
        payload.options.num_ctx = options.num_ctx;
      if (options.stop && options.stop.length > 0)
        payload.options.stop = options.stop;

      console.log("[v0] Parámetros aplicados:", payload.options);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout más largo para respuestas reales

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ollama responded with status: ${response.status} - ${errorText}`,
      );
    }

    // With stream:false Ollama returns a single JSON object, but some versions
    // still use NDJSON. Handle both: read as text, parse the last non-empty line.
    const text = await response.text();
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    const data = JSON.parse(lines[lines.length - 1]);
    console.log("[v0] Respuesta recibida de Ollama exitosamente");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] Error en chat API:", error);

    return NextResponse.json(
      {
        error: "No se pudo conectar a Ollama para el chat",
        details: `Error: ${error instanceof Error ? error.message : "Conexión fallida"}`,
        instructions: [
          "1. Verifica que Ollama esté ejecutándose: ollama serve",
          "2. Confirma que el modelo esté disponible: ollama list",
          "3. Prueba la conexión: curl http://localhost:11434/api/tags",
          "4. Verifica la variable de entorno OLLAMA_URL en tu .env.local",
        ],
        isDemoMode: false,
        connectionFailed: true,
      },
      { status: 503 },
    );
  }
}
