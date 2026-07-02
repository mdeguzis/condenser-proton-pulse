# condenser-proton-pulse

Condenser port of the [decky-proton-pulse](https://github.com/mdeguzis/decky-proton-pulse) plugin.

This repo tracks the [Condenser](https://github.com/condenser-team/condenser-app) build. The Decky build (Python backend, `@decky/api`/`@decky/ui`) lives in the sibling repo and is the source of truth for shared business logic under `src/lib/`. Changes to plugin logic there get mirrored here.

## Status

Port scaffolding is in place. Ported so far:

- Platform abstraction (`src/lib/platform.ts`, `src/lib/condenserPlatform.ts`, `src/lib/httpPlatform.ts`)
- UI shims mapping `@decky/ui` to Condenser primitives (`src/ui/*`)
- Backend actions for system info, network fetch, logging, version (`backend/*.ts`)
- Stubs for the not-yet-ported OS installers and Steam library scan (`backend/stub.ts`)

Frontend UI, Steam library scan, and OS installers are not wired up yet.

## Layout

```
frontend.tsx        Bootstraps the plugin UI (in progress)
backend.ts          Root RPC exports; imports from backend/
backend/
  system.ts         Ported get_system_info, protondb systeminfo, clipboard
  net.ts            Ported fetchProxy, getProtonDbSummary
  logging.ts        Ported frontend log ingest
  version.ts        Ported get_plugin_version, get_build_commit
  stub.ts           Grouped stubs for the not-yet-ported actions
src/lib/
  platform.ts       Platform interface used by shared code
  condenserPlatform.ts  Condenser impl of the interface
  httpPlatform.ts   Node fetch helpers
src/ui/             UI primitives that map @decky/ui -> condenser.ui
```

## Getting started

### Prerequisites

- **Node 24 LTS** (`nvm use 24` or install from nodejs.org)
- A local clone of [`condenser-app`](https://github.com/condenser-team/condenser-app) — the runtime the plugin loads into

### 1. Clone condenser-app

The dev script auto-discovers `condenser-app` when it's a sibling directory of this repo. That's the simplest layout:

```bash
cd ~/src/decky-proton-pulse-project
git clone https://github.com/condenser-team/condenser-app
```

Result:

```
decky-proton-pulse-project/
  condenser-app/            <- the runtime
  condenser-proton-pulse/   <- this repo
```

Prefer a different location? Set `CONDENSER_APP_PATH=/absolute/or/relative/path/to/condenser-app` before running `npm run dev`.

### 2. Install dependencies

```bash
cd condenser-proton-pulse
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

This starts the `condenser-app` dev server with this plugin auto-loaded and hot-reloaded on file save. The plugin registers under the key `condenser-proton-pulse` — the dev loader uses the containing directory name as the plugin ID, so `key` in `frontend.tsx` matches the repo directory. Human-facing title is still "Proton Pulse".

### 4. Build for release

```bash
npm run build
# dist/frontend.js + dist/backend.mjs
```

## Testing checklist

Before committing changes to shared logic (`src/lib/*`), run the same tests the Decky repo runs (once test harness lands here). Meanwhile, smoke-test manually:

1. `npm run dev` loads without errors and the plugin appears in the Condenser sidebar under **Proton Pulse**.
2. The ported backend actions round-trip: from the frontend call `platform().call('get_plugin_version', {})` and confirm the version string.
3. `npm run build` produces `dist/frontend.js` and `dist/backend.mjs` with no esbuild warnings.

## Troubleshooting

- **`Could not find condenser-app`**: sibling clone is missing, or `CONDENSER_APP_PATH` points at the wrong directory. Point at the `condenser-app` repo root (the one containing its `package.json`), not a subdirectory.
- **`npm run dev` fails with a Node version error**: your active Node is < 24. `nvm use 24` or install Node 24 LTS.
- **Plugin doesn't appear in the sidebar**: check the `key` export in `frontend.tsx` matches the directory name of this repo (`proton-pulse` here). Rename the directory or the export if they diverge.

## Parity with the Decky plugin

Shared code under `src/lib/` is kept in sync with `mdeguzis/decky-proton-pulse` `dev` branch. When plugin logic changes there, the same edits land here. Platform-touching call sites (`@decky/api` / `@decky/ui`) get rewritten to their Condenser equivalents via the shim layer.
