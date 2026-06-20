# yt-transcript-distiller — Working Guide

smoochy's fork of [michaelruck/yt-transcript-distiller](https://github.com/michaelruck/yt-transcript-distiller).

Adds: multi-provider AI (Gemini, OpenAI, OpenRouter, Anthropic), optional comment posting, GitHub repo export, tabbed settings UI, and auto-versioned GitHub Releases.

## Branch Layout

| Branch | Purpose |
|--------|---------|
| `main` | Mirrors upstream (`michaelruck/yt-transcript-distiller`) exactly. Never commit directly. |
| `smoochy/composite` | Auto-maintained: upstream main + all open smoochy PRs rebased on top. Never commit directly. |
| `claude/*` | Feature work. Branch from `main`, PR to `main`. |

## Information Flow

```
upstream (michaelruck/yt-transcript-distiller)
    ↓  sync.yml (Mon 03:00 UTC, fast-forward merge)
  main
    ↓  composite-rebase.yml (triggered by upstream-synced dispatch)
  smoochy/composite
    ↓  build.yml (push trigger)
  GitHub Release (auto-tagged, .zip artifact)
```

## Versioning Scheme

- `package.json` `version` mirrors upstream exactly (set by upstream sync via `main`)
- Release tags:
  - `v{upstream-version}` — no smoochy commits on `smoochy/composite` above `main`
  - `v{upstream-version}-smoochy-v{N}` — smoochy commits exist; N = max existing tag + 1, resets on upstream bump
- Tags and releases are created automatically by `build.yml` — **do not push `v*` tags manually**

## Feature Development Workflow

1. `git switch -c claude/<topic>` from `main`
2. Implement + tests + build (`node build.js`)
3. PR to `main`
4. After merge → `composite-rebase.yml` auto-rebases `smoochy/composite` → `build.yml` auto-releases

## Build & Test

```bash
node build.js                          # build → web-ext-artifacts/*.zip
node --experimental-vm-modules node_modules/jest/bin/jest.js   # run tests
```

## Key Architectural Notes

- **MV2 Firefox extension** — all host URL patterns in `permissions` array (not `host_permissions`)
- **Storage** — all settings in `chrome.storage.local`, never `.sync`
- **ESM** — `"type": "module"` in package.json; no `require()`
- **Provider interface** — `src/providers/BaseProvider.summarize(transcript, prompt, options?)` → `string`
- **Providers** — `GeminiProvider`, `AnthropicProvider`, `OpenAICompatProvider` (openai + openrouter)
- **Model list cache** — `resolveModel()` in `src/model-list.js`; `fetchAnthropicModels()` in `src/anthropic-model-list.js`
- **chrome.storage.local.get** — always use array form: `get(['key'])`, not `get('key')` (jest-webextension-mock bug with string form)
- **Anthropic model list** — fetched from `raw.githubusercontent.com/smoochy/openrouter-model-list/main/anthropic-models.json`, 48h cache
- **OpenRouter custom model** — validated against `https://openrouter.ai/api/v1/models` on save; takes priority over dropdown model URL
