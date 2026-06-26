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

// Renders a visible highlight on any target without touching layout or blocking input.
// box-shadow:inset works on full-viewport elements (unlike outline) and doesn't
// create any overlay that could intercept gamepad scroll events.
// Note: on full-viewport flex containers, flex children with opaque backgrounds
// can paint over the inset shadow — use border+box-sizing:border-box in that case.
function overlayBorder(color: string) {
  return { boxShadow: `inset 0 0 0 3px ${color}` };
}

// The Steam Store is a cross-origin CEF window — JS cannot access its document.
// CSS is injected via the backend using CDP instead.
// _send is set once the Page component mounts.
let _send: ((action: string, data?: unknown) => Promise<unknown>) | null = null;

function createCdpToggle(css: string) {
  let _enabled = false;
  return {
    enable()  { if (!_enabled) { _enabled = true;  _send?.('injectStoreCss', { css }); } },
    disable() { if (_enabled)  { _enabled = false; _send?.('removeStoreCss'); } },
    get enabled() { return _enabled; },
  };
}

const examples = [
  {
    label:  'Global',
    color:  '#e0e0e0',
    toggle: createStyleToggle(key,
      { fontFamily: 'monospace' },
      Target.Global,
    ),
  },
  {
    label:  'Header',
    color:  '#ff6b6b',
    toggle: createStyleToggle(key,
      overlayBorder('#ff6b6b'),
      Target.Header,
    ),
  },
  {
    label:  'Quick Access',
    color:  '#80cbc4',
    toggle: createStyleToggle(key,
      overlayBorder('#80cbc4'),
      Target.QuickAccess,
    ),
  },
  {
    label:  'Settings',
    color:  '#ef9a9a',
    toggle: createStyleToggle(key,
      overlayBorder('#ef9a9a'),
      Target.Settings,
    ),
  },
  {
    label:  'Home',
    color:  '#81c784',
    toggle: createStyleToggle(key,
      overlayBorder('#81c784'),
      Target.Home,
    ),
  },
  {
    label:  'Detail',
    color:  '#ffb74d',
    toggle: createStyleToggle(key,
      overlayBorder('#ffb74d'),
      Target.GameDetail,
    ),
  },
  {
    label:  'Library',
    color:  '#ce93d8',
    toggle: createStyleToggle(key,
      overlayBorder('#ce93d8'),
      Target.Library,
    ),
  },
  {
    label:  'Store',
    color:  '#ff8a65',
    toggle: createCdpToggle(`body { box-shadow: inset 0 0 0 3px #ff8a65; }`),
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
  _send = send;
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'white', overflowY: 'auto', paddingTop: 40 }}>
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
