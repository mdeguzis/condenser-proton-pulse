import os from 'os';
import fs from 'fs';
import { execFileSync } from 'child_process';

// System info for the condenser backend. Matches the SystemInfo shape the
// frontend expects (src/types.ts). Linux is the primary target; on Windows/macOS
// the Linux-only fields stay null. Every probe is best-effort and never throws.
// Needs on-device validation -- see issue #101.

function tryExec(cmd: string, args: string[]): string | null {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', timeout: 2000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function readFirst(path: string): string | null {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function distro(): string | null {
  const osRelease = readFirst('/etc/os-release');
  if (!osRelease) return null;
  const m = osRelease.match(/^PRETTY_NAME="?([^"\n]+)"?/m);
  return m ? m[1] : null;
}

function gpuInfo(): { gpu: string | null; vendor: string | null } {
  if (os.platform() !== 'linux') return { gpu: null, vendor: null };
  const out = tryExec('lspci', ['-mm']);
  if (!out) return { gpu: null, vendor: null };
  const line = out.split('\n').find((l) => /VGA|3D|Display/.test(l));
  if (!line) return { gpu: null, vendor: null };
  const lower = line.toLowerCase();
  const vendor = lower.includes('amd') || lower.includes('ati') ? 'amd'
    : lower.includes('nvidia') ? 'nvidia'
    : lower.includes('intel') ? 'intel'
    : null;
  return { gpu: line, vendor };
}

function steamDeckModel(): string | null {
  const board = readFirst('/sys/devices/virtual/dmi/id/product_name');
  if (!board) return null;
  const v = board.trim();
  if (v === 'Jupiter') return 'LCD';
  if (v === 'Galileo') return 'OLED';
  return null;
}

export async function get_system_info() {
  const { gpu, vendor } = gpuInfo();
  return {
    cpu: os.cpus()?.[0]?.model?.trim() ?? null,
    ram_gb: Math.round(os.totalmem() / 1024 / 1024 / 1024),
    gpu,
    gpu_vendor: vendor,
    driver_version: null,
    kernel: os.platform() === 'linux' ? (tryExec('uname', ['-r']) ?? os.release()) : os.release(),
    distro: distro(),
    proton_custom: null,
    vram_mb: null,
    cpu_cores: os.cpus()?.length ?? null,
    display_resolution: null,
    steam_deck_model: steamDeckModel(),
  };
}

// ProtonDB submission reuses the same probe.
export async function get_protondb_systeminfo() {
  return get_system_info();
}

export async function copy_to_clipboard(data: { text?: string }) {
  const text = data?.text ?? '';
  const platform = os.platform();
  const tools: Array<[string, string[]]> = platform === 'darwin'
    ? [['pbcopy', []]]
    : platform === 'win32'
      ? [['clip', []]]
      : [['wl-copy', []], ['xclip', ['-selection', 'clipboard']]];
  for (const [cmd, args] of tools) {
    try {
      execFileSync(cmd, args, { input: text, timeout: 2000, stdio: ['pipe', 'ignore', 'ignore'] });
      return { ok: true };
    } catch { /* try next */ }
  }
  return { ok: false, error: 'no clipboard tool available' };
}
