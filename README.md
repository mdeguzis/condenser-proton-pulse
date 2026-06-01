# condenser-plugin

Template repository for building [Condenser](https://github.com/condenser-team/condenser-app) plugins. Fork or use this as a GitHub template to create your own plugin.

## What is Condenser?

Condenser customizes Steam Big Picture Mode and SteamOS using plugins, on any platform (Windows, macOS, Linux, Steam Deck). Plugins are small React + Node.js modules injected into Steam's browser UI.

## Prerequisites

- **Node.js 24 LTS** — required by condenser-app and this template (`nvm use 24` or [nodejs.org](https://nodejs.org))

## Getting started

### 1. Clone this repo alongside condenser-app

```bash
git clone https://github.com/condenser-team/condenser-app
git clone https://github.com/your-username/my-plugin
```

Both repos must be siblings in the same parent directory so the dev script can find condenser-app automatically.

### 2. Install dependencies

```bash
cd my-plugin
npm install
```

### 3. Rename your plugin

Edit `package.json` and set `name` to your plugin's slug (e.g. `my-plugin`). Then update `frontend.tsx`:

```ts
export const key   = 'my-plugin';   // must match the package name and directory name
export const title = 'My Plugin';
export const route = '/my-plugin/home';
```

### 4. Start development

```bash
npm run dev
```

This finds `condenser-app` in the sibling directory and starts the condenser-app dev server with your plugin loaded and hot-reloaded automatically. The plugin repo must be a sibling of `condenser-app` so the directory name is used as the plugin ID — make sure it matches the `key` export in `frontend.tsx`.

If condenser-app is not a sibling, set the path explicitly:

```bash
CONDENSER_APP_PATH=/path/to/condenser-app npm run dev
```

## Plugin structure

```
my-plugin/
├── frontend.tsx    # React UI injected into Steam's Big Picture Mode
├── backend.ts      # Node.js backend — exports become RPC actions
├── shims/          # Runtime bridges (condenser:api, react) used for release builds
├── types/          # TypeScript declarations for condenser:api
└── scripts/
    ├── dev.mjs     # Starts condenser-app with this plugin loaded
    └── build.mjs   # Standalone production build (used by release workflow)
```

### Frontend surfaces

Export any combination of these from `frontend.tsx`:

| Export | Description |
|---|---|
| `Page` | Full-screen page opened from the BPM home screen |
| `Tab` | Icon shown in Steam's quick-access tab bar |
| `Panel` | Content inside the quick-access panel |
| `Persistent` | Always-visible overlay rendered on every screen |

### Backend actions

Every exported `async function` in `backend.ts` becomes a callable action. Call them from the frontend with `useSend`:

```ts
// frontend.tsx
const send = useSend('my-plugin');
const result = await send('myAction', { value: 42 });

// backend.ts
export async function myAction(data: { value: number }) {
  return { result: data.value * 2 };
}
```

### Lifecycle hooks

```ts
// backend.ts
export async function onLoad(api: BackendAPI) {
  // called when the plugin is loaded — start timers, open connections, etc.
}

export async function onUnload() {
  // called when condenser shuts down
}
```

## Publishing a release

### 1. Build locally (optional check)

```bash
npm run build
# produces dist/frontend.js and dist/backend.mjs
```

### 2. Tag and push

```bash
npm version minor    # or patch / major
git push origin --tags
```

The GitHub Actions release workflow (`.github/workflows/release.yml`) will:
1. Build the plugin
2. Create a `.zip` containing `frontend.js` and `backend.mjs`
3. Compute a SHA256 of the zip
4. Publish a GitHub Release with the zip attached
5. Print the exact YAML snippet to paste into your registry submission

### 3. Submit to the registry

Open a pull request to [condenser-registry](https://github.com/condenser-team/condenser-registry) adding your plugin under `resources/plugins/your-plugin/`. Use the YAML snippet printed in the release notes and follow the PR template checklist.

Once a maintainer merges your PR, your plugin appears in the Condenser plugin browser and can be installed by any user.

## condenser:api reference

See [`types/condenser-api.d.ts`](types/condenser-api.d.ts) for the full typed API surface including navigation, toasts, modals, context menus, and Steam UI components (`Focusable`, `Tabs`, `SidebarNavigation`).

## License

MIT
