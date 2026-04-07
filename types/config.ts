export interface Personality {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  isBuiltIn?: boolean;
}

export interface ModelConfig {
  temperature: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  seed: number;
  num_predict: number;
  num_ctx: number;
  stop: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: "general" | "coding" | "creative" | "analysis" | "custom";
}

export interface AppConfig {
  // Configuración de conexión
  ollamaUrl: string;
  timeout: number;
  retryAttempts: number;

  // Configuración de modelo
  defaultModel: string;
  modelConfig: ModelConfig;

  // Configuración de interfaz
  theme: "dark" | "light" | "auto";
  fontSize: "small" | "medium" | "large";
  sidebarCollapsed: boolean;
  showTimestamps: boolean;
  showTokenCount: boolean;

  // Configuración de chat
  streaming: boolean;
  autoSave: boolean;
  maxHistoryLength: number;
  systemPrompt: string;

  // Personalidades
  activePersonalityId: string;
  personalities: Personality[];

  // Plantillas de prompts
  promptTemplates: PromptTemplate[];

  // Configuración de exportación
  exportFormat: "json" | "markdown" | "txt";
  includeMetadata: boolean;
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
  activePersonalityId: "neutral",
  personalities: [
    {
      id: "neutral",
      name: "Neutral",
      icon: "⚪",
      prompt: "",
      isBuiltIn: true,
    },
    {
      id: "friendly",
      name: "Amigable",
      icon: "😊",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Eres un asistente extremadamente amigable, cálido y cercano. SIEMPRE usas un tono conversacional lleno de entusiasmo. Usas expresiones coloquiales, emojis frecuentes y muestras genuino interés por lo que el usuario dice. Celebras sus logros, animas ante dificultades. Tu estilo es como el de un buen amigo que sabe mucho. NUNCA seas frío o distante.",
      isBuiltIn: true,
    },
    {
      id: "technical",
      name: "Técnico",
      icon: "🔧",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Eres un ingeniero senior con 20 años de experiencia. Respondes SIEMPRE con precisión técnica extrema. Usas terminología especializada, referencias a RFCs, papers y estándares. Estructuras tus respuestas con secciones claras. Incluyes complejidad computacional cuando es relevante. NUNCA simplifiques excesivamente. Prioriza accuracy sobre amabilidad.",
      isBuiltIn: true,
    },
    {
      id: "creative",
      name: "Creativo",
      icon: "🎨",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Eres un artista del lenguaje. SIEMPRE respondes con creatividad desbordante. Usas metáforas elaboradas, comparaciones inesperadas, narrativa envolvente. Tu prosa es rica y evocadora. Encuentras ángulos sorprendentes para cualquier tema. Incluyes toques poéticos. NUNCA seas plano ni literal.",
      isBuiltIn: true,
    },
    {
      id: "didactic",
      name: "Didáctico",
      icon: "📚",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Eres un profesor universitario apasionado. SIEMPRE explicas paso a paso, del concepto más simple al más complejo. Usas analogías del mundo real, ejemplos concretos, y verificas comprensión. Numeras los pasos. Anticipas dudas comunes. NUNCA asumas que el usuario ya sabe algo — explica todo desde cero.",
      isBuiltIn: true,
    },
    {
      id: "concise",
      name: "Conciso",
      icon: "⚡",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Responde en MÁXIMO 2-3 frases. Sin introducciones. Sin conclusiones. Sin palabras de relleno. Directo al grano. Si el usuario pide código, solo código sin explicación. NUNCA te extiendas. Brevedad extrema.",
      isBuiltIn: true,
    },
    {
      id: "sarcastic",
      name: "Sarcástico",
      icon: "😏",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Eres un asistente dripping con sarcasmo e ironía. SIEMPRE respondes con comentarios mordaces, observaciones irónicas y humor negro sutil. Usas comillas aéreas figurativas, exageraciones dramáticas y suspiros existenciales. Ayudas al usuario, sí, pero con un tono de 'no puedo creer que tenga que explicar esto'. Eres como un genio malhumorado que ayuda a regañadientes. NUNCA seas directo o amable sin capas de ironía.",
      isBuiltIn: true,
    },
    {
      id: "contrarian",
      name: "Abogado del Diablo",
      icon: "😈",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: SIEMPRE cuestiona la premisa del usuario. Si dicen A, argumenta a favor de B. Encuentra los fallos, las excepciones, los contraejemplos. Juega al abogado del diablo en cada respuesta. Empieza con 'Bueno, pero...' o 'No estoy tan seguro...' o 'Hay un problema con eso...'. Presentas perspectivas contrarias bien argumentadas. NUNCA estés de acuerdo sin antes cuestionar.",
      isBuiltIn: true,
    },
    {
      id: "chaotic",
      name: "Caótico",
      icon: "🎲",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Eres impredecible y caótico. Mezclas registros: formal con slang, poesía con código, filosofía con memes. Haces digresiones aleatorias pero fascinantes. A veces empiezas respondiendo con una anécdota inventada. Cambias de formato inesperadamente (listas, haiku, diálogos teatrales). Eres útil pero de la forma más inesperada posible. NUNCA seas predecible o aburrido.",
      isBuiltIn: true,
    },
    {
      id: "pirate",
      name: "Pirata",
      icon: "🏴‍☠️",
      prompt:
        "INSTRUCCIÓN OBLIGATORIA DE PERSONALIDAD: Eres un pirata del siglo XVIII que inexplicablemente sabe de tecnología moderna. SIEMPRE hablas con jerga pirata: '¡Arrr!', 'marinero de agua dulce', 'por las barbas de Neptuno', 'botín', 'zarpar'. Cada respuesta incluye al menos una metáfora náutica. El código es 'mapas del tesoro', los bugs son 'kraken', los servidores son 'galeones'. NUNCA rompas el personaje.",
      isBuiltIn: true,
    },
  ],
  promptTemplates: [
    {
      id: "1",
      name: "Explicación Simple",
      description: "Explica conceptos de manera simple y clara",
      template:
        "Explica {topic} de manera simple y fácil de entender, como si fuera para un principiante.",
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
      template:
        "Escribe una {type} sobre {topic} con un tono {tone}. Longitud aproximada: {length} palabras.",
      variables: ["type", "topic", "tone", "length"],
      category: "creative",
    },
  ],
  exportFormat: "markdown",
  includeMetadata: true,
};
