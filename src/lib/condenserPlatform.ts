// Condenser implementation of the Platform interface (see platform.ts).
//
// Mirrors deckyPlatform.ts / httpPlatform.ts but binds to the global `condenser`
// namespace that condenser-app injects into Steam's SharedJSContext. Backend RPC
// goes through condenser.plugins.callPlugin (the non-hook form of useSend), so
// this works outside React. Tracked under milestone #3 (issue #100).

import type React from 'react';
import { type Platform, type ToastOptions } from './platform';

// Minimal shape of the condenser global we depend on. Kept local so src/ does not
// need the sibling condenser-app clone at typecheck time; the upstream-sync skill
// (#106) flags drift against the real CondenserNamespace.
interface CondenserGlobal {
  plugins: { callPlugin(pluginId: string, params?: unknown): Promise<unknown> };
  ui: {
    showToast(o: { title: string; body?: string; duration?: number; critical?: boolean }): void;
    showModal(content: unknown, parent?: EventTarget, options?: { strTitle?: string }): void;
  };
}

declare const condenser: CondenserGlobal;

const PLUGIN_ID = 'proton-pulse';

export const condenserPlatform: Platform = {
  isDecky: false,

  async call<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    return condenser.plugins.callPlugin(PLUGIN_ID, { action: name, data: args }) as Promise<T>;
  },

  // The frontend runs in Steam's CEF context where cross-origin fetch is blocked,
  // so route through the Node backend, which has no CORS limit. Backend exposes a
  // `fetchProxy` action (see condenser/backend.ts).
  async fetchNoCors(url: string, init: RequestInit = {}): Promise<{ status: number; body: string }> {
    return condenser.plugins.callPlugin(PLUGIN_ID, {
      action: 'fetchProxy',
      data: { url, method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body ?? null },
    }) as Promise<{ status: number; body: string }>;
  },

  toast(message: string, opts: ToastOptions = {}): void {
    condenser.ui.showToast({
      title: opts.title ?? 'Proton Pulse',
      body: message,
      duration: opts.duration,
      critical: opts.critical,
    });
  },

  showModal(element: React.ReactElement): { Close(): void } | void {
    // condenser.ui.showModal does not hand back a closer yet; modals self-close via
    // their own controls. Returning void keeps the Platform contract satisfied.
    condenser.ui.showModal(element, undefined, undefined);
  },

  async getFocusedAppId(): Promise<number> {
    // No direct helper in the condenser namespace yet; delegate to a backend action
    // once the library-scan port lands (#101). Home screen = 0 until then.
    try {
      const r = await condenser.plugins.callPlugin(PLUGIN_ID, { action: 'getFocusedAppId' }) as { appId?: number };
      return r?.appId ?? 0;
    } catch {
      return 0;
    }
  },
};
