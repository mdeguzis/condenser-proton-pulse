import os from 'os';
import fs from 'fs';
import path from 'path';

// Minimal file logger for the condenser backend. The frontend logger
// (src/lib/logger.ts) posts events through log_frontend_event; get_log_contents
// reads them back for the Logs tab. Condenser has no logging API, so this is a
// plain file under the plugin data dir.

const LOG_DIR = path.join(os.homedir(), '.condenser', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'proton-pulse.log');
const LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR'] as const;
let minLevel = 0; // index into LEVELS

function ensureDir() {
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch { /* noop */ }
}

export async function log_frontend_event(data: { level?: string; message?: string; context?: unknown }) {
  const level = (data?.level ?? 'INFO').toUpperCase();
  if (LEVELS.indexOf(level as typeof LEVELS[number]) < minLevel) return { ok: true };
  ensureDir();
  const ctx = data?.context ? ` | ${JSON.stringify(data.context)}` : '';
  const line = `[${new Date().toISOString()}][${level}]: [frontend] ${data?.message ?? ''}${ctx}\n`;
  try { fs.appendFileSync(LOG_FILE, line); } catch { /* noop */ }
  return { ok: true };
}

export async function get_log_contents() {
  try {
    return fs.readFileSync(LOG_FILE, 'utf8');
  } catch {
    return '';
  }
}

export async function set_log_level(data: { level?: string }) {
  const idx = LEVELS.indexOf((data?.level ?? 'DEBUG').toUpperCase() as typeof LEVELS[number]);
  if (idx >= 0) minLevel = idx;
  return { ok: true, level: LEVELS[minLevel] };
}
