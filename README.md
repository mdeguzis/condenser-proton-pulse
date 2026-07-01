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

## Build

Requires Node 24 LTS and the [`condenser-app`](https://github.com/condenser-team/condenser-app) repo cloned as a sibling.

```bash
npm install
npm run dev       # loads into condenser-app dev server with hot reload
npm run build     # produces dist/frontend.js + dist/backend.mjs
```

## Parity with the Decky plugin

Shared code under `src/lib/` is kept in sync with `mdeguzis/decky-proton-pulse` `dev` branch. When plugin logic changes there, the same edits land here. Platform-touching call sites (`@decky/api` / `@decky/ui`) get rewritten to their Condenser equivalents via the shim layer.
