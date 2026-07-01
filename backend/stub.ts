// Actions not yet ported to the condenser Node backend. Grouped by why they are
// deferred so issue #101 has a clear remaining-work map. Each returns a structured
// result instead of throwing, so the frontend degrades gracefully.

function notImplemented(action: string, reason: string) {
  return async () => ({ ok: false, notImplemented: true, action, reason });
}

// Self-updater: Condenser updates plugins through its own registry
// (condenser-manager), so the Decky self-updater actions do not apply here.
const REASON_UPDATER = 'Condenser manages plugin updates via its registry';
export const check_for_update = notImplemented('check_for_update', REASON_UPDATER);
export const get_update_status = notImplemented('get_update_status', REASON_UPDATER);
export const apply_update = notImplemented('apply_update', REASON_UPDATER);
export const cancel_update = notImplemented('cancel_update', REASON_UPDATER);
export const restart_plugin_loader = notImplemented('restart_plugin_loader', 'Condenser has its own loader lifecycle');

// Local OS installers: large, platform-specific Python ports (fs/exec/tar). These
// stay local work; tracked for the backend-port follow-ups.
const REASON_LOCAL = 'OS installer not ported to Node yet';
export const install_compatibility_tool_archive = notImplemented('install_compatibility_tool_archive', REASON_LOCAL);
export const uninstall_compatibility_tool = notImplemented('uninstall_compatibility_tool', REASON_LOCAL);
export const check_proton_version_availability = notImplemented('check_proton_version_availability', REASON_LOCAL);
export const get_proton_ge_manager_state = notImplemented('get_proton_ge_manager_state', REASON_LOCAL);
export const cancel_proton_ge_install = notImplemented('cancel_proton_ge_install', REASON_LOCAL);
export const is_lsfg_vk_available = notImplemented('is_lsfg_vk_available', REASON_LOCAL);
export const get_lsfg_vk_manager_state = notImplemented('get_lsfg_vk_manager_state', REASON_LOCAL);
export const cancel_lsfg_vk_install = notImplemented('cancel_lsfg_vk_install', REASON_LOCAL);
export const uninstall_lsfg_vk = notImplemented('uninstall_lsfg_vk', REASON_LOCAL);

// Steam library / shortcut data: needs the CDP or webpack-backed library scan
// (condenser.steam) wired through the backend. Deferred.
const REASON_LIBRARY = 'Steam library scan not wired on condenser yet';
export const get_game_source = notImplemented('get_game_source', REASON_LIBRARY);
export const get_game_platforms = notImplemented('get_game_platforms', REASON_LIBRARY);
export const get_grid_artwork = notImplemented('get_grid_artwork', REASON_LIBRARY);
export const get_shortcut_name = notImplemented('get_shortcut_name', REASON_LIBRARY);

// CEF debugging toggle: Condenser already runs Steam with CDP enabled.
const REASON_CEF = 'Condenser runs with CDP debugging enabled by design';
export const get_cef_debugging_status = notImplemented('get_cef_debugging_status', REASON_CEF);
export const set_cef_debugging_enabled = notImplemented('set_cef_debugging_enabled', REASON_CEF);

// Misc, easy to port later.
export const export_metrics = notImplemented('export_metrics', 'metrics export not ported yet');
export const get_game_requirements = notImplemented('get_game_requirements', 'requirements fetch not ported yet');
