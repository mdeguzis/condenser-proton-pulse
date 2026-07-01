// Standalone UI component replacements for @decky/ui.
//
// On dev-next these are imported instead of @decky/ui so the plugin renders
// in a plain Chromium window (gamescope kiosk) with no Decky Loader present.
// Components match the props surface used in the codebase -- unused props are
// accepted but silently ignored so call sites need no changes.

export { Button as DialogButton } from './Button';
export { Modal as ModalRoot } from './Modal';
export { Focusable } from './Focusable';
export { Field, ToggleField, SliderField, TextField } from './Fields';
export { SidebarNavigation } from './SidebarNavigation';
export { Dropdown, DropdownItem } from './Dropdown';
export { Spinner as SteamSpinner } from './Spinner';

// Re-export showModal from the platform layer so call sites stay identical.
export { showModal } from './showModal';
