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

> **Note:** This is a minimal extraction from pi-free. Some features may be simplified compared to the full implementation.

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

## Notes

This is a minimal extraction of the Kilo provider from the [pi-free](https://github.com/apmantza/pi-free) project.
Some features may be simplified compared to the full implementation in pi-free.

For the full-featured version with additional providers and features, check out the complete pi-free project.
