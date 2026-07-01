// Condenser backend for Proton Pulse.
//
// Each exported async function is an RPC action callable from the frontend via
// condenser.plugins.callPlugin('proton-pulse', { action, data }) -- which is what
// platform().call (src/lib/condenserPlatform.ts) sends. The whole backend bundles
// to a single backend.mjs.
//
// This replaces the Python backend (main.py + lib/*.py) from the Decky repo.
// Network and system actions are ported here (Node fetch has no CORS limit);
// the OS installers (proton-ge, compat tools, lsfg) and Steam library scan
// are still stubbed -- see backend/stub.ts.

// ---- Ported actions ----
export { get_system_info, get_protondb_systeminfo, copy_to_clipboard } from './backend/system.js';
export { get_plugin_version, get_build_commit } from './backend/version.js';
export { log_frontend_event, get_log_contents, set_log_level } from './backend/logging.js';
export { fetchProxy, getProtonDbSummary } from './backend/net.js';

// ---- Not yet ported (structured stubs, grouped by reason) ----
export {
  check_for_update, get_update_status, apply_update, cancel_update, restart_plugin_loader,
  install_compatibility_tool_archive, uninstall_compatibility_tool, check_proton_version_availability,
  get_proton_ge_manager_state, cancel_proton_ge_install,
  is_lsfg_vk_available, get_lsfg_vk_manager_state, cancel_lsfg_vk_install, uninstall_lsfg_vk,
  get_game_source, get_game_platforms, get_grid_artwork, get_shortcut_name,
  get_cef_debugging_status, set_cef_debugging_enabled,
  export_metrics, get_game_requirements,
} from './backend/stub.js';

// ---- Debug / platform helpers ----
export async function ping(data: { at?: number } = {}) {
  return { pong: true, at: data.at ?? null, serverTime: Date.now() };
}

// Focused Steam app id. Stubbed until the library-scan port wires the real source
// (CDP/webpack). Home screen = 0.
export async function getFocusedAppId() {
  return { appId: 0 };
}
