import React from 'react';

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  gap: 12,
};
const LABEL: React.CSSProperties = { fontSize: 13, color: '#c8dcea', flex: 1 };
const DESC: React.CSSProperties = { fontSize: 11, color: '#7a9bb5', marginTop: 2 };

interface FieldProps {
  label: string;
  description?: string;
  children?: React.ReactNode;
}

export function Field({ label, description, children }: FieldProps) {
  return (
    <div style={ROW}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={LABEL}>{label}</div>
        {description && <div style={DESC}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

export function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <Field label={label} description={description}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 20, height: 20, accentColor: '#66c0f4', cursor: 'pointer' }}
      />
    </Field>
  );
}

interface SliderFieldProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

export function SliderField({ label, description, value, min, max, step = 1, onChange }: SliderFieldProps) {
  return (
    <Field label={label} description={description}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: '#66c0f4', width: 140 }}
      />
      <span style={{ fontSize: 12, color: '#9bb5cc', minWidth: 28, textAlign: 'right' }}>{value}</span>
    </Field>
  );
}

interface TextFieldProps {
  label?: string;
  description?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function TextField({ label, description, value, onChange, placeholder }: TextFieldProps) {
  const input = (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(102,192,244,0.25)',
        borderRadius: 4,
        color: '#e8f4ff',
        fontSize: 13,
        padding: '5px 10px',
        width: '100%',
        outline: 'none',
      }}
    />
  );
  if (!label) return input;
  return <Field label={label} description={description}>{input}</Field>;
}
