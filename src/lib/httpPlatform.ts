// Standalone HTTP platform implementation (dev-next / no Decky).
//
// Routes all backend calls to a local HTTP server (the same Python backend,
// run as a systemd service instead of being hosted by Decky Loader).
// Modal and toast rendering are handled by a lightweight DOM portal injected
// into the gamescope Chromium window at startup.

import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Platform, ToastOptions } from './platform';

const BASE_URL = 'http://localhost:49152';

// ---- toast ----------------------------------------------------------------

let _toastContainer: HTMLElement | null = null;

function getToastContainer(): HTMLElement {
  if (!_toastContainer) {
    _toastContainer = document.createElement('div');
    _toastContainer.id = 'pp-toast-container';
    Object.assign(_toastContainer.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    });
    document.body.appendChild(_toastContainer);
  }
  return _toastContainer;
}

function showToast(message: string, opts: ToastOptions): void {
  const el = document.createElement('div');
  Object.assign(el.style, {
    background: 'rgba(15,26,40,0.96)',
    border: '1px solid rgba(102,192,244,0.3)',
    borderRadius: '6px',
    padding: '10px 16px',
    color: '#e8f4ff',
    fontSize: '13px',
    maxWidth: '320px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    transition: 'opacity 0.3s',
  });
  if (opts.title) {
    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.marginBottom = '2px';
    title.textContent = opts.title;
    el.appendChild(title);
  }
  const body = document.createElement('div');
  body.textContent = message;
  el.appendChild(body);

  getToastContainer().appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, opts.duration ?? 3000);
}

// ---- modal ----------------------------------------------------------------

let _modalContainer: HTMLElement | null = null;

function getModalContainer(): HTMLElement {
  if (!_modalContainer) {
    _modalContainer = document.createElement('div');
    _modalContainer.id = 'pp-modal-container';
    Object.assign(_modalContainer.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '99998',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
    });
    document.body.appendChild(_modalContainer);
  }
  return _modalContainer;
}

// ---- platform impl --------------------------------------------------------

export const httpPlatform: Platform = {
  isDecky: false,

  async call<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}/call/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      throw new Error(`Backend call ${name} failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  },

  async fetchNoCors(url: string, init?: RequestInit): Promise<{ status: number; body: string }> {
    // Route through the local backend proxy to bypass CORS.
    const res = await fetch(`${BASE_URL}/proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, init }),
    });
    return res.json() as Promise<{ status: number; body: string }>;
  },

  toast(message: string, opts: ToastOptions = {}): void {
    showToast(message, opts);
  },

  showModal(element: React.ReactElement): { Close(): void } {
    const container = getModalContainer();
    container.style.display = 'flex';
    const root = createRoot(container);
    root.render(element);
    return {
      Close() {
        root.unmount();
        container.style.display = 'none';
      },
    };
  },

  async getFocusedAppId(): Promise<number> {
    try {
      const res = await fetch(`${BASE_URL}/focused-app`);
      const data = await res.json() as { appId: number };
      return data.appId ?? 0;
    } catch {
      return 0;
    }
  },
};
