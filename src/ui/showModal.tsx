import React from 'react';
import { platform } from '../lib/platform';

// Drop-in for @decky/ui showModal -- routes to platform layer so call sites
// need no changes when switching between Decky and standalone builds.
export function showModal(element: React.ReactElement): { Close(): void } | void {
  return platform().showModal(element);
}
