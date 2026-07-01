// Version + build identity. Baked at build time by esbuild `define`
// (see condenser/scripts/build.mjs) so the values are correct after the plugin
// is installed to ~/.condenser/plugins where the source tree is not present.

declare const __PLUGIN_VERSION__: string;
declare const __BUILD_COMMIT__: string;

export async function get_plugin_version(): Promise<string> {
  return typeof __PLUGIN_VERSION__ === 'string' ? __PLUGIN_VERSION__ : 'unknown';
}

export async function get_build_commit(): Promise<string> {
  return typeof __BUILD_COMMIT__ === 'string' ? __BUILD_COMMIT__ : 'dev';
}
