import React, { useState } from 'react';

interface Page {
  title: string;
  content: React.ReactNode;
  route?: string;
}

interface SidebarNavigationProps {
  pages: Page[];
  title?: string;
  showTitle?: boolean;
}

export function SidebarNavigation({ pages, title, showTitle }: SidebarNavigationProps) {
  const [active, setActive] = useState(0);

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <nav style={{
        width: 180,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0',
        gap: 2,
      }}>
        {showTitle && title && (
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a9bb5', padding: '0 16px 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </div>
        )}
        {pages.map((page, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              background: active === i ? 'rgba(102,192,244,0.12)' : 'transparent',
              border: 'none',
              borderLeft: active === i ? '3px solid #66c0f4' : '3px solid transparent',
              color: active === i ? '#e8f4ff' : '#9bb5cc',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: active === i ? 600 : 400,
              padding: '8px 16px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            {page.title}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {pages[active]?.content}
      </div>
    </div>
  );
}
