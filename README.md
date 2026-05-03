# Kilo Provider Extension (MINIMAL)

A minimal Pi extension that provides access to Kilo AI models via the Kilo Gateway (OpenRouter-compatible).

**This extension is extracted (ripped out) from [pi-free](https://github.com/apmantza/pi-free).**

## Original Source

- Repository: https://github.com/apmantza/pi-free
- Original code location: `providers/kilo/`

## Features

- ✅ Access to 300+ AI models via Kilo
- ✅ OpenRouter-compatible API
- ✅ OAuth device authorization flow (`/login kilo`)
- ✅ Toggle between free/paid models (`/toggle-kilo`)
- ✅ Model status in status bar
- ✅ Automatic model fetching at startup

> **Note:** This is a minimal extraction from pi-free. Several features are simplified or removed — see details below.

## Installation

This extension is extracted from [pi-free](https://github.com/apmantza/pi-free). To use it:

Place this directory in one of Pi's extension directories:

- Global: `~/.pi/agent/extensions/dima/`
- Project-local: `.pi/extensions/dima/`

Or load it directly:

```bash
pi -e ./dima/index.ts
```

## Usage

- `/login kilo` - Login to Kilo for paid model access
- `/toggle-kilo` - Toggle between free-only and all models
- Models are automatically fetched at startup

## Structure

```
dima/
├── index.ts           # Main extension entry point (from pi-free/providers/kilo/)
├── kilo-auth.ts       # Authentication flow (from pi-free/providers/kilo/)
├── kilo-models.ts     # Model fetching (from pi-free/providers/kilo/)
├── provider-helper.ts # Provider registration helpers (extracted)
├── constants.ts       # Constants and logger (extracted)
├── registry.ts        # Model registry utilities (extracted)
├── util.ts           # Utility functions (extracted)
├── open-browser.ts   # Browser opening utility (extracted)
├── package.json      # Extension package config
└── README.md         # This file
```

## Environment Variables

- `KILO_API_KEY` - API key for Kilo (optional, for paid models)
- `KILO_API_URL` - Custom Kilo API URL (defaults to https://api.kilo.ai)

## What's Different from pi-free

This is a minimal extraction of the Kilo provider from the [pi-free](https://github.com/apmantza/pi-free) project. The following features are **not included** compared to the full pi-free implementation:

- **No additional providers** — pi-free includes Cline, NVIDIA, Ollama Cloud, ZenMux, CrofAI, and dynamic built-in provider toggles (Mistral, Groq, Cerebras, xAI, Hugging Face)
- **No global free-only toggle** (`/toggle-free`) — only per-provider `/toggle-kilo` is available
- **No `/free-providers` command** — the global provider overview is not included
- **No config persistence** — toggle state is not saved across sessions
- **No Coding Index model name enhancement** — model names are not annotated with benchmark scores
- **No automatic pricing detection** — the Route A/B heuristic for detecting whether a provider exposes real pricing is not included
- **No model size filtering** — the `isUsableModel` / `parseModelSize` utilities for filtering small models are not included
- **No shared fetch utilities** — `fetchWithTimeout`, `fetchWithRetry`, and `parseModelResponse` are not included; model fetching uses a simplified inline implementation
- **No `turn_end` error handling hooks** — provider-specific error handling on assistant errors is not wired up
- **No `setupProvider` helper** — the unified provider setup with automatic ToS notices, status bar, and toggle commands is replaced with manual inline registration
- **Hardcoded fallback models** — if model fetching fails, a single fallback model is returned instead of graceful degradation

For the full-featured version with all providers, global toggles, config persistence, and shared utilities, check out the complete [pi-free](https://github.com/apmantza/pi-free) project.
