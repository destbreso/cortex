# Cortex

> Your local command center for large language models.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Ollama](https://img.shields.io/badge/Ollama-compatible-white?logo=ollama)](https://ollama.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## What is Cortex?

Cortex is a local-first control plane for LLMs. Not a wrapper, not a generic chatbot - a **command layer** that sits between you and the models, designed to let you shape, direct, and amplify how you interact with them.

It runs entirely on your machine. Your conversations never leave unless you choose. The models think; Cortex manages the context, the memory, and the persona they operate under.

Built natively for [Ollama](https://ollama.com), with an architecture designed to extend to any compatible API.

---

## Motivation

Every LLM interface looks the same: a text box, a send button, a model selector. They abstract the model into a chatbot and call it a day.

Cortex takes the opposite approach. It exposes the knobs. You control temperature, context window, personality, system prompts, knowledge bases - everything that shapes how a model responds. The interface stays clean, but the power is there when you need it.

Call it opinionated minimalism with sharp edges.

---

## Features

- **Skillsets** - Mission profiles that combine a system prompt, a knowledge base (`.md` files), and reusable prompt templates with `{variables}`. Swap between them from the action bar.
- **Personalities** - 10 built-in behavioral presets (Neutral, Friendly, Technical, Creative, Didactic, Concise, Sarcastic, Chaotic, Devil's Advocate, Pirate) plus full custom creation. Skillsets override them when active.
- **Fork** - Split any conversation at any turn. The original thread stays intact; a new one branches from that point. Both live in the sidebar.
- **Rewind** - Make Cortex forget everything after a chosen point. Shows a confirmation with the message count. Irreversible by design.
- **Persistent memory** - Connect MongoDB and Cortex remembers everything: threads, skillsets, configuration. Without it, sessions are volatile.
- **Prompt templates** - Reusable prompts with variable substitution, scoped to each Skillset. One click to fill and fire.
- **Model controls** - Temperature, top\_p, top\_k, context window, max tokens, repeat penalty, seed. Per session.
- **Dark / light themes** - With a visual transition animation. Because details matter.
- **Export** - Full config export/import as JSON. Portable across machines.
- **Integrated assistant** - A floating help agent that knows the app and answers questions about it using your active model.

---

## Stack

| Layer           | Tech                              |
|-----------------|-----------------------------------|
| Framework       | Next.js 14 (App Router)           |
| Language        | TypeScript 5                      |
| Styling         | Tailwind CSS v4 (oklch palette)   |
| Components      | shadcn/ui + Radix UI              |
| Database        | MongoDB 7 (native driver, no ORM) |
| LLM backend     | Ollama                            |
| Package manager | Yarn 4 (Berry)                    |
| Fonts           | Geist Sans / Geist Mono           |

---

## Quickstart

### Option A - Full stack with Docker (recommended)

```bash
# 1. Copy the env file
cp .env.example .env

# 2. Start the full stack (app + MongoDB)
docker compose up --build -d

# 3. Open Cortex
open http://localhost:3000
```

> **Ollama must be running on the host.** Cortex connects to `http://host.docker.internal:11434` by default (macOS/Windows).  
> On Linux, set `OLLAMA_URL=http://172.17.0.1:11434` or use `--network host`.

---

### Option B - Local development

**Prerequisites:** Node.js 20+, Yarn, MongoDB running locally, Ollama running (`ollama serve`)

```bash
# Install dependencies
yarn install

# Copy and edit the env
cp .env.example .env.local

# Start the dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

**MongoDB with Docker (just the DB):**

```bash
docker run -d --name cortex-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=cortex \
  -e MONGO_INITDB_ROOT_PASSWORD=cortex \
  mongo:7
```

Then set in `.env.local`:

```
DATABASE_URL=mongodb://cortex:cortex@localhost:27017/cortex?authSource=admin
```

---

## Environment variables

| Variable       | Description                  | Default                   |
|----------------|------------------------------|---------------------------|
| `OLLAMA_URL`   | Ollama instance URL          | `http://localhost:11434`  |
| `DATABASE_URL` | MongoDB connection string    | *(empty = volatile mode)* |
| `NODE_ENV`     | `development` / `production` | `development`             |

---

## Operating modes

| Mode         | `DATABASE_URL`          | What persists              |
|--------------|-------------------------|----------------------------|
| **Volatile** | not set                 | Config only (localStorage) |
| **Memory**   | set + MongoDB reachable | Threads, Skillsets, config |

The **DB / Local** indicator in the sidebar shows the active mode. Skillsets are disabled in volatile mode.

---

## Docker commands

```bash
# Rebuild after code changes
docker compose up --build -d app

# Stop without losing data
docker compose down

# Stop and wipe everything (including MongoDB data)
docker compose down -v

# Follow logs
docker logs cortex -f
docker logs cortex-mongo -f
```

---

## Project structure

```
app/              → Next.js App Router (pages, layouts, API routes)
components/       → UI components (chat, sidebar, settings, skillsets…)
hooks/            → Custom React hooks (useOllama, useConfig, useSkillsets…)
types/            → TypeScript types and defaults
lib/              → Utilities
```

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss the direction.

---

## License

MIT
