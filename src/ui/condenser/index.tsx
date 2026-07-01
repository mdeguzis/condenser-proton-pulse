// Condenser binding for @decky/ui.
//
// esbuild aliases '@decky/ui' to this module on the condenser build, so every
// existing tab and modal compiles unchanged. Primitives that condenser provides
// (Focusable, Menu, showContextMenu) come from the global condenser.ui for real
// Steam gamepad behavior; the rest reuse our standalone src/ui components or get
// lightweight implementations here. See milestone #3 (issue #99).

import React from 'react';
import { platform } from '../../lib/platform';

// Reuse the standalone, platform-agnostic components.
export { Button as DialogButton } from '../Button';
export { Modal as ModalRoot } from '../Modal';
export { Field, ToggleField, SliderField, TextField } from '../Fields';
export { Dropdown, DropdownItem } from '../Dropdown';
export { SidebarNavigation } from '../SidebarNavigation';
export { Spinner as SteamSpinner } from '../Spinner';
export { showModal } from '../showModal';

// Minimal shape of condenser.ui we lean on. Resolved at runtime from the global.
interface CondenserUI {
  Focusable: (props: Record<string, unknown>) => React.ReactNode;
  Menu: (props: { label: string; children?: React.ReactNode }) => React.ReactNode;
  MenuItem: (props: { onClick?: () => void; children?: React.ReactNode }) => React.ReactNode;
  showContextMenu(children: React.ReactNode, parent?: EventTarget): void;
}
interface CondenserNav { navigate(path: string): void; back(): void; }
declare const condenser: { ui: CondenserUI; nav: CondenserNav };

// Real Steam components for gamepad-correct behavior.
export const Focusable = condenser.ui.Focusable;
export const Menu = condenser.ui.Menu;
export const MenuItem = condenser.ui.MenuItem;
export const showContextMenu = condenser.ui.showContextMenu;

// Navigation/Router map onto condenser.nav.
export const Navigation = {
  Navigate: (path: string) => condenser.nav.navigate(path),
  NavigateBack: () => condenser.nav.back(),
  NavigateToExternalWeb: (url: string) => { try { window.open(url, '_blank'); } catch { /* noop */ } },
};
export const Router = Navigation;

// ---- Lightweight implementations of components condenser does not ship ----

export function PanelSection({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div style={{ padding: '8px 0' }}>
      {title && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#7a9bb5', padding: '0 16px 6px', textTransform: 'uppercase' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function PanelSectionRow({ children }: { children?: React.ReactNode }) {
  return <div style={{ padding: '4px 16px' }}>{children}</div>;
}

export function ButtonItem({ label, children, onClick, disabled }: { label?: string; children?: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(102,192,244,0.2)', borderRadius: 4, color: '#e8f4ff', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      {children ?? label}
    </button>
  );
}

export function DialogCheckbox({ label, checked, onChange }: { label?: string; checked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', cursor: 'pointer', color: '#c8dcea', fontSize: 13 }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} style={{ accentColor: '#66c0f4' }} />
      {label}
    </label>
  );
}

export function ConfirmModal(props: {
  strTitle?: string;
  strDescription?: React.ReactNode;
  strOKButtonText?: string;
  strCancelButtonText?: string;
  onOK?: () => void;
  onCancel?: () => void;
  closeModal?: () => void;
  children?: React.ReactNode;
}) {
  const close = props.closeModal ?? (() => {});
  return (
    <ModalRoot onCancel={() => { props.onCancel?.(); close(); }}>
      <div style={{ padding: 20, minWidth: 360, color: '#e8f4ff' }}>
        {props.strTitle && <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{props.strTitle}</div>}
        {props.strDescription && <div style={{ fontSize: 13, color: '#c8dcea', marginBottom: 16 }}>{props.strDescription}</div>}
        {props.children}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={() => { props.onCancel?.(); close(); }} style={{ padding: '6px 14px' }}>{props.strCancelButtonText ?? 'Cancel'}</button>
          <button onClick={() => { props.onOK?.(); close(); }} style={{ padding: '6px 14px', background: '#1a9fff', border: 'none', borderRadius: 4, color: 'white' }}>{props.strOKButtonText ?? 'OK'}</button>
        </div>
      </div>
    </ModalRoot>
  );
}

// ---- Behavioral helpers with no condenser equivalent yet (issue #99 follow-ups) ----

export function Carousel({ children }: { children?: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>{children}</div>;
}

// Decky monkey-patches a component's render. Condenser exposes condenser.tree for
// fiber patching; until that is wired, Patch is a no-op that returns an unpatcher
// so call sites do not crash.
export function Patch(): { unpatch: () => void } {
  return { unpatch: () => {} };
}

export const GamepadButton = {
  OK: 'OK', CANCEL: 'CANCEL', SECONDARY: 'SECONDARY', OPTIONS: 'OPTIONS',
  DIR_UP: 'DIR_UP', DIR_DOWN: 'DIR_DOWN', DIR_LEFT: 'DIR_LEFT', DIR_RIGHT: 'DIR_RIGHT',
} as const;

export interface GamepadEvent { detail: { button: number } }

// Re-export so `import { platform } from '@decky/ui'` style helpers still resolve
// if any internal module reaches for it.
export { platform };
