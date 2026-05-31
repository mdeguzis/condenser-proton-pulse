/**
 * Type declarations for the condenser:api virtual module.
 * At runtime these are provided by condenser-app via Vite shims (dev) or
 * injected into Steam's CEF context (production).
 */
declare module 'condenser:api' {
  // ---- Hooks ----

  /** Returns a typed send function scoped to your plugin's backend. */
  export function useSend(pluginId: string): (action: string, data?: unknown) => Promise<unknown>;

  /** Subscribe to backend-pushed events from your plugin. */
  export function useMessage(pluginId: string, event: string, handler: (data: unknown) => void): void;

  // ---- Navigation ----

  export function navigate(path: string): void;
  export function back(): void;
  export function openQAM(): void;
  export function openSideMenu(): void;
  export function closeSideMenus(): void;

  // ---- Steam UI Components ----

  /** Gamepad-navigable wrapper — wraps content so controller d-pad works. */
  export function Focusable(props: Record<string, unknown>): any;

  /** Collapsible left-hand sidebar navigation for BPM pages. */
  export function SidebarNavigation(props: Record<string, unknown>): any;

  /**
   * Native Steam tab bar.
   * Props: { tabs, activeTab, onShowTab, autoFocusContents? }
   * Each tab: { id: string; title: string; content: ReactNode; renderTabAddon?: () => ReactNode }
   */
  export function Tabs(props: Record<string, unknown>): any;

  // ---- Imperative APIs ----

  export interface ToastOptions {
    title: string;
    body?: string;
    duration?: number;
    /** Path to an image shown alongside the toast. */
    logo?: string;
  }

  export function showToast(options: ToastOptions): void;

  export function showModal(
    content: any,
    parent?: EventTarget,
    options?: { strTitle?: string },
  ): void;

  export function showContextMenu(children: any, parent?: EventTarget): void;

  // ---- Menu Components (for use with showContextMenu) ----

  export function Menu(props: { label: string; children?: any }): any;
  export function MenuItem(props: { onClick?: () => void; children?: any }): any;

  // ---- Events ----

  export const UIMode: { BPM: number; Desktop: number };
  export type UIModeValue = number;
  export function getUIMode(): UIModeValue;
  export function onUIModeChanged(handler: (mode: UIModeValue) => void): () => void;
  export function useQAMVisible(): boolean;

  // ---- Tree Patching (advanced) ----

  export type NodeStep = { type: string; props?: Record<string, unknown> };
  export type PatchHandler = (node: any) => any;
  export function createReactTreePatcher(
    steps: NodeStep[],
    handler: PatchHandler,
  ): (tree: any) => any;
}
