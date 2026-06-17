/// <reference lib="dom" />
import { useState, useEffect } from 'react';

// ---- Plugin identity ----
export const key   = 'condenser-plugin';
export const title = 'Condenser Plugin';
export const route = '/condenser-plugin/home';

// ---- Condenser API ----
const { navigate, back }              = condenser.nav;
const { showToast, showModal, Focusable, cls } = condenser.ui;
const { createStyleToggle, Target }   = condenser.css;

// ---- CSS examples ----
// Defined outside React so state survives navigation away and back.
//
// Cross-platform — stable IDs / aria-labels, and runtime webpack class lookup (Target.Library/Settings).
// BPM only       — Target.QuickAccess / Target.MainMenu (separate popup windows that don't exist on Desktop).

const examples = [
  // ---- Cross-platform (stable IDs / aria-labels) ----
  {
    label:    'Header bar',
    color:    '#ff6b6b',
    scope:    '#header',
    platform: 'both',
    type:     'StyleProperties',
    hint:     'Targets the stable #header ID — red outline on the top status bar',
    toggle:   createStyleToggle(key,
      { outline: '3px solid #ff6b6b', outlineOffset: '-3px' },
      { window: Target.BigPicture, scope: '#header' },
    ),
  },
  {
    label:    'Main content',
    color:    '#4fc3f7',
    scope:    '#Main',
    platform: 'both',
    type:     'StyleProperties',
    hint:     'Targets the stable #Main ID — blue outline around the whole content area',
    toggle:   createStyleToggle(key,
      { outline: '3px solid #4fc3f7', outlineOffset: '-3px' },
      { window: Target.BigPicture, scope: '#Main' },
    ),
  },
  {
    label:    'Recent Games',
    color:    '#ffcc80',
    scope:    '[aria-label="Recent Games"]',
    platform: 'both',
    type:     'StyleProperties',
    hint:     'Targets [aria-label="Recent Games"] — amber outline on the game grid',
    toggle:   createStyleToggle(key,
      { outline: '3px solid #ffcc80', outlineOffset: '-3px' },
      { window: Target.BigPicture, scope: '[aria-label="Recent Games"]' },
    ),
  },
  {
    label:    "What's New feed",
    color:    '#81c784',
    scope:    '[aria-label="What\'s New"]',
    platform: 'both',
    type:     'StyleProperties',
    hint:     "Targets [aria-label=\"What's New\"] — green outline on the news feed",
    toggle:   createStyleToggle(key,
      { outline: '3px solid #81c784', outlineOffset: '-3px' },
      { window: Target.BigPicture, scope: "[aria-label=\"What's New\"]" },
    ),
  },
  {
    label:    'Global (all windows)',
    color:    '#e0e0e0',
    scope:    'Target.Global',
    platform: 'both',
    type:     'StyleSheet',
    hint:     'Targets body in BigPicture + MainMenu + QuickAccess — switches all text to monospace font across every BPM window',
    toggle:   createStyleToggle(key,
      { 'body': { fontFamily: 'monospace' } },
      Target.Global,
    ),
  },
  {
    label:    'Quick Access popup',
    color:    '#80cbc4',
    scope:    'Target.QuickAccess',
    platform: 'both',
    type:     'StyleSheet',
    hint:     'Enable then open Quick Access — teal outline around the QAM panel',
    toggle:   createStyleToggle(key,
      { '#QuickAccess-Menu': { outline: '4px solid #80cbc4', outlineOffset: '-4px' } },
      Target.QuickAccess,
    ),
  },
  // ---- Section targets (runtime class lookup — works on Desktop and SteamOS) ----
  {
    label:    'Library section',
    color:    '#ce93d8',
    scope:    'Target.Library',
    platform: 'both',
    type:     'StyleProperties',
    hint:     'Purple outline on the Library root container — scope resolved at runtime from webpack classes',
    toggle:   createStyleToggle(key,
      { outline: '3px solid #ce93d8', outlineOffset: '-3px' },
      Target.Library,
    ),
  },
  {
    label:    'Settings dialog',
    color:    '#ef9a9a',
    scope:    'Target.Settings',
    platform: 'both',
    type:     'StyleSheet',
    hint:     'Pink tint on left nav column + lighter pink on right panel — scoped to .DialogContent_InnerWidth:has(.PageListColumn)',
    toggle:   createStyleToggle(key,
      {
        '.PageListColumn':       { outline: '3px solid rgba(239,154,154,0.3)', outlineOffset: '-3px' },
        '.DialogContentTransition': { outline: '3px solid rgba(111, 232, 232, 0.3)', outlineOffset: '-3px' },
      },
      Target.Settings,
    ),
  },
];

// ---- Lifecycle ----
export function onMount(): void {}

export function onUnmount(): void {
  examples.forEach(e => e.toggle.disable());
}

// ---- Page ----
export function Page(_: { websocketUrl: string }) {
  const send = condenser.plugin.useSend(key);
  const [_tick, setTick] = useState(0);
  const update = () => setTick(n => n + 1);

  const [count, setCount] = useState(0);
  const [info, setInfo] = useState<{ platform: string; uptime: number; memory: number } | null>(null);

  useEffect(() => {
    send('getCount').then((r: any) => setCount(r.count));
    send('getInfo').then((r: any) => setInfo(r)).catch(() => {});
  }, []);

  const allEnabled = examples.every(e => e.toggle.enabled);

  const handleMasterToggle = () => {
    if (allEnabled) {
      examples.forEach(e => e.toggle.disable());
    } else {
      examples.forEach(e => e.toggle.enable());
    }
    update();
  };

  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'white', overflowY: 'auto' }}>
      <button
        className={cls.btnSecondary}
        style={{ margin: '8px 16px', width: 'auto', alignSelf: 'flex-start' }}
        onClick={back}
      >← Back</button>

      <Focusable flow-children="column" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 16px 16px' }}>

        <SectionLabel>BACKEND</SectionLabel>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={cls.btnSecondary}
            style={{ width: 'auto' }}
            onClick={async () => {
              const r = await send('click') as { count: number };
              setCount(r.count);
            }}
          >{count > 0 ? `Send Request (${count})` : 'Send Request'}</button>

          <button
            className={cls.btnSecondary}
            style={{ width: 'auto' }}
            onClick={() => showModal(
              <p>Opened via showModal() from condenser.ui.</p>,
              undefined,
              { strTitle: 'Modal example' },
            )}
          >Show Modal</button>

          <button
            className={cls.btnSecondary}
            style={{ width: 'auto' }}
            onClick={() => showToast({ title, body: 'showToast() called from condenser.ui.', duration: 4000 })}
          >Show Toast</button>
        </div>

        {info && (
          <div style={{ fontSize: 12, color: 'var(--gpSystemLighterGrey)', paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span>Platform: {info.platform}</span>
            <span>Uptime: {fmt(info.uptime)}</span>
            <span>Free memory: {Math.round(info.memory / 1024 / 1024)} MB</span>
          </div>
        )}

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>CSS INJECTION EXAMPLES</SectionLabel>
          <button
            className={allEnabled ? cls.btnPrimary : cls.btnSecondary}
            style={{ fontSize: 11, padding: '3px 12px', width: 'auto' }}
            onClick={handleMasterToggle}
          >{allEnabled ? 'Disable All' : 'Enable All'}</button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px 12px',
          padding: '6px 0',
        }}>
          {examples.map(ex => (
            <div key={ex.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                flexShrink: 0,
                width: 10, height: 10,
                borderRadius: '50%',
                backgroundColor: ex.color,
              }} />
              <span style={{ fontSize: 12, color: 'var(--gpSystemLighterGrey)', lineHeight: 1.3 }}>{ex.label}</span>
            </div>
          ))}
        </div>

      </Focusable>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 'bold', letterSpacing: '0.08em', color: 'var(--gpSystemLighterGrey)', marginTop: 8, marginBottom: 2 }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />;
}

// ---- Persistent ----
// Always-visible button rendered over the Steam UI — opens the plugin page.
// Remove this export if your plugin doesn't need a persistent surface.
export function Persistent(_: { websocketUrl: string }) {
  return (
    <button
      onClick={() => navigate(route)}
      title={title}
      style={{
        position: 'fixed',
        top: '60px',
        right: '32px',
        background: 'rgba(0,0,0,0.7)',
        color: '#4fc3f7',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '4px 10px',
        borderRadius: '6px',
        border: '1px solid rgba(79,195,247,0.4)',
        cursor: 'pointer',
        zIndex: 9999,
      }}
    >{title}</button>
  );
}
