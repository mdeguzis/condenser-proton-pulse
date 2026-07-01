import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function Button({ children, style, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        background: 'rgba(102,192,244,0.15)',
        border: '1px solid rgba(102,192,244,0.3)',
        borderRadius: 4,
        color: '#e8f4ff',
        cursor: 'pointer',
        fontSize: 13,
        padding: '6px 14px',
        textAlign: 'center',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
