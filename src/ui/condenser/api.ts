// Condenser binding for @decky/api.
//
// esbuild aliases '@decky/api' to this module on the condenser build, so existing
// call sites (callable/toaster/fetchNoCors/...) compile unchanged and route through
// the platform layer instead of Decky. See milestone #3 (issue #100).

import { platform, type ToastOptions } from '../../lib/platform';

// Decky's callable(name) returns a function taking positional args. We forward to
// the Node backend via platform().call. Single-object args pass through as-is;
// multiple positional args are wrapped as { args }. Backend actions (#101) must
// accept the matching shape.
export function callable<Args extends unknown[] = unknown[], Ret = unknown>(name: string) {
  return (...args: Args): Promise<Ret> => {
    const data = args.length === 1 && typeof args[0] === 'object' && args[0] !== null
      ? (args[0] as Record<string, unknown>)
      : { args };
    return platform().call<Ret>(name, data);
  };
}

export interface DeckyToastArgs {
  title?: string;
  body?: string;
  duration?: number;
  critical?: boolean;
}

export const toaster = {
  toast(args: DeckyToastArgs): void {
    const opts: ToastOptions = { title: args.title, duration: args.duration, critical: args.critical };
    platform().toast(args.body ?? args.title ?? '', opts);
  },
};

// Decky fetchNoCors returns a Response-like; our platform returns { status, body }.
// Wrap it so existing `.status` / `.text()` / `.json()` call sites keep working.
export async function fetchNoCors(url: string, init?: RequestInit) {
  const { status, body } = await platform().fetchNoCors(url, init);
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => body,
    json: async () => JSON.parse(body),
  };
}

// File picker has no condenser equivalent yet; stubbed until the backend port (#101).
export enum FileSelectionType {
  FILE = 0,
  FOLDER = 1,
}

export async function openFilePicker(..._args: unknown[]): Promise<{ path: string } | null> {
  platform().toast('File picker is not available on Condenser yet', { critical: true });
  return null;
}
