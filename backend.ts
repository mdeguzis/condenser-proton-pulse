import os from 'os';
import { CdpSession } from '../condenser-app/shared/cdp.js';

// Each exported async function becomes a callable action from your frontend via useSend().
// The function name is the action name: send('getInfo') calls getInfo() here.

// Optional lifecycle hooks:
// export async function onLoad(api: import('../condenser-app/shared/plugin').BackendAPI) {}
// export async function onUnload() {}

let clickCount = 0;

// ---- Store CDP injection ----
// The Steam Store (store.steampowered.com) is a separate CEF process at a different
// origin — JavaScript in SharedJSContext cannot access its document. We reach it
// directly via CDP from the Node.js backend instead.
//
// Because the Store window hides the BPM window (and therefore the condenser plugin
// UI), we support a "pending" mode: the user enables the toggle in BPM, then opens
// the Store — the backend polls for the CDP target and injects automatically.

const STORE_STYLE_ID = 'condenser-plugin-store';
let _storeSession: CdpSession | null = null;
let _pendingCss: string | null = null;
let _pollTimer: ReturnType<typeof setInterval> | null = null;

async function connectStoreSession(): Promise<CdpSession | null> {
  if (_storeSession) return _storeSession;
  try {
    const res = await fetch('http://localhost:8080/json');
    const targets = await res.json() as { url: string; webSocketDebuggerUrl: string }[];
    const target = targets.find(t => t.url.includes('store.steampowered.com'));
    if (!target) return null;
    _storeSession = await CdpSession.connect(target.webSocketDebuggerUrl);
    _storeSession.onClose(() => {
      _storeSession = null;
      if (_pendingCss) startStorePoll();
    });
    // Re-inject on Store page navigation for this session (registered once per connection)
    await _storeSession.send('Page.setBypassCSP', { enabled: true });
    await _storeSession.send('Page.enable', {});
    _storeSession.on('Page.loadEventFired', () => { applyStoreCss(); });
    return _storeSession;
  } catch { return null; }
}

async function applyStoreCss(): Promise<boolean> {
  const css = _pendingCss;
  if (!css) return true;
  const session = await connectStoreSession();
  if (!session) return false;
  try {
    await session.send('Runtime.evaluate', {
      expression: `(() => {
        let el = document.getElementById(${JSON.stringify(STORE_STYLE_ID)});
        if (!el) { el = document.createElement('style'); el.id = ${JSON.stringify(STORE_STYLE_ID)}; document.head.appendChild(el); }
        el.textContent = ${JSON.stringify(css)};
      })()`,
      userGesture: true,
    });
    return true;
  } catch {
    _storeSession = null;
    return false;
  }
}

function startStorePoll() {
  if (_pollTimer) return;
  _pollTimer = setInterval(async () => {
    if (!_pendingCss) { stopStorePoll(); return; }
    const ok = await applyStoreCss();
    if (ok) stopStorePoll();
  }, 1000);
}

function stopStorePoll() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
}

export async function injectStoreCss({ css }: { css: string }) {
  _pendingCss = css;
  const ok = await applyStoreCss();
  if (!ok) startStorePoll();
}

export async function removeStoreCss() {
  _pendingCss = null;
  stopStorePoll();
  if (!_storeSession) return;
  try {
    await _storeSession.send('Runtime.evaluate', {
      expression: `(() => { document.getElementById(${JSON.stringify(STORE_STYLE_ID)})?.remove(); })()`,
      userGesture: true,
    });
  } catch { /* Store may have closed */ }
}

export async function getCount() {
  return { count: clickCount };
}

export async function click() {
  return { count: ++clickCount };
}

export async function getInfo() {
  return {
    platform: os.platform(),
    uptime: os.uptime(),
    memory: os.freemem(),
  };
}
