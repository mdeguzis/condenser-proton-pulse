import { useState, useRef, useEffect } from 'react';

interface DropdownItemProps {
  label: string;
  data?: unknown;
  onSelected?: (item: DropdownItemProps) => void;
}

export function DropdownItem({ label, data, onSelected }: DropdownItemProps) {
  return (
    <div
      tabIndex={0}
      onClick={() => onSelected?.({ label, data })}
      onKeyDown={(e) => e.key === 'Enter' && onSelected?.({ label, data })}
      style={{
        padding: '8px 14px',
        cursor: 'pointer',
        fontSize: 13,
        color: '#c8dcea',
      }}
    >
      {label}
    </div>
  );
}

interface DropdownProps {
  label?: string;
  selectedOption?: unknown;
  rgOptions?: { label: string; data: unknown }[];
  onChange?: (item: { label: string; data: unknown }) => void;
  strDefaultLabel?: string;
}

export function Dropdown({ label, selectedOption, rgOptions = [], onChange, strDefaultLabel }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = rgOptions.find((o) => o.data === selectedOption);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 160 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(102,192,244,0.25)',
          borderRadius: 4,
          color: '#e8f4ff',
          cursor: 'pointer',
          fontSize: 13,
          padding: '6px 12px',
          width: '100%',
          textAlign: 'left',
        }}
      >
        {selected?.label ?? strDefaultLabel ?? label ?? 'Select...'}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#0f1a28',
          border: '1px solid rgba(102,192,244,0.25)',
          borderRadius: 4,
          zIndex: 999,
          maxHeight: 220,
          overflowY: 'auto',
        }}>
          {rgOptions.map((opt) => (
            <DropdownItem
              key={String(opt.data)}
              label={opt.label}
              data={opt.data}
              onSelected={() => { onChange?.(opt); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
