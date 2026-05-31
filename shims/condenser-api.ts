// Runtime bridge: forwards condenser:api calls to window.__condenser.
// This file is used only for production builds (release zips).
// During development, condenser-app's Vite shim is used instead.

const g = () => (window as any).__condenser;
const reg = () => g()?.core?.webpackRegistry as Map<string, any> | undefined;

function findExport(test: (e: any) => boolean): any {
  const r = reg();
  if (!r) return null;
  for (const mod of r.values()) {
    for (const exp of Object.values(mod as object)) {
      if (test(exp)) return exp;
    }
  }
  return null;
}

// ---- Hooks ----

export function useSend(pluginId: string): (action: string, data?: unknown) => Promise<unknown> {
  return g().core.React!.useCallback(
    (action: string, data?: unknown) => g().plugins.callPlugin(pluginId, { action, data }),
    [pluginId],
  );
}

export function useMessage(pluginId: string, event: string, handler: (data: unknown) => void): void {
  g().core.React!.useEffect(
    () => g().plugins.onMessage(pluginId, event, handler),
    [pluginId, event, handler],
  );
}

// ---- Navigation ----

function getWin(): any {
  const router = g().core.router as any;
  return (window as any).SteamUIStore?.GetFocusedWindowInstance?.()
    ?? router?.WindowStore?.GamepadUIMainWindowInstance
    ?? router?.WindowStore?.SteamUIWindows?.[0];
}

export function navigate(path: string): void {
  getWin()?.Navigate?.(path);
  g().page.showPage(path);
}

export function back(): void {
  getWin()?.NavigateBack?.();
  g().page.closePage();
}

export function openQAM(): void   { getWin()?.MenuStore?.OpenQuickAccessMenu?.(); }
export function openSideMenu(): void { getWin()?.MenuStore?.OpenSideMenu?.(1); }
export function closeSideMenus(): void { getWin()?.MenuStore?.CloseSideMenus?.(); }

// ---- UI Components ----

let _focusable: any = null;
export function Focusable(props: any): any {
  if (!_focusable) {
    _focusable = findExport((e: any) => {
      const s = e?.toString?.() ?? e?.render?.toString?.() ?? '';
      return /flow-children/.test(s) && /onActivate/.test(s) && /focusClassName/.test(s);
    });
  }
  return g().core.React!.createElement(_focusable ?? 'div', props);
}

let _sidebarNavigation: any = null;
export function SidebarNavigation(props: any): any {
  if (!_sidebarNavigation) {
    _sidebarNavigation = findExport((e: any) =>
      typeof e === 'function' && /fnSetNavigateToPage/.test(e.toString?.() ?? ''),
    );
  }
  if (!_sidebarNavigation) return null;
  return g().core.React!.createElement(_sidebarNavigation, props);
}

let _Tabs: any = null;
export function Tabs(props: any): any {
  if (!_Tabs) {
    const r = reg();
    if (r) {
      for (const mod of r.values()) {
        const match = Object.values(mod as object).find(
          (e: any) => e?.toString?.().includes('.TabRowTabs') && e?.toString?.().includes('activeTab:'),
        );
        if (match) { _Tabs = match; break; }
      }
    }
  }
  if (!_Tabs) return null;
  return g().core.React!.createElement(_Tabs, props);
}

// ---- Imperatives ----

export interface ToastOptions { title: string; body?: string; duration?: number; logo?: string; }

export function showToast(options: ToastOptions): void {
  g()?.core?.showToast?.(options);
}

export function showModal(content: any, _parent?: EventTarget, options?: { strTitle?: string }): void {
  const handler = g()?.core?.showModal;
  if (!handler) { console.warn('[condenser] showModal: no handler registered'); return; }
  handler(content, options?.strTitle);
}

let _showContextMenuRaw: any = null;
export function showContextMenu(children: any, parent?: EventTarget): void {
  if (!_showContextMenuRaw) {
    _showContextMenuRaw = findExport((e: any) =>
      typeof e === 'function' &&
      e.toString().includes('GetContextMenuManagerFromWindow') &&
      e.toString().includes('CreateContextMenuInstance'),
    );
  }
  if (!_showContextMenuRaw) return;
  try { _showContextMenuRaw(children, parent ?? window); } catch {}
}

// ---- Menu Components ----

let _Menu: any = null;
export function Menu(props: any): any {
  if (!_Menu) {
    _Menu = findExport((e: any) => e?.prototype?.HideIfSubmenu && e?.prototype?.HideMenu)
      ?? findExport((e: any) => typeof e === 'function' && e.toString?.().includes('useId') && e.toString?.().includes('labelId'));
  }
  if (!_Menu) return null;
  return g().core.React!.createElement(_Menu, props);
}

let _MenuItem: any = null;
export function MenuItem(props: any): any {
  if (!_MenuItem) {
    _MenuItem = findExport((e: any) =>
      e?.render?.toString?.().includes('bPlayAudio:') ||
      (e?.prototype?.OnOKButton && e?.prototype?.OnMouseEnter),
    );
  }
  if (!_MenuItem) return null;
  return g().core.React!.createElement(_MenuItem, props);
}

// ---- Events ----

export const UIMode = { BPM: 0, Desktop: 1 };
export type UIModeValue = number;
export function getUIMode(): UIModeValue { return g()?.core?.uiMode ?? 0; }
export function onUIModeChanged(handler: (mode: UIModeValue) => void): () => void {
  return g()?.core?.onUIModeChanged?.(handler) ?? (() => {});
}
export function useQAMVisible(): boolean {
  return g()?.core?.React!.useState(false)[0] ?? false;
}

// ---- Tree Patching (advanced) ----

export type NodeStep = { type: string; props?: Record<string, unknown> };
export type PatchHandler = (node: any) => any;
export function createReactTreePatcher(steps: NodeStep[], handler: PatchHandler) {
  return (tree: any) => tree;
}
