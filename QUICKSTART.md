# Quick Start

## Stack completo con Docker (recomendado)

### Primera vez

```bash
# 1. Copia el env (edita OLLAMA_URL si necesitas)
cp .env.example .env

# 2. Levanta todo el stack (app + MongoDB)
docker compose up --build -d

# 3. Abre la interfaz
open http://localhost:3000
```

> **Ollama** debe estar corriendo en la máquina host. Por defecto se conecta a
> `http://host.docker.internal:11434` (macOS/Windows).  
> En Linux cambia `OLLAMA_URL=http://172.17.0.1:11434` o usa `--network host`.

---

### Refrescar tras cambios de código

```bash
# Reconstruye solo la imagen de la app (sin tocar MongoDB)
docker compose up --build -d app
```

### Parar sin borrar datos

```bash
docker compose down
```

### Destruir todo (incluye datos de MongoDB)

```bash
docker compose down -v
```

### Ver logs

```bash
docker logs ollama-interface -f
docker logs ollama-mongo -f
```

---

## Desarrollo local (sin Docker)

### Requisitos

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- MongoDB corriendo (local o Docker standalone)
- Ollama corriendo (`ollama serve`)

### Setup

```bash
# Dependencias
pnpm install

# Copia y ajusta el env
cp .env.example .env.local
# → Edita DATABASE_URL si tu Mongo corre en otro puerto/auth

# Inicia Next.js en modo dev
pnpm dev
```

Abre http://localhost:3000.

### MongoDB rápido con Docker (solo la BD)

```bash
docker run -d --name ollama-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=ollama \
  -e MONGO_INITDB_ROOT_PASSWORD=ollama \
  mongo:7
```

El `DATABASE_URL` en `.env.local` para este caso:

```
DATABASE_URL=mongodb://ollama:ollama@localhost:27017/ollama_interface?authSource=admin
```

---

## Modos de operación

| Modo             | `DATABASE_URL`                | Persistencia                   |
|------------------|-------------------------------|--------------------------------|
| **localStorage** | no definida                   | Solo en el navegador           |
| **DB mode**      | definida y MongoDB alcanzable | Sesiones, historial, skillsets |

El indicador **DB / Local** en la esquina superior del sidebar muestra el modo activo.

---

## Variables de entorno

| Variable       | Descripción                  | Defecto                  |
|----------------|------------------------------|--------------------------|
| `OLLAMA_URL`   | URL de la instancia Ollama   | `http://localhost:11434` |
| `DATABASE_URL` | MongoDB connection string    | *(vacío = modo local)*   |
| `NODE_ENV`     | `development` / `production` | `development`            |

---

## Funcionalidades

- **Sesiones persistentes** — el historial de chats se guarda en MongoDB
- **Rewind** — al hacer hover sobre la línea entre turnos, cancela el chat hasta ese punto
- **Fork** — igual que Rewind pero inicia una nueva sesión sin persistir desde ese punto
- **SkillSets** — presets de system prompt + parámetros del modelo
- **Export** — exporta el chat en JSON, Markdown o texto plano
