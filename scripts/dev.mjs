#!/usr/bin/env node
/**
 * Finds condenser-app and starts its dev server with this plugin directory
 * injected via CONDENSER_PLUGINS_DIR, giving you full Vite HMR.
 *
 * Resolution order for condenser-app:
 *   1. CONDENSER_APP_PATH env var (absolute or relative path)
 *   2. ../condenser-app  (sibling directory — default when both repos are cloned together)
 *   3. Walk up 4 levels looking for a condenser-app sibling at each level
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.resolve(__dirname, '..');
// condenser-app expects a directory that *contains* plugin subdirectories (same
// convention as condenser-app/plugins/).  The plugin repo itself IS one plugin,
// so we pass its parent directory so the loader finds <parent>/<repo-name>/.
const pluginsParentDir = path.dirname(pluginDir);

function findCondenserApp() {
  if (process.env.CONDENSER_APP_PATH) {
    const p = path.resolve(process.env.CONDENSER_APP_PATH);
    if (existsSync(path.join(p, 'package.json'))) return p;
    throw new Error(`CONDENSER_APP_PATH is set but no package.json found at: ${p}`);
  }

  let dir = pluginDir;
  for (let i = 0; i < 5; i++) {
    dir = path.dirname(dir);
    const candidate = path.join(dir, 'condenser-app');
    if (existsSync(path.join(candidate, 'package.json'))) return candidate;
  }

  throw new Error(
    'Could not find condenser-app.\n' +
    'Either clone it as a sibling directory, or set CONDENSER_APP_PATH=/path/to/condenser-app',
  );
}

const appDir = findCondenserApp();
console.log(`[condenser-dev] app:    ${appDir}`);
console.log(`[condenser-dev] plugin: ${pluginDir}`);
console.log(`[condenser-dev] dir:    ${pluginsParentDir}`);
console.log('');

execSync('npm run dev', {
  cwd: appDir,
  stdio: 'inherit',
  env: { ...process.env, CONDENSER_PLUGINS_DIR: pluginsParentDir },
});
