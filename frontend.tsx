/// <reference lib="dom" />
import { useState, useEffect } from 'react';
import { useSend, navigate, back, showToast, Focusable } from 'condenser:api';

// ---- Plugin identity ----
// key must be unique across all installed plugins and match the directory name.
export const key   = 'condenser-plugin';
export const title = 'Condenser Plugin';

// The route condenser will register for your main page inside Big Picture Mode.
export const route = '/condenser-plugin/home';

// ---- Page ----
// Full-screen page shown when the user opens your plugin.
export function Page(_: { websocketUrl: string }) {
  const send = useSend(key);
  const [info, setInfo] = useState<{ platform: string; uptime: number; memory: number } | null>(null);

  useEffect(() => {
    send('getInfo').then((r: any) => setInfo(r)).catch(() => {});
  }, []);

  const handleToast = () => showToast({ title, body: 'Hello from My Plugin!', duration: 3000 });

  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'white' }}>
      <button
        className="DialogButton _DialogLayout Secondary"
        style={{ margin: '8px 16px', width: 'auto', alignSelf: 'flex-start' }}
        onClick={back}
      >
        ← Back
      </button>
      <Focusable flow-children="column" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 16px' }}>
        <button className="DialogButton _DialogLayout Secondary" onClick={handleToast}>
          Show Toast
        </button>
        {info && (
          <div style={{ fontSize: 12, color: 'var(--gpSystemLighterGrey)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>Platform: {info.platform}</span>
            <span>Uptime: {fmt(info.uptime)}</span>
            <span>Free memory: {Math.round(info.memory / 1024 / 1024)} MB</span>
          </div>
        )}
      </Focusable>
    </div>
  );
}

// ---- Persistent ----
// Always-visible element rendered over the Steam UI (e.g. a status badge or button).
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
    >
      {title}
    </button>
  );
}
