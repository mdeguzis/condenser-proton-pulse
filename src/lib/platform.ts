// Platform abstraction layer.
//
// All Decky-specific APIs (callable, fetchNoCors, toaster, showModal) are
// accessed through this module. On the dev-next branch the implementations
// swap to HTTP + custom UI so the rest of the codebase is unchanged.
//
// Usage:
//   import { platform } from '../lib/platform';
//   await platform.call('get_system_info');
//   await platform.fetchNoCors('https://...');
//   platform.toast('hello');
//   platform.showModal(<MyModal />);

import type React from 'react';

export interface ToastOptions {
  title?: string;
  duration?: number;
  critical?: boolean;
  eType?: number;
}

export interface Platform {
  // Backend callable -- maps to Decky callable() or HTTP POST /call/<name>
  call<T = unknown>(name: string, args?: Record<string, unknown>): Promise<T>;

  // CORS-bypassing fetch -- maps to Decky fetchNoCors or a local proxy route
  fetchNoCors(url: string, init?: RequestInit): Promise<{ status: number; body: string }>;

  // Toast notification
  toast(message: string, opts?: ToastOptions): void;

  // Modal -- accepts a React element; renders via Decky showModal or custom portal
  showModal(element: React.ReactElement): { Close(): void } | void;

  // Focused Steam app ID (0 when on the home screen)
  getFocusedAppId(): Promise<number>;

  // Whether we are running inside Decky Loader
  isDecky: boolean;
}

// Active platform -- set once at startup by calling initPlatform().
let _platform: Platform | null = null;

export function initPlatform(impl: Platform): void {
  _platform = impl;
}

export function platform(): Platform {
  if (!_platform) {
    throw new Error('platform() called before initPlatform()');
  }
  return _platform;
}
